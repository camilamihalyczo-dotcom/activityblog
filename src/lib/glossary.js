import { supabase } from './supabaseClient.js'

// El glosario es 100% manual: solo aparecen las palabras que la profesora
// carga a mano desde /notas-profe/glosario (tabla `glossary_entries`). Ya
// no se completa solo con las flashcards — mezclaba cosas que no eran
// vocabulario suelto (preguntas, consignas, etc.) y quedaba muy largo. Se
// ordena siempre alfabéticamente.

function sortGlossary(entries) {
  return [...entries].sort((a, b) => a.word.localeCompare(b.word, 'es', { sensitivity: 'base' }))
}

// ─── Lectura (sitio público) ───────────────────────────────────────────

export async function fetchAdultosGlossary(levelSlug, trackSlug) {
  const { data, error } = await supabase
    .from('glossary_entries')
    .select('*')
    .eq('scope', 'adultos')
    .eq('level_slug', levelSlug)
    .eq('track_slug', trackSlug)
  if (error) throw error
  return sortGlossary(data || [])
}

export async function fetchInfanciasGlossary(groupSlug) {
  const { data, error } = await supabase
    .from('glossary_entries')
    .select('*')
    .eq('scope', 'infancias')
    .eq('group_slug', groupSlug)
  if (error) throw error
  return sortGlossary(data || [])
}

// Todas las entradas manuales, para el panel de administración.
export async function fetchGlossaryEntries() {
  const { data, error } = await supabase.from('glossary_entries').select('*').order('word', { ascending: true })
  if (error) throw error
  return data
}

// ─── Escritura (panel /notas-profe) ────────────────────────────────────

export async function saveGlossaryEntry(entry) {
  const payload = {
    scope: entry.scope,
    level_slug: entry.scope === 'adultos' ? entry.level_slug : null,
    track_slug: entry.scope === 'adultos' ? entry.track_slug : null,
    group_slug: entry.scope === 'infancias' ? entry.group_slug : null,
    word: entry.word.trim(),
    translation: entry.translation.trim(),
    example: entry.example?.trim() || null,
  }
  const { error } = entry.id
    ? await supabase.from('glossary_entries').update(payload).eq('id', entry.id)
    : await supabase.from('glossary_entries').insert(payload)
  if (error) throw error
}

export async function deleteGlossaryEntry(id) {
  const { error } = await supabase.from('glossary_entries').delete().eq('id', id)
  if (error) throw error
}

// ─── Importar desde CSV (panel /notas-profe) ───────────────────────────
// Parser chico a mano (soporta campos entre comillas con comas/comillas
// adentro, tipo lo que exporta Excel/Google Sheets) — no hace falta
// sumar una librería para 3 columnas.

function parseCsvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

const HEADER_WORDS = ['palabra', 'word']
const HEADER_TRANSLATIONS = ['traduccion', 'traducción', 'translation']

// Devuelve { entries, skipped } — `entries` son filas válidas (palabra +
// traducción), `skipped` cuenta filas vacías/incompletas que se ignoraron.
// Detecta sola si la primera fila es un encabezado (palabra/word,
// traducción/translation) y la salta; si no, la trata como dato.
export function parseGlossaryCsv(text) {
  const rows = parseCsvRows(text)
  if (rows.length === 0) return { entries: [], skipped: 0 }

  const [first] = rows
  const looksLikeHeader =
    HEADER_WORDS.includes((first[0] || '').trim().toLowerCase()) &&
    HEADER_TRANSLATIONS.includes((first[1] || '').trim().toLowerCase())
  const dataRows = looksLikeHeader ? rows.slice(1) : rows

  const entries = []
  let skipped = 0
  for (const row of dataRows) {
    const word = (row[0] || '').trim()
    const translation = (row[1] || '').trim()
    const example = (row[2] || '').trim()
    if (!word || !translation) {
      skipped++
      continue
    }
    entries.push({ word, translation, example: example || null })
  }
  return { entries, skipped }
}
