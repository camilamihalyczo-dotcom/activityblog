// Helpers de texto compartidos entre las páginas públicas de "completar
// oraciones" (Adultos e Infancias).

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g')

// Quita mayúsculas y tildes para comparar respuestas escritas a mano sin
// ser tan estricto con el alumno.
export function normalizeAnswer(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
}

// `correctAnswer` puede traer más de una respuesta válida separada por "/".
export function isAnswerCorrect(userInput, correctAnswer) {
  const accepted = String(correctAnswer || '')
    .split('/')
    .map((a) => normalizeAnswer(a))
    .filter(Boolean)
  return accepted.includes(normalizeAnswer(userInput))
}

// Parte una oración tipo "I ___ working" en lo que va antes y después del
// espacio (marcado con 3 o más guiones bajos). Si no hay marca, el espacio
// se asume al final de la oración.
export function splitSentenceAtBlank(sentence) {
  const text = sentence || ''
  const match = text.match(/_{3,}/)
  if (!match) return { before: text, after: '' }
  return { before: text.slice(0, match.index), after: text.slice(match.index + match[0].length) }
}
