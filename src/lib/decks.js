import { supabase } from './supabaseClient.js'

// Presentaciones de clase y glosarios (tabla class_decks, ver
// supabase/schema_phase10_class_decks.sql).

const LIST_COLUMNS = 'id, kind, scope, template, color_key, title, student, share_token, created_at, updated_at'

export async function fetchDecks() {
  const { data, error } = await supabase.from('class_decks').select(LIST_COLUMNS).order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchDeck(id) {
  const { data, error } = await supabase.from('class_decks').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createDeck(deck) {
  const { data, error } = await supabase
    .from('class_decks')
    .insert({
      kind: deck.kind,
      scope: deck.scope,
      template: deck.template,
      color_key: deck.color_key,
      title: deck.title || '',
      student: deck.student || null,
      data: deck.data || {},
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function saveDeck(deck) {
  const { error } = await supabase
    .from('class_decks')
    .update({
      color_key: deck.color_key,
      title: deck.title || '',
      student: deck.student || null,
      data: deck.data || {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', deck.id)
  if (error) throw error
}

export async function deleteDeck(id) {
  const { error } = await supabase.from('class_decks').delete().eq('id', id)
  if (error) throw error
}

export async function duplicateDeck(id) {
  const original = await fetchDeck(id)
  if (!original) throw new Error('No se encontró la clase.')
  return createDeck({ ...original, title: `${original.title || 'Sin título'} (copia)` })
}

// Lectura pública por link privado (sin login).
export async function fetchDeckByToken(token) {
  const { data, error } = await supabase.rpc('get_class_deck', { p_token: token })
  if (error) throw error
  return Array.isArray(data) ? data[0] || null : data
}

export function deckPublicUrl(token) {
  return `${window.location.origin}/clase/${token}`
}
