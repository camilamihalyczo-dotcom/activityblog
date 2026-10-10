import emailjs from '@emailjs/browser'
import { supabase } from './supabaseClient.js'

// Sugerencias del pie de página. Se guardan en Supabase (tabla
// `suggestions`, ver supabase/schema_phase11_suggestions.sql) y se leen en
// /notas-profe/sugerencias. Si además están configuradas las claves de
// EmailJS (opcionales, ver .env.example), también llega un mail.

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const emailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export const SUGGESTION_CATEGORIES = {
  idea: { label: 'Idea o mejora', emoji: '💡' },
  bug: { label: 'Algo no funciona', emoji: '🐞' },
  content: { label: 'Sobre el contenido', emoji: '📚' },
}

const scopeFromPage = (page) => (page.startsWith('/infancias') ? 'infancias' : page.startsWith('/adultos') ? 'adultos' : 'general')

export async function sendSuggestion({ message, name, contact, page, category = 'idea' }) {
  const row = {
    category,
    message: message.trim().slice(0, 2000),
    name: name?.trim().slice(0, 120) || null,
    contact: contact?.trim().slice(0, 160) || null,
    page: page.slice(0, 300),
    scope: scopeFromPage(page),
  }
  const { error } = await supabase.from('suggestions').insert(row)

  // El mail es un extra: si falla, no se le muestra error al alumno
  // siempre que haya quedado guardada en Supabase.
  let mailed = false
  if (emailConfigured) {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          message: `${SUGGESTION_CATEGORIES[category]?.emoji || ''} ${row.message}`.trim(),
          name: row.name || 'Anónimo',
          contact: row.contact || '(no dejó contacto)',
          page,
        },
        { publicKey: PUBLIC_KEY }
      )
      mailed = true
    } catch (err) {
      console.warn('[sugerencias] no se pudo mandar el mail:', err)
    }
  }
  if (error && !mailed) throw error
}

// ─── Panel ────────────────────────────────────────────────────────────

export async function fetchSuggestions() {
  const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false }).limit(300)
  if (error) throw error
  return data || []
}

export async function updateSuggestionStatus(id, status) {
  const { error } = await supabase.from('suggestions').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteSuggestion(id) {
  const { error } = await supabase.from('suggestions').delete().eq('id', id)
  if (error) throw error
}

export async function countNewSuggestions() {
  const { count, error } = await supabase.from('suggestions').select('id', { count: 'exact', head: true }).eq('status', 'new')
  if (error) return null
  return count
}
