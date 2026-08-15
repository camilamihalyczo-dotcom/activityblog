import { supabase } from './supabaseClient.js'

// El contenido de estudio (flashcards, quiz, listening, reading&writing) se
// guarda como un blob JSON por combinación de "dónde vive" + "qué tipo de
// contenido es" (ver supabase/schema_phase2.sql, tabla content_items). El
// `scope_key` identifica esa combinación de forma única.

export const EMPTY_CONTENT_BY_TYPE = {
  flashcards: [],
  quiz: null,
  listening: [],
  reading_writing: [],
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
  return data ? data.data : EMPTY_CONTENT_BY_TYPE[contentType]
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
