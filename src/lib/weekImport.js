// Importación de una semana completa de un curso desde un archivo JSON
// (panel → "Importar semana"). Un JSON = una semana = un temario del track:
//
// {
//   "course": "english-for-developers",   ← slug del track (tiene que existir)
//   "level": "a1-a2" | "b1-b2" | "c1-c2",
//   "week": 1,
//   "class": 1,                            ← opcional; si falta, se usa "week"
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
// Cada actividad recibe un código visible para lxs alumnxs, "Clase 1 · Ej. 3",
// numerado en el orden de arriba; si una actividad trae varias tarjetas
// (ej. varios Voice Lab) van como 8a, 8b, 8c.
//
// Este módulo NO toca la UI: parseWeek → buildWeekPlan (valida y arma todo
// en los formatos que ya usa cada actividad) → importWeek (escribe).

import { LEVELS } from '../data/levels.js'
import { clearCache } from './cache.js'
import { buildAdultosScopeKey, fetchContent, saveContent } from './content.js'
import { countBlanks, joinBankWords, sentenceIssues } from './fillBlank.js'
import { addGlossaryEntries, fetchAdultosGlossary, saveGlossaryEntry } from './glossary.js'
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
      const words = new Set(sentence.toLowerCase().split(/\s+/).map((w) => w.replace(/[.,/#!$%^&*;:{}=[\]"'()_`~?-]/g, '')))
      for (const k of keywords) {
        if (!words.has(k.toLowerCase().replace(/[.,/#!$%^&*;:{}=[\]"'()_`~?-]/g, '')))
          ctx.err(`Voice Lab ${i + 1}: la palabra clave "${k}" no está en la oración.`)
      }
      if (!keywords.length) ctx.warn(`Voice Lab ${i + 1}: no tiene palabras clave (no se va a poder completar).`)
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

// Valida el JSON y lo convierte. `tracks` = lista de tracks del panel.
// Devuelve { errors, warnings, plan } — si hay errores no se importa.
export function buildWeekPlan(data, { tracks = [] } = {}) {
  const errors = []
  const warnings = []
  const level = str(data.level).toLowerCase()
  const course = str(data.course)
  const week = Number(data.week)
  const classNum = data.class == null || data.class === '' ? week : Number(data.class)
  const title = str(data.title)

  if (!LEVELS.some((l) => l.slug === level))
    errors.push(`"level": "${data.level ?? ''}" no existe. Tiene que ser uno de: ${LEVELS.map((l) => l.slug).join(', ')}.`)
  const track = tracks.find((t) => t.slug === course)
  if (!course) errors.push('Falta "course" (el slug del track/curso).')
  else if (!track)
    errors.push(`"course": "${course}" no coincide con ningún track. Tracks que existen: ${tracks.map((t) => t.slug).join(', ') || '(ninguno)'}. Crealo primero en Tracks o corregí el slug.`)
  if (!Number.isInteger(week) || week < 1) errors.push('"week" tiene que ser un número entero (1, 2, 3…).')
  if (!Number.isInteger(classNum) || classNum < 1) errors.push('"class" tiene que ser un número entero (o no ponerlo y se usa el de "week").')
  if (!title) errors.push('Falta "title" (el nombre de la semana).')

  const known = new Set(['course', 'level', 'week', 'class', 'title', 'description', 'topic', 'glossary', ...WEEK_ACTIVITIES.map((a) => a.key)])
  for (const key of Object.keys(data)) if (!known.has(key)) warnings.push(`Se ignora "${key}": no es un bloque conocido.`)

  const activities = []
  let n = 0
  for (const def of WEEK_ACTIVITIES) {
    const block = data[def.key]
    if (block == null || (Array.isArray(block) && block.length === 0)) continue
    const ctx = { title: title || `Week ${week}`, err: (m) => errors.push(m), warn: (m) => warnings.push(m) }
    let items = converters[def.key](block, ctx)
    if (!items.length) continue
    n += 1
    // Código visible: "Clase 1 · Ej. 3" (con letra si la actividad trae varias tarjetas).
    const multi = items.length > 1
    items = items.map((it, i) => ({ ...it, code: `Clase ${classNum} · Ej. ${n}${multi ? String.fromCharCode(97 + i) : ''}` }))
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

  return {
    errors,
    warnings,
    plan: {
      level,
      levelName: LEVELS.find((l) => l.slug === level)?.code || level,
      course,
      trackName: track?.name || course,
      week,
      classNum,
      title,
      // "topic" (ej. el tema gramatical) se usa como subtítulo del temario.
      description: str(data.description) || str(data.topic),
      temarioSlug: Number.isInteger(week) ? temarioSlugForWeek(week) : '',
      temarioName: `Week ${week} · ${title}`,
      activities,
      glossary,
    },
  }
}

// Qué hay ya cargado en ese temario (para preguntar si se pisa o se suma).
export async function inspectExisting(plan) {
  clearCache()
  const temarios = await fetchTemarios(plan.course)
  const temario = temarios.find((t) => t.slug === plan.temarioSlug) || null
  const filled = {}
  if (temario) {
    await Promise.all(
      plan.activities.map(async (a) => {
        const data = await fetchContent(buildAdultosScopeKey(plan.level, plan.course, plan.temarioSlug, a.contentType), a.contentType)
        if (Array.isArray(data) && data.length) filled[a.contentType] = data.length
      })
    )
  }
  return { temario, filled, hasContent: Object.keys(filled).length > 0, temarioCount: temarios.length }
}

// Escribe todo. mode: 'replace' (pisa cada actividad de la semana) o
// 'append' (suma a lo que ya hay). El glosario es del nivel+track (no de la
// semana), así que nunca se borra: se suman las palabras nuevas y, en modo
// reemplazar, se actualizan las que ya estaban.
export async function importWeek(plan, mode = 'replace') {
  clearCache()
  const temarios = await fetchTemarios(plan.course)
  let createdTemario = false
  if (!temarios.some((t) => t.slug === plan.temarioSlug)) {
    await saveTemario({ track_slug: plan.course, slug: plan.temarioSlug, name: plan.temarioName, description: plan.description, sort_order: plan.week })
    createdTemario = true
  }

  const written = []
  for (const a of plan.activities) {
    const scopeKey = buildAdultosScopeKey(plan.level, plan.course, plan.temarioSlug, a.contentType)
    let data = a.items
    if (mode === 'append') {
      clearCache()
      const existing = await fetchContent(scopeKey, a.contentType)
      data = [...(Array.isArray(existing) ? existing : []), ...a.items]
    }
    await saveContent({ scopeKey, scope: 'adultos', levelSlug: plan.level, trackSlug: plan.course, temarioSlug: plan.temarioSlug, contentType: a.contentType, data })
    written.push({ label: a.label, count: a.items.length })
  }

  let glossaryAdded = 0
  let glossaryUpdated = 0
  if (plan.glossary.length) {
    const existing = await fetchAdultosGlossary(plan.level, plan.course)
    const byWord = new Map(existing.map((e) => [norm(e.word), e]))
    const seen = new Set()
    const toAdd = []
    for (const g of plan.glossary) {
      const key = norm(g.word)
      if (seen.has(key)) continue
      seen.add(key)
      const prev = byWord.get(key)
      const base = { scope: 'adultos', level_slug: plan.level, track_slug: plan.course, word: g.word, translation: g.translation, example: g.example }
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
  return { createdTemario, written, glossaryAdded, glossaryUpdated }
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
