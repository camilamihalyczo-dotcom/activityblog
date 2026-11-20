// Importación de una semana completa de un curso desde un archivo JSON
// (panel → "Importar semana"). Un JSON = una semana = un temario del track:
//
// {
//   "course": "english-for-developers",   ← slug del track (tiene que existir)
//   "level": "a1-a2" | "b1-b2" | "c1-c2",
//   "week": 1,
//   "class": 1,                            ← opcional; si falta, se usa "week"
//   "temario": "technical-storytelling-metrics" ← opcional: cargar en un
//                temario/bloque que ya existe (se suma por clase) en vez de
//                crear "Week N"
//   "title": "The Stand-up Syntax",
//   "topic": "Present Simple vs Present Continuous",  ← opcional, subtítulo de la semana
//   "glossary": [{ "term", "meaning", "example" }],
//   "flashcards": [{ "front", "back" }],
//   "quiz": [{ "question", "options": [...], "answer": 1 | "texto", "hint" }],
//   "sentenceBuilder": [{ "blocks": [...], "answer": "I am working" }],
//   "fillBlanks": { "bank": [...], "items": [{ "text": "Our ___ is Friday.", "answer": "deadline" }] },
//   "listening": { "title", "script": [{ "speaker", "text" }], "audioUrl", "videoUrl",
//                  "questions": [{ "q", "a" } | { "q", "options", "answer" }] },
//   "readingWriting": { "title", "text", "questions": [...], "writingPrompt" },
//   "pronunciation": [{ "a", "b", "context" }],
//   "voiceLab": [{ "sentence", "keywords": [...], "tip" }]
// }
//
// listening y readingWriting aceptan también un array (varios por semana).
//
// English Kids Club: mismo formato, pero en vez de course/level/week va
//   "group": "aventureros"   ← slug del grupo
//   "unit": 4                ← número de unidad (también vale "class")
// y la unidad se SUMA a las actividades del grupo (no hay temarios), con
// códigos "Unidad 4 · Ej. 2". Si esa unidad ya estaba cargada, se puede
// reemplazar. Las actividades que el grupo
// no tenía activadas se activan solas.
// Cada actividad recibe un código visible para lxs alumnxs, "Clase 1 · Ej. 3",
// numerado en el orden de arriba; si una actividad trae varias tarjetas
// (ej. varios Voice Lab) van como 8a, 8b, 8c.
//
// Este módulo NO toca la UI: parseWeek → buildWeekPlan (valida y arma todo
// en los formatos que ya usa cada actividad) → importWeek (escribe).

import { LEVELS } from '../data/levels.js'
import { clearCache } from './cache.js'
import { buildAdultosScopeKey, buildInfanciasScopeKey, fetchContent, saveContent } from './content.js'
import { countBlanks, joinBankWords, sentenceIssues } from './fillBlank.js'
import { addGlossaryEntries, fetchAdultosGlossary, fetchInfanciasGlossary, saveGlossaryEntry } from './glossary.js'
import { supabase } from './supabaseClient.js'
import { classOfCode } from './exerciseCode.js'
import { fetchGroup } from './groups.js'
import { fetchTemarios, saveTemario } from './tracks.js'
import { parseYouTubeId } from './youtube.js'

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

const str = (v) => (v == null ? '' : String(v)).trim()
const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v])
const norm = (v) => str(v).toLowerCase().replace(/\s+/g, ' ')
const pad2 = (n) => String(n).padStart(2, '0')

// Orden fijo de las actividades (define la numeración "Ej. N").
export const WEEK_ACTIVITIES = [
  { key: 'flashcards', contentType: 'flashcards', label: 'Flashcards' },
  { key: 'quiz', contentType: 'quiz', label: 'Cuestionario' },
  { key: 'sentenceBuilder', contentType: 'sentence_builder', label: 'Sentence Builder' },
  { key: 'fillBlanks', contentType: 'fill_blank', label: 'Completar oraciones' },
  { key: 'listening', contentType: 'listening', label: 'Listening' },
  { key: 'readingWriting', contentType: 'reading_writing', label: 'Reading & Writing' },
  { key: 'pronunciation', contentType: 'pronunciation', label: 'Pronunciación' },
  { key: 'voiceLab', contentType: 'voice_lab', label: 'Voice Lab' },
]

export const temarioSlugForWeek = (week) => `week-${pad2(week)}`

export function parseWeek(text) {
  try {
    const data = JSON.parse(text)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'El archivo tiene que ser un objeto JSON ({ ... }), no una lista.' }
    return { data }
  } catch (err) {
    return { error: `El JSON no es válido: ${err.message}` }
  }
}

// ─── Conversión de cada bloque ────────────────────────────────────────
// Cada función recibe el bloque del JSON y `ctx` ({ title, err, warn }) y
// devuelve el array de ítems en el formato de esa actividad.

// "answer" puede venir como índice (0, 1, 2…) o como el texto de la opción.
function answerIndex(options, answer, where, ctx) {
  if (Number.isInteger(answer)) {
    if (answer >= 0 && answer < options.length) return answer
    ctx.err(`${where}: la respuesta ${answer} no existe (hay ${options.length} opciones, se cuentan desde 0).`)
    return null
  }
  const idx = options.findIndex((o) => norm(o) === norm(answer))
  if (idx === -1) ctx.err(`${where}: la respuesta correcta "${str(answer)}" no está entre las opciones.`)
  return idx === -1 ? null : idx
}

function convertQuestion(q, where, ctx) {
  const text = str(q.question ?? q.q)
  if (!text) ctx.err(`${where}: falta el texto de la pregunta.`)
  const options = arr(q.options).map(str)
  if (options.length === 0) {
    // Pregunta abierta: "a" es la respuesta modelo (la ve solo la profe).
    return { id: genId(), type: 'text', q: text, options: [], answer: null, modelAnswer: str(q.a ?? q.answer) || null, hint: str(q.hint), image_url: null }
  }
  if (options.length < 2) ctx.err(`${where}: necesita al menos 2 opciones.`)
  if (options.some((o) => !o)) ctx.err(`${where}: hay una opción vacía.`)
  const answer = answerIndex(options, q.answer ?? q.a, where, ctx)
  return { id: genId(), type: 'multiple_choice', q: text, options, answer: answer ?? 0, hint: str(q.hint), image_url: null }
}

const converters = {
  flashcards(block, ctx) {
    const cards = arr(block).map((c, i) => {
      const front = str(c.front ?? c.term)
      const back = str(c.back ?? c.meaning)
      if (!front || !back) ctx.err(`Flashcard ${i + 1}: falta el frente o el dorso.`)
      return { front, back, image_url: null }
    })
    return cards.length ? [{ cards }] : []
  },

  quiz(block, ctx) {
    // Array de preguntas → un cuestionario. También acepta { title, questions }.
    const quizzes = Array.isArray(block) && block.length && (block[0].questions || block[0].title) && !block[0].question ? block : Array.isArray(block) ? [{ questions: block }] : [block]
    return quizzes.map((quiz, qi) => {
      const questions = arr(quiz.questions).map((q, i) => {
        const converted = convertQuestion(q, `Cuestionario, pregunta ${i + 1}`, ctx)
        if (converted.type === 'text') ctx.err(`Cuestionario, pregunta ${i + 1}: el cuestionario necesita opciones (las preguntas abiertas van en Listening o Reading).`)
        return converted
      })
      if (!questions.length) ctx.err(`Cuestionario ${qi + 1}: no tiene preguntas.`)
      return { id: genId(), title: str(quiz.title) || `${ctx.title} — Quiz`, questions }
    })
  },

  sentenceBuilder(block, ctx) {
    const list = Array.isArray(block) ? block : arr(block.sentences)
    const sentences = list.map((s, i) => {
      const blocks = arr(s.blocks).map(str).filter(Boolean)
      if (blocks.length < 2) ctx.err(`Sentence Builder ${i + 1}: necesita al menos 2 bloques.`)
      const correctOrder = orderFromAnswer(blocks, s.answer, `Sentence Builder ${i + 1}`, ctx)
      return { id: genId(), blocks, correctOrder }
    })
    return sentences.length ? [{ id: genId(), title: str(block.title) || `${ctx.title} — Sentence Builder`, sentences }] : []
  },

  fillBlanks(block, ctx) {
    const bank = arr(block.bank).map(str).filter(Boolean)
    const wordBank = bank.length > 0
    const remaining = [...bank] // se van sacando las que son respuesta
    const sentences = arr(block.items).map((it, i) => {
      const sentence = str(it.text ?? it.sentence)
      const answers = Array.isArray(it.answer) ? it.answer.map(str) : [str(it.answer)]
      const item = wordBank
        ? { id: genId(), sentence, options: [], answer: joinBankWords(answers), image_url: null }
        : { id: genId(), sentence, options: arr(it.options).map(str), answer: answers.join('/'), image_url: null }
      if (!wordBank && countBlanks(sentence) > 1 && answers.length > 1) {
        ctx.err(`Completar ${i + 1}: varios espacios en una oración necesitan un "bank" (banco de palabras).`)
      }
      for (const issue of sentenceIssues(item, { wordBank })) ctx.err(`Completar ${i + 1}: ${issue}`)
      if (wordBank) {
        for (const a of answers) {
          const at = remaining.findIndex((w) => norm(w) === norm(a))
          if (at === -1) ctx.err(`Completar ${i + 1}: la respuesta "${a}" no está en el banco de palabras.`)
          else remaining.splice(at, 1)
        }
      }
      return item
    })
    if (!sentences.length) return []
    // Lo que sobra del banco queda como palabras distractoras.
    const distractors = wordBank ? remaining : []
    return [{ id: genId(), title: str(block.title) || `${ctx.title} — Completar oraciones`, instructions: str(block.instructions), wordBank, distractors, sentences }]
  },

  listening(block, ctx) {
    return arr(block).map((l, li) => {
      const script = arr(l.script).map((line) => ({ speaker: str(line.speaker), text: str(line.text) })).filter((line) => line.text)
      const transcript = script.length ? script.map((line) => (line.speaker ? `${line.speaker}: ${line.text}` : line.text)).join('\n') : str(l.transcript)
      const videoUrl = str(l.videoUrl)
      const youtubeId = videoUrl ? parseYouTubeId(videoUrl) || '' : ''
      const audioUrl = str(l.audioUrl)
      if (videoUrl && !youtubeId && !/^https?:\/\//i.test(videoUrl)) ctx.err(`Listening ${li + 1}: "videoUrl" no es un link válido.`)
      if (audioUrl && !/^https?:\/\//i.test(audioUrl)) ctx.err(`Listening ${li + 1}: "audioUrl" no es un link válido.`)
      if (!audioUrl && !videoUrl && !transcript) ctx.err(`Listening ${li + 1}: no tiene audio, video ni guion para escuchar.`)
      const questions = arr(l.questions).map((q, i) => convertQuestion(q, `Listening ${li + 1}, pregunta ${i + 1}`, ctx))
      if (!questions.length) ctx.warn(`Listening ${li + 1}: no tiene preguntas.`)
      return {
        id: genId(),
        title: str(l.title) || `${ctx.title} — Listening`,
        youtubeId,
        videoUrl: youtubeId ? '' : videoUrl,
        audioUrl,
        transcript,
        image_url: null,
        questions,
      }
    })
  },

  readingWriting(block, ctx) {
    const items = []
    arr(block).forEach((rw, ri) => {
      const n = arr(block).length > 1 ? ` ${ri + 1}` : ''
      if (str(rw.text)) {
        const questions = arr(rw.questions).map((q, i) => convertQuestion(q, `Reading${n}, pregunta ${i + 1}`, ctx))
        items.push({ id: genId(), type: 'reading', title: str(rw.title) || `${ctx.title} — Reading`, text: str(rw.text), image_url: null, questions, part: 'reading' })
      } else if (arr(rw.questions).length) {
        ctx.err(`Reading${n}: tiene preguntas pero falta el "text".`)
      }
      if (str(rw.writingPrompt)) {
        items.push({ id: genId(), type: 'writing', title: str(rw.writingTitle) || `${ctx.title} — Writing`, prompt: str(rw.writingPrompt), image_url: null, part: 'writing' })
      }
    })
    return items
  },

  pronunciation(block, ctx) {
    const list = Array.isArray(block) ? block : arr(block.pairs)
    const pairs = list.map((p, i) => {
      const words = (p.words ? arr(p.words) : [p.a, p.b]).map(str).filter(Boolean)
      if (words.length < 2) ctx.err(`Pronunciación ${i + 1}: necesita las dos palabras ("a" y "b").`)
      return { id: genId(), words, hint: str(p.context ?? p.hint) }
    })
    return pairs.length ? [{ id: genId(), title: str(block.title) || `${ctx.title} — Pronunciación`, instructions: str(block.instructions), pairs }] : []
  },

  voiceLab(block, ctx) {
    return arr(block).map((v, i) => {
      const sentence = str(v.sentence)
      const keywords = arr(v.keywords).map(str).filter(Boolean)
      if (!sentence) ctx.err(`Voice Lab ${i + 1}: falta la oración.`)
      const words = new Set(sentence.toLowerCase().split(/\s+/).map((w) => w.replace(/[.,/#!$%^&*;:{}=[\]"'’‘“”…()_`~?-]/g, '')))
      for (const k of keywords) {
        if (!words.has(k.toLowerCase().replace(/[.,/#!$%^&*;:{}=[\]"'’‘“”…()_`~?-]/g, '')))
          ctx.err(`Voice Lab ${i + 1}: la palabra clave "${k}" no está en la oración.`)
      }
      if (!keywords.length) ctx.warn(`Voice Lab ${i + 1}: no tiene palabras clave (no se va a poder completar).`)
      for (const k of keywords) {
        if (/-/.test(k) || /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred)\b/i.test(k) && /-/.test(k))
          ctx.warn(`Voice Lab ${i + 1}: "${k}" tiene guion; el reconocimiento de voz suele escribirlo separado o como número, así que puede no marcarse nunca.`)
      }
      return { id: genId(), title: str(v.title) || `${ctx.title} — Voice Lab${arr(block).length > 1 ? ` ${i + 1}` : ''}`, sentence, keywords, phoneticTip: str(v.tip ?? v.phoneticTip) }
    })
  },
}

// Ordena los bloques según la respuesta. Acepta bloques de varias
// palabras ("am working") y respeta repetidos. Si no hay "answer", se
// asume que los bloques ya vienen en el orden correcto.
export function orderFromAnswer(blocks, answer, where, ctx) {
  const identity = blocks.map((_, i) => i)
  if (!str(answer)) {
    ctx.warn(`${where}: no tiene "answer"; se toma el orden de los bloques como correcto.`)
    return identity
  }
  const clean = (t) => norm(t).replace(/[.!?]+$/, '')
  let rest = clean(answer)
  const used = new Set()
  const order = []
  while (rest) {
    let best = -1
    blocks.forEach((b, i) => {
      if (used.has(i)) return
      const piece = clean(b)
      if (!piece || !rest.startsWith(piece)) return
      const next = rest.charAt(piece.length)
      if (next && next !== ' ' && !/[.,!?;:]/.test(next)) return
      if (best === -1 || piece.length > clean(blocks[best]).length) best = i
    })
    if (best === -1) {
      ctx.err(`${where}: la respuesta "${str(answer)}" no se puede armar con los bloques (falta "${rest.split(' ')[0]}").`)
      return identity
    }
    used.add(best)
    order.push(best)
    rest = rest.slice(clean(blocks[best]).length).replace(/^[\s.,!?;:]+/, '')
  }
  if (order.length !== blocks.length) {
    const extra = blocks.filter((_, i) => !used.has(i))
    ctx.err(`${where}: sobran bloques que no están en la respuesta: ${extra.join(', ')}.`)
    return identity
  }
  return order
}

// ─── Plan de importación ──────────────────────────────────────────────

// Actividad → tema del grupo (Kids): el grupo muestra solo los temas
// activados en Grupos; el importador activa los que trae el archivo.
const KIDS_TOPIC_FOR = {
  flashcards: 'flashcards',
  quiz: 'cuestionario',
  sentence_builder: 'sentence-builder',
  fill_blank: 'completar',
  listening: 'listening',
  reading_writing: 'reading-writing',
  pronunciation: 'pronunciacion',
  voice_lab: 'voice-lab',
}


// Valida el JSON y lo convierte. Si trae "group" es una clase de English
// Kids Club; si no, una semana de Adultos (course + level + week).
// `tracks` / `groups` = listas del panel. Devuelve { errors, warnings, plan };
// si hay errores no se importa.
export function buildWeekPlan(data, { tracks = [], groups = [] } = {}) {
  const errors = []
  const warnings = []
  const kids = data.group != null && data.group !== ''
  const title = str(data.title)
  let classNum
  let header = {}

  if (kids) {
    const groupSlug = str(data.group)
    const group = groups.find((g) => g.slug === groupSlug)
    if (!group)
      errors.push(`"group": "${groupSlug}" no coincide con ningún grupo. Grupos que existen: ${groups.map((g) => g.slug).join(', ') || '(ninguno)'}.`)
    // En Kids la clase es la unidad de la semana: vale "unit" o "class".
    classNum = Number(data.unit ?? data.class)
    if (!Number.isInteger(classNum) || classNum < 1) errors.push('"unit" (o "class") tiene que ser un número entero (1, 2, 3…): es el número de unidad del grupo.')
    for (const k of ['course', 'level', 'week']) if (data[k] != null) warnings.push(`Se ignora "${k}": en Kids alcanza con "group" y "unit".`)
    header = { scope: 'infancias', groupSlug, groupName: group?.name || groupSlug, group: group || null }
  } else {
    const level = str(data.level).toLowerCase()
    const course = str(data.course)
    // "temario" (opcional): cargar dentro de un temario/bloque que YA existe
    // (ej. "technical-storytelling-metrics") en vez de crear "Week N".
    const fixedTemario = str(data.temario)
    const week = data.week == null || data.week === '' ? NaN : Number(data.week)
    classNum = data.class == null || data.class === '' ? week : Number(data.class)
    if (!LEVELS.some((l) => l.slug === level))
      errors.push(`"level": "${data.level ?? ''}" no existe. Tiene que ser uno de: ${LEVELS.map((l) => l.slug).join(', ')}.`)
    const track = tracks.find((t) => t.slug === course)
    if (!course) errors.push('Falta "course" (el slug del track/curso), o "group" si es una unidad de English Kids Club.')
    else if (!track)
      errors.push(`"course": "${course}" no coincide con ningún track. Tracks que existen: ${tracks.map((t) => t.slug).join(', ') || '(ninguno)'}. Crealo primero en Tracks o corregí el slug.`)
    if (!fixedTemario && (!Number.isInteger(week) || week < 1)) errors.push('"week" tiene que ser un número entero (1, 2, 3…).')
    if (!Number.isInteger(classNum) || classNum < 1)
      errors.push(fixedTemario ? 'Con "temario" hace falta "class" (o "week"): el número de clase dentro del bloque.' : '"class" tiene que ser un número entero (o no ponerlo y se usa el de "week").')
    header = {
      scope: 'adultos',
      level,
      levelName: LEVELS.find((l) => l.slug === level)?.code || level,
      course,
      trackName: track?.name || course,
      week,
      fixedTemario: Boolean(fixedTemario),
      temarioSlug: fixedTemario || (Number.isInteger(week) ? temarioSlugForWeek(week) : ''),
      // Con temario fijo, el nombre real se completa en inspectExisting.
      temarioName: fixedTemario || `Week ${week} · ${title}`,
    }
  }
  if (!title) errors.push(`Falta "title" (el nombre de la ${kids ? 'unidad' : 'semana'}).`)
  const unitWord = kids ? 'Unidad' : 'Clase'

  const known = new Set(['course', 'level', 'week', 'temario', 'group', 'class', 'unit', 'title', 'description', 'topic', 'glossary', ...WEEK_ACTIVITIES.map((a) => a.key)])
  for (const key of Object.keys(data)) if (!known.has(key)) warnings.push(`Se ignora "${key}": no es un bloque conocido.`)

  const activities = []
  let n = 0
  for (const def of WEEK_ACTIVITIES) {
    const block = data[def.key]
    if (block == null || (Array.isArray(block) && block.length === 0)) continue
    const ctx = { title: title || `${unitWord} ${classNum}`, err: (m) => errors.push(m), warn: (m) => warnings.push(m) }
    let items = converters[def.key](block, ctx)
    if (!items.length) continue
    n += 1
    // Código visible: "Clase 1 · Ej. 3" (con letra si la actividad trae varias tarjetas).
    const multi = items.length > 1
    items = items.map((it, i) => ({ ...it, code: `${unitWord} ${classNum} · Ej. ${n}${multi ? String.fromCharCode(97 + i) : ''}` }))
    if (def.key === 'flashcards') {
      // Flashcards se guarda como lista plana de tarjetas (todas con el código).
      const code = items[0].code
      items = items[0].cards.map((card) => ({ ...card, code }))
    }
    activities.push({ ...def, number: n, items })
  }

  const glossary = arr(data.glossary).map((g, i) => {
    const word = str(g.term ?? g.word)
    const translation = str(g.meaning ?? g.translation)
    if (!word || !translation) errors.push(`Glosario ${i + 1}: falta "term" o "meaning".`)
    return { word, translation, example: str(g.example) }
  })

  if (!activities.length && !glossary.length) errors.push('El archivo no trae ninguna actividad.')

  // Kids: actividades que el grupo todavía no muestra y se van a activar.
  const topicsToEnable =
    kids && header.group
      ? [...new Set(activities.map((a) => KIDS_TOPIC_FOR[a.contentType]))].filter((t) => !(header.group.topics || []).includes(t))
      : []

  return {
    errors,
    warnings,
    plan: {
      ...header,
      classNum,
      title,
      // "topic" (ej. el tema gramatical) se usa como subtítulo.
      description: str(data.description) || str(data.topic),
      activities,
      glossary,
      topicsToEnable,
    },
  }
}

// Se suma por clase (y "reemplazar" = solo esa clase) en Kids y cuando la
// semana va dentro de un temario/bloque que ya existe.
const classMode = (plan) => plan.scope === 'infancias' || plan.fixedTemario

const scopeKeyFor = (plan, contentType) =>
  plan.scope === 'infancias'
    ? buildInfanciasScopeKey(plan.groupSlug, contentType)
    : buildAdultosScopeKey(plan.level, plan.course, plan.temarioSlug, contentType)

const saveFor = (plan, contentType, data) =>
  saveContent(
    plan.scope === 'infancias'
      ? { scopeKey: scopeKeyFor(plan, contentType), scope: 'infancias', groupSlug: plan.groupSlug, contentType, data }
      : { scopeKey: scopeKeyFor(plan, contentType), scope: 'adultos', levelSlug: plan.level, trackSlug: plan.course, temarioSlug: plan.temarioSlug, contentType, data }
  )

// Qué hay ya cargado (para preguntar si se pisa o se suma).
// Adultos: si el temario de esa semana ya tiene actividades.
// Kids: si esa clase (mismo número) ya está cargada en el grupo.
export async function inspectExisting(plan) {
  clearCache()
  const filled = {}
  let temario = null
  if (plan.fixedTemario) {
    const temarios = await fetchTemarios(plan.course)
    temario = temarios.find((t) => t.slug === plan.temarioSlug) || null
    if (!temario) return { filled, hasContent: false, missingTemario: true, available: temarios.map((t) => t.slug) }
    plan.temarioName = temario.name
  }
  if (classMode(plan)) {
    await Promise.all(
      plan.activities.map(async (a) => {
        const data = await fetchContent(scopeKeyFor(plan, a.contentType), a.contentType)
        const same = (Array.isArray(data) ? data : []).filter((it) => classOfCode(it.code) === plan.classNum)
        if (same.length) filled[a.contentType] = same.length
      })
    )
    return { temario, filled, hasContent: Object.keys(filled).length > 0 }
  }
  const temarios = await fetchTemarios(plan.course)
  temario = temarios.find((t) => t.slug === plan.temarioSlug) || null
  if (temario) {
    await Promise.all(
      plan.activities.map(async (a) => {
        const data = await fetchContent(scopeKeyFor(plan, a.contentType), a.contentType)
        if (Array.isArray(data) && data.length) filled[a.contentType] = data.length
      })
    )
  }
  return { temario, filled, hasContent: Object.keys(filled).length > 0, temarioCount: temarios.length }
}

// Ordena por número de clase (lo que no tiene código queda primero, en su
// orden), así las clases de Kids se ven en orden aunque se carguen salteadas.
const byClass = (items) =>
  items
    .map((it, i) => ({ it, i, c: classOfCode(it.code) ?? -1 }))
    .sort((a, b) => a.c - b.c || a.i - b.i)
    .map((x) => x.it)

// Escribe todo.
// Adultos — mode 'replace': pisa cada actividad que trae la semana;
//           'append': suma a lo que ya hay.
// Kids    — siempre se suma a lo del grupo; con 'replace', antes se sacan
//           los ítems de esa misma clase (para corregir una clase ya cargada).
// El glosario nunca se borra: se suman las palabras nuevas y, en modo
// reemplazar, se actualizan las que ya estaban.
export async function importWeek(plan, mode = 'replace') {
  clearCache()
  const kids = plan.scope === 'infancias'
  const byClassMode = classMode(plan)
  let createdTemario = false
  if (plan.fixedTemario) {
    const temarios = await fetchTemarios(plan.course)
    if (!temarios.some((t) => t.slug === plan.temarioSlug)) throw new Error(`El temario "${plan.temarioSlug}" no existe en ${plan.trackName}.`)
  } else if (!kids) {
    const temarios = await fetchTemarios(plan.course)
    if (!temarios.some((t) => t.slug === plan.temarioSlug)) {
      await saveTemario({ track_slug: plan.course, slug: plan.temarioSlug, name: plan.temarioName, description: plan.description, sort_order: plan.week })
      createdTemario = true
    }
  }

  const written = []
  for (const a of plan.activities) {
    let data = a.items
    if (byClassMode || mode === 'append') {
      clearCache()
      let existing = await fetchContent(scopeKeyFor(plan, a.contentType), a.contentType)
      existing = Array.isArray(existing) ? existing : []
      if (byClassMode && mode === 'replace') existing = existing.filter((it) => classOfCode(it.code) !== plan.classNum)
      data = byClassMode ? byClass([...existing, ...a.items]) : [...existing, ...a.items]
    }
    await saveFor(plan, a.contentType, data)
    written.push({ label: a.label, count: a.items.length })
  }

  let enabledTopics = []
  if (kids) {
    // Se relee el grupo recién ahora, por si se cambió algo desde la vista previa.
    clearCache()
    const group = await fetchGroup(plan.groupSlug)
    const current = group?.topics || []
    const missing = [...new Set(plan.activities.map((a) => KIDS_TOPIC_FOR[a.contentType]))].filter((t) => !current.includes(t))
    if (group?.id != null && missing.length) {
      const { error } = await supabase.from('groups').update({ topics: [...current, ...missing] }).eq('id', group.id)
      if (error) throw error
      enabledTopics = missing
    }
  }

  let glossaryAdded = 0
  let glossaryUpdated = 0
  if (plan.glossary.length) {
    const existing = kids ? await fetchInfanciasGlossary(plan.groupSlug) : await fetchAdultosGlossary(plan.level, plan.course)
    const byWord = new Map(existing.map((e) => [norm(e.word), e]))
    const seen = new Set()
    const toAdd = []
    for (const g of plan.glossary) {
      const key = norm(g.word)
      if (seen.has(key)) continue
      seen.add(key)
      const prev = byWord.get(key)
      const base = kids
        ? { scope: 'infancias', group_slug: plan.groupSlug, word: g.word, translation: g.translation, example: g.example }
        : { scope: 'adultos', level_slug: plan.level, track_slug: plan.course, word: g.word, translation: g.translation, example: g.example }
      if (!prev) toAdd.push(base)
      else if (mode === 'replace' && (norm(prev.translation) !== norm(g.translation) || norm(prev.example) !== norm(g.example))) {
        await saveGlossaryEntry({ ...base, id: prev.id, word: prev.word })
        glossaryUpdated += 1
      }
    }
    await addGlossaryEntries(toAdd)
    glossaryAdded = toAdd.length
  }
  clearCache()
  return { createdTemario, written, glossaryAdded, glossaryUpdated, enabledTopics }
}

// Ejemplo descargable desde el panel (misma forma que la Semana 1).
export const WEEK_TEMPLATE = {
  course: 'english-for-developers',
  level: 'b1-b2',
  week: 1,
  class: 1,
  title: 'The Stand-up Syntax',
  glossary: [{ term: 'blocker', meaning: 'obstáculo que traba tu avance', example: 'I have a major blocker.' }],
  flashcards: [{ front: 'blocker', back: 'obstáculo' }],
  quiz: [{ question: 'We ___ a standup every morning.', options: ['are having', 'have', 'has'], answer: 1 }],
  sentenceBuilder: [{ blocks: ['I', 'am', 'working'], answer: 'I am working' }],
  fillBlanks: { bank: ['deadline', 'sprint'], items: [{ text: 'Our ___ is Friday.', answer: 'deadline' }] },
  listening: {
    script: [
      { speaker: 'Sam', text: 'Good morning, everyone. Priya, how is it going?' },
      { speaker: 'Priya', text: "I'm stuck on the login bug. It's a blocker for me." },
    ],
    audioUrl: null,
    videoUrl: null,
    questions: [{ q: 'Who is stuck?', a: 'Priya' }, { q: 'What is the problem?', options: ['A login bug', 'A meeting'], answer: 0 }],
  },
  readingWriting: { text: '...', questions: [{ q: '...', a: '...' }], writingPrompt: '...' },
  pronunciation: [{ a: 'right', b: 'write', context: 'Right now, I write tests.' }],
  voiceLab: [{ sentence: 'Every day, our team has a standup.', keywords: ['team', 'standup'], tip: '...' }],
}

export const KIDS_CLASS_TEMPLATE = {
  group: 'aventureros',
  unit: 1,
  title: 'My Pets',
  topic: 'Animals + have got',
  glossary: [{ term: 'dog', meaning: 'perro', example: 'I have got a dog.' }],
  flashcards: [{ front: 'cat', back: 'gato' }, { front: 'dog', back: 'perro' }],
  quiz: [{ question: 'A ___ says "meow".', options: ['dog', 'cat', 'fish'], answer: 'cat' }],
  sentenceBuilder: [{ blocks: ['I', 'have got', 'a', 'dog.'], answer: 'I have got a dog.' }],
  fillBlanks: { bank: ['cat', 'fish'], items: [{ text: 'My ___ can swim.', answer: 'fish' }] },
  listening: {
    title: 'Pet Song',
    script: [{ speaker: 'Teacher', text: 'I have got a cat. My cat is black.' }],
    audioUrl: null,
    videoUrl: null,
    questions: [{ q: 'What color is the cat?', options: ['black', 'white'], answer: 0 }],
  },
  readingWriting: { text: 'Tom has got a dog. His dog is big and brown.', questions: [{ q: 'Is the dog big?', options: ['Yes', 'No'], answer: 0 }], writingPrompt: 'Contá cómo es tu mascota (o la que te gustaría tener).' },
  pronunciation: [{ a: 'cat', b: 'cut', context: 'The cat can cut the paper.' }],
  voiceLab: [{ sentence: 'I have got a big dog.', keywords: ['big', 'dog'], tip: '"Dog" suena /dɒɡ/, con o corta.' }],
}
