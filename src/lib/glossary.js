import { supabase } from './supabaseClient.js'

// El glosario combina dos fuentes: las flashcards ya cargadas (se arma
// solo, sin trabajo extra) y las entradas sueltas de `glossary_entries`
// (cargadas a mano desde /notas-profe/glosario). Si una palabra está en
// las dos, gana la manual — es la más específica/actualizada.

function mergeGlossary(fromFlashcards, manual) {
  const map = new Map()
  for (const item of fromFlashcards) {
    const key = item.word.trim().toLowerCase()
    if (!key) continue
    map.set(key, item)
  }
  for (const item of manual) {
    const key = item.word.trim().toLowerCase()
    if (!key) continue
    map.set(key, item)
  }
  return Array.from(map.values()).sort((a, b) => a.word.localeCompare(b.word, 'es', { sensitivity: 'base' }))
}

// ─── Lectura (sitio público) ───────────────────────────────────────────

// Glosario de un track dentro de un nivel: junta las flashcards de TODOS
// los temarios de ese track para ese nivel (no solo uno), más las
// entradas manuales cargadas para ese mismo nivel+track.
export async function fetchAdultosGlossary(levelSlug, trackSlug) {
  const [flashResult, manualResult] = await Promise.all([
    supabase
      .from('content_items')
      .select('data')
      .eq('scope', 'adultos')
      .eq('level_slug', levelSlug)
      .eq('track_slug', trackSlug)
      .eq('content_type', 'flashcards'),
    supabase
      .from('glossary_entries')
      .select('*')
      .eq('scope', 'adultos')
      .eq('level_slug', levelSlug)
      .eq('track_slug', trackSlug),
  ])
  if (flashResult.error) throw flashResult.error
  if (manualResult.error) throw manualResult.error

  const fromFlashcards = (flashResult.data || [])
    .flatMap((row) => row.data || [])
    .map((card) => ({ word: card.front, translation: card.back, example: null, source: 'flashcards' }))
  const manual = (manualResult.data || []).map((e) => ({ ...e, source: 'manual' }))

  return mergeGlossary(fromFlashcards, manual)
}

// Glosario de un grupo (Infancias): junta sus flashcards + entradas
// manuales cargadas para ese grupo.
export async function fetchInfanciasGlossary(groupSlug) {
  const [flashResult, manualResult] = await Promise.all([
    supabase
      .from('content_items')
      .select('data')
      .eq('scope', 'infancias')
      .eq('group_slug', groupSlug)
      .eq('content_type', 'flashcards'),
    supabase.from('glossary_entries').select('*').eq('scope', 'infancias').eq('group_slug', groupSlug),
  ])
  if (flashResult.error) throw flashResult.error
  if (manualResult.error) throw manualResult.error

  const fromFlashcards = (flashResult.data || [])
    .flatMap((row) => row.data || [])
    .map((card) => ({ word: card.front, translation: card.back, example: null, source: 'flashcards' }))
  const manual = (manualResult.data || []).map((e) => ({ ...e, source: 'manual' }))

  return mergeGlossary(fromFlashcards, manual)
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
