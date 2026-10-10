// Lógica de "Completar oraciones" compartida entre el sitio (Adultos e
// Infancias) y el editor del panel, para que los dos interpreten igual
// cómo se cargó cada oración.
import { isAnswerCorrect, normalizeAnswer, splitSentenceAtBlanks } from './text.js'

// Un espacio es "___" (tres o más guiones bajos).
export function countBlanks(sentence) {
  return splitSentenceAtBlanks(sentence).length - 1
}

// En modo banco compartido, la respuesta guarda una palabra por espacio,
// en orden, separadas por "|": "role | agricultural sector".
// IMPORTANTE: se conservan las posiciones vacías ("a | | c") para que una
// palabra que falta no corra a las siguientes a otro espacio.
export function parseBankWords(answer) {
  if (Array.isArray(answer)) return answer.map((w) => String(w ?? '').trim())
  const raw = String(answer ?? '')
  if (raw.trim() === '') return []
  return raw.split('|').map((w) => w.trim())
}

export function joinBankWords(words) {
  // Se recortan los vacíos del final (espacios que se borraron), pero no
  // los del medio, que marcan una posición.
  const trimmed = [...words]
  while (trimmed.length && !String(trimmed[trimmed.length - 1] ?? '').trim()) trimmed.pop()
  return trimmed.map((w) => String(w ?? '').trim()).join(' | ')
}

export function parseDistractors(value) {
  if (Array.isArray(value)) return value.map((w) => String(w).trim()).filter(Boolean)
  return String(value ?? '')
    .split(/[,|]/)
    .map((w) => w.trim())
    .filter(Boolean)
}

// Modo "opciones por oración" o "texto libre".
export function isItemCorrect(item, userAnswer) {
  if ((item.options || []).length > 0) return userAnswer === item.answer
  return userAnswer != null && isAnswerCorrect(userAnswer, item.answer)
}

// Modo banco compartido: cada oración aporta una ficha por espacio, y se
// pueden sumar palabras distractoras (que no van en ningún lado). La
// corrección compara el TEXTO de la ficha con la palabra esperada (sin
// mayúsculas ni tildes): si una palabra se repite ("the" en dos oraciones)
// cualquiera de las dos fichas vale en cualquiera de los dos espacios.
export function buildWordBankData(sentences, distractors = []) {
  const items = []
  const chips = []
  const slots = []
  for (const s of sentences || []) {
    const segments = splitSentenceAtBlanks(s.sentence)
    const blankCount = segments.length - 1
    if (blankCount === 0) continue
    const words = parseBankWords(s.answer)
    const blanks = []
    for (let bi = 0; bi < blankCount; bi++) {
      const word = words[bi]
      if (!word) {
        blanks.push(null)
        continue
      }
      const slotId = `${s.id}-s${bi}`
      chips.push({ id: `${s.id}-c${bi}`, text: word })
      slots.push({ id: slotId, sentenceId: s.id, blankIndex: bi, expected: word })
      blanks.push(slotId)
    }
    items.push({ id: s.id, sentence: s.sentence, image_url: s.image_url, segments, blanks })
  }
  parseDistractors(distractors).forEach((word, i) => chips.push({ id: `distractor-${i}`, text: word, distractor: true }))
  return { items, chips, slots }
}

export function isChipCorrectForSlot(chip, slot) {
  return Boolean(chip) && normalizeAnswer(chip.text) === normalizeAnswer(slot.expected)
}

// ─── Validación para el panel ─────────────────────────────────────────
// Devuelve una lista de avisos legibles; vacía = está todo bien.

export function sentenceIssues(item, { wordBank }) {
  const issues = []
  const sentence = item.sentence || ''
  if (!sentence.trim()) return ['Falta escribir la oración.']
  const blanks = countBlanks(sentence)
  if (blanks === 0) issues.push('La oración no tiene ningún espacio: marcalo con ___ (tres guiones bajos).')

  if (wordBank) {
    const words = parseBankWords(item.answer)
    for (let i = 0; i < blanks; i++) {
      if (!words[i]) issues.push(`Falta la palabra del espacio ${i + 1}.`)
    }
    const extra = words.slice(blanks).filter(Boolean)
    if (extra.length) issues.push(`Sobran palabras que no tienen espacio: ${extra.join(', ')}.`)
    if (words.some((w) => w.includes('/')))
      issues.push('En el banco compartido cada espacio lleva una sola palabra (no se pueden poner alternativas con "/").')
  } else {
    if (blanks > 1)
      issues.push('Este modo usa un solo espacio por oración. Para varios espacios, activá el banco de palabras compartido.')
    const options = item.options || []
    if (options.length > 0) {
      if (options.some((o) => !String(o).trim())) issues.push('Hay opciones vacías.')
      if (!item.answer || !options.includes(item.answer)) issues.push('Marcá cuál es la opción correcta.')
    } else {
      if (!String(item.answer || '').trim()) issues.push('Falta la respuesta correcta.')
      if (String(item.answer || '').includes('|'))
        issues.push('La respuesta tiene "|" (formato del banco compartido). En este modo, separá respuestas válidas con "/".')
    }
  }
  return issues
}
