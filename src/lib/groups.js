import { supabase } from './supabaseClient.js'

// ─── Lectura (sitio público) ───────────────────────────────────────────

export async function fetchGroups() {
  const { data, error } = await supabase.from('groups').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchGroup(slug) {
  const { data, error } = await supabase.from('groups').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

// ─── Escritura (panel /notas-profe) ────────────────────────────────────

export async function saveGroup(group) {
  const payload = {
    slug: group.slug.trim(),
    name: group.name.trim(),
    age_range: group.age_range.trim(),
    description: group.description.trim(),
    color_key: group.color_key,
    milestone: Number(group.milestone) || 0,
    passcode: group.passcode.trim(),
    topics: group.topics,
    sort_order: group.sort_order ?? 0,
  }
  const { error } = group.id
    ? await supabase.from('groups').update(payload).eq('id', group.id)
    : await supabase.from('groups').insert(payload)
  if (error) throw error
}

export async function deleteGroup(id) {
  const { error } = await supabase.from('groups').delete().eq('id', id)
  if (error) throw error
}
