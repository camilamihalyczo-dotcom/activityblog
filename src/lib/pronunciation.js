// Lógica de la actividad de Pronunciación ("parejas que suenan igual").
// Formato guardado (content_items.data):
//   [{ id, title, instructions, pairs: [{ id, words: ['ship','sheep'], hint }] }]
// Cada "pareja" puede tener 2 palabras (o 3+, si querés tríos). El alumno
// escucha las palabras, las arrastra al tablero de a pares y después se
// corrige: una fila está bien si sus palabras son exactamente las de
// alguna pareja cargada (en cualquier orden y en cualquier fila).
import { normalizeAnswer } from './text.js'

// Antes la actividad guardaba un único ejercicio como array plano de
// grupos ({ id, words, hint }). Se envuelve en un ejercicio sin título.
export function normalizePronunciationContent(value) {
  if (!Array.isArray(value) || value.length === 0) return []
  if (value[0] && value[0].pairs === undefined && Array.isArray(value[0].words)) {
    return [{ id: 'legacy', title: '', instructions: '', pairs: value }]
  }
  return value
}

export function cleanPairs(pairs) {
  return (pairs || [])
    .map((p) => ({ ...p, words: (p.words || []).map((w) => String(w || '').trim()).filter(Boolean) }))
    .filter((p) => p.words.length >= 2)
}

const key = (words) =>
  words
    .map((w) => normalizeAnswer(w))
    .sort()
    .join('␟')

// Arma el tablero: una fila por pareja (con tantos casilleros como palabras
// tenga) y una ficha por palabra.
export function buildPairsBoard(exercise) {
  const pairs = cleanPairs(exercise.pairs)
  const chips = pairs.flatMap((p) => p.words.map((w, wi) => ({ id: `${p.id}-w${wi}`, text: w, pairId: p.id })))
  // Las filas se ordenan por tamaño (los pares primero) para no dar pistas
  // de qué palabras van juntas.
  const rows = pairs
    .map((p) => p.words.length)
    .sort((a, b) => a - b)
    .map((size, ri) => ({ id: `row-${ri}`, slots: Array.from({ length: size }, (_, si) => `row-${ri}-s${si}`) }))
  return { pairs, chips, rows }
}

// Devuelve la pareja cargada que coincide con las palabras de la fila, o null.
export function matchRow(rowWords, pairs) {
  if (rowWords.some((w) => !w)) return null
  const k = key(rowWords)
  return pairs.find((p) => key(p.words) === k) || null
}

// Avisos para el panel.
export function pairIssues(pair, allPairs) {
  const issues = []
  const words = (pair.words || []).map((w) => String(w || '').trim()).filter(Boolean)
  if (words.length < 2) issues.push('Cada pareja necesita al menos 2 palabras.')
  const others = new Set(
    allPairs.filter((p) => p.id !== pair.id).flatMap((p) => (p.words || []).map((w) => normalizeAnswer(w)).filter(Boolean))
  )
  const repeated = words.filter((w) => others.has(normalizeAnswer(w)))
  if (repeated.length)
    issues.push(`"${repeated.join('", "')}" también está en otra pareja: el alumno no va a saber con cuál va.`)
  return issues
}
