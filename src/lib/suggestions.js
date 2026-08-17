import emailjs from '@emailjs/browser'

// Las 3 claves de EmailJS son públicas por diseño (están pensadas para vivir
// en el navegador) — igual que la anon key de Supabase, no son secretas.
// Ver supabase/README.md, "Fase 7" para cómo conseguirlas.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const suggestionsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

// Manda una sugerencia por email vía EmailJS. No pasa por Supabase ni queda
// guardada en ningún lado de la app — solo llega a la casilla que configuraste
// como destino del template en EmailJS.
export async function sendSuggestion({ message, name, contact, page }) {
  if (!suggestionsConfigured) {
    throw new Error('El formulario de sugerencias todavía no está configurado.')
  }
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      message: message.trim(),
      name: name?.trim() || 'Anónimo',
      contact: contact?.trim() || '(no dejó contacto)',
      page,
    },
    { publicKey: PUBLIC_KEY }
  )
}
