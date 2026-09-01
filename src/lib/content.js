import { supabase } from './supabaseClient.js'

// El contenido de estudio (flashcards, quiz, listening, reading&writing) se
// guarda como un blob JSON por combinación de "dónde vive" + "qué tipo de
// contenido es" (ver supabase/schema_phase2.sql, tabla content_items). El
// `scope_key` identifica esa combinación de forma única.

export const EMPTY_CONTENT_BY_TYPE = {
  flashcards: [],
  // `quiz` es un array de cuestionarios (cada uno con su propio título y
  // preguntas) — un temario/grupo puede tener más de uno, igual que
  // Listening o Reading & Writing.
  quiz: [],
  listening: [],
  reading_writing: [],
  fill_blank: [],
  synonyms_antonyms: [],
  pronunciation: [],
}

export function buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, contentType) {
  return `adultos:${levelSlug}:${trackSlug}:${temarioSlug}:${contentType}`
}

export function buildInfanciasScopeKey(groupSlug, contentType) {
  return `infancias:${groupSlug}:${contentType}`
}

export async function fetchContent(scopeKey, contentType) {
  const { data, error } = await supabase.from('content_items').select('data').eq('scope_key', scopeKey).maybeSingle()
  if (error) throw error
  let value = data ? data.data : EMPTY_CONTENT_BY_TYPE[contentType]

  // Migración: `quiz` guardaba antes un único objeto {title, questions} en
  // vez de un array de cuestionarios. Si queda contenido viejo con esa
  // forma, lo envolvemos acá para que tanto la página pública como el
  // panel de edición (que ya esperan un array) lo sigan mostrando bien —
  // se termina de migrar solo la próxima vez que se guarde desde el panel.
  if (contentType === 'quiz' && value && !Array.isArray(value)) {
    value = value.questions?.length ? [{ id: 'legacy', ...value }] : []
  }

  // Migración: `fill_blank` guardaba antes un array plano de oraciones
  // sueltas (cada una con `sentence`/`answer` directo) en vez de un array
  // de ejercicios con título + varias oraciones cada uno. Si el array
  // trae oraciones sueltas (se nota porque tienen `sentence` en vez de
  // `sentences`), las envolvemos en un solo ejercicio sin título.
  if (contentType === 'fill_blank' && Array.isArray(value) && value.length > 0 && value[0].sentences === undefined) {
    value = [{ id: 'legacy', title: '', sentences: value }]
  }

  return value
}

// Trae los 4 tipos de contenido de un temario (Adultos) en paralelo.
export async function fetchAdultosContentBundle(levelSlug, trackSlug, temarioSlug) {
  const [flashcards, quiz, listening, readingWriting] = await Promise.all([
    fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'flashcards'), 'flashcards'),
    fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'quiz'), 'quiz'),
    fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'listening'), 'listening'),
    fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'reading_writing'), 'reading_writing'),
  ])
  return { flashcards, quiz, listenings: listening, readingWriting }
}

// Trae los 4 tipos de contenido de un grupo (Infancias) en paralelo.
export async function fetchInfanciasContentBundle(groupSlug) {
  const [flashcards, quiz, listening, readingWriting] = await Promise.all([
    fetchContent(buildInfanciasScopeKey(groupSlug, 'flashcards'), 'flashcards'),
    fetchContent(buildInfanciasScopeKey(groupSlug, 'quiz'), 'quiz'),
    fetchContent(buildInfanciasScopeKey(groupSlug, 'listening'), 'listening'),
    fetchContent(buildInfanciasScopeKey(groupSlug, 'reading_writing'), 'reading_writing'),
  ])
  return { flashcards, quiz, listenings: listening, readingWriting }
}

// Trae todos los content_items guardados y devuelve el conjunto de
// scope_key que tienen contenido real cargado (no vacío), para el panel
// de "qué falta". Una sola consulta en vez de una por combinación.
export async function fetchAllContentStatus() {
  const { data, error } = await supabase.from('content_items').select('scope_key, content_type, data')
  if (error) throw error
  const filled = new Set()
  for (const row of data) {
    // `quiz` es un array de cuestionarios desde hace poco — pero puede
    // quedar alguna fila vieja sin migrar todavía (guardada como un único
    // objeto {title, questions}), así que soportamos las dos formas acá.
    const hasContent =
      row.content_type === 'quiz' && !Array.isArray(row.data)
        ? Boolean(row.data && row.data.questions && row.data.questions.length > 0)
        : Array.isArray(row.data) && row.data.length > 0
    if (hasContent) filled.add(row.scope_key)
  }
  return filled
}

// ─── Escritura (panel /notas-profe) ────────────────────────────────────

export async function saveContent({ scopeKey, scope, levelSlug, trackSlug, temarioSlug, groupSlug, contentType, data }) {
  const payload = {
    scope_key: scopeKey,
    scope,
    level_slug: levelSlug ?? null,
    track_slug: trackSlug ?? null,
    temario_slug: temarioSlug ?? null,
    group_slug: groupSlug ?? null,
    content_type: contentType,
    data,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('content_items').upsert(payload, { onConflict: 'scope_key' })
  if (error) throw error
}
