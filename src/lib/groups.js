import { supabase } from './supabaseClient.js'

// El slug real de cada topic (el que usan InfanciasGroupHubPage y el
// checklist de /notas-profe/groups) es 'cuestionario' — pero el content
// type interno en Supabase (scope_key, content_items.content_type) es
// 'quiz'. Si un grupo se carga a mano por SQL en vez de por el panel (como
// pasó con los grupos de nivelación), es fácil escribir 'quiz' en la
// columna `topics` por costumbre y terminar con un grupo que no muestra
// ninguna tarjeta de actividad — el filtro de abajo no reconoce ese slug.
// Normalizamos acá, en el único lugar por donde entran los grupos, para
// que tanto el hub público como el editor de /notas-profe/groups queden
// bien sin importar cómo se haya cargado el dato.
const TOPIC_ALIASES = { quiz: 'cuestionario' }

function normalizeTopics(topics) {
  if (!Array.isArray(topics)) return topics
  const seen = new Set()
  const normalized = []
  for (const t of topics) {
    const slug = TOPIC_ALIASES[t] || t
    if (!seen.has(slug)) {
      seen.add(slug)
      normalized.push(slug)
    }
  }
  return normalized
}

// ─── Lectura (sitio público) ───────────────────────────────────────────

export async function fetchGroups() {
  const { data, error } = await supabase.from('groups').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return (data || []).map((g) => ({ ...g, topics: normalizeTopics(g.topics) }))
}

export async function fetchGroup(slug) {
  const { data, error } = await supabase.from('groups').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? { ...data, topics: normalizeTopics(data.topics) } : data
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

export async function reorderGroups(orderedGroups) {
  const results = await Promise.all(
    orderedGroups.map((g, i) => supabase.from('groups').update({ sort_order: i }).eq('id', g.id))
  )
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}
