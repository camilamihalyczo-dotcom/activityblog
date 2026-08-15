import { supabase } from './supabaseClient.js'

// ─── Lectura (sitio público) ───────────────────────────────────────────

export async function fetchTracks() {
  const { data, error } = await supabase.from('tracks').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchTrack(slug) {
  const { data, error } = await supabase.from('tracks').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchTemarios(trackSlug) {
  const { data, error } = await supabase
    .from('temarios')
    .select('*')
    .eq('track_slug', trackSlug)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchTemario(trackSlug, temarioSlug) {
  const { data, error } = await supabase
    .from('temarios')
    .select('*')
    .eq('track_slug', trackSlug)
    .eq('slug', temarioSlug)
    .maybeSingle()
  if (error) throw error
  return data
}

// ─── Escritura (panel /notas-profe) ────────────────────────────────────

// `track.id` presente → update; ausente → insert. Se guarda por `slug`
// como clave natural (no se puede editar el slug de un track existente
// desde acá para no romper los enlaces ya compartidos con los alumnos).
export async function saveTrack(track) {
  const payload = {
    slug: track.slug.trim(),
    name: track.name.trim(),
    description: track.description.trim(),
    progression: track.progression.trim(),
    color_key: track.color_key,
    passcode: track.passcode.trim(),
    sort_order: track.sort_order ?? 0,
  }
  const { error } = track.id
    ? await supabase.from('tracks').update(payload).eq('id', track.id)
    : await supabase.from('tracks').insert(payload)
  if (error) throw error
}

export async function deleteTrack(id) {
  const { error } = await supabase.from('tracks').delete().eq('id', id)
  if (error) throw error
}

export async function saveTemario(temario) {
  const payload = {
    track_slug: temario.track_slug,
    slug: temario.slug.trim(),
    name: temario.name.trim(),
    description: temario.description.trim(),
    sort_order: temario.sort_order ?? 0,
  }
  const { error } = temario.id
    ? await supabase.from('temarios').update(payload).eq('id', temario.id)
    : await supabase.from('temarios').insert(payload)
  if (error) throw error
}

export async function deleteTemario(id) {
  const { error } = await supabase.from('temarios').delete().eq('id', id)
  if (error) throw error
}
