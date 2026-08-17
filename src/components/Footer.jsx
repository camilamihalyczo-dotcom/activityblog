import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquarePlus, ChevronUp, ChevronDown, Send } from 'lucide-react'
import { sendSuggestion, suggestionsConfigured } from '../lib/suggestions.js'

export default function Footer() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // null | 'ok' | 'error'

  // El panel de administración tiene su propio layout y no es a propósito
  // fácil de encontrar (ver supabase/README.md) — no le sumamos acá un
  // formulario de cara al público.
  if (location.pathname.startsWith('/notas-profe')) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    try {
      await sendSuggestion({ message, name, contact, page: location.pathname })
      setResult('ok')
      setMessage('')
      setName('')
      setContact('')
    } catch {
      setResult('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <footer className="border-t-2 border-dashed border-ink/15 bg-cream/60 mt-16">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 text-ink/60 hover:text-ink transition-colors"
        >
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
            <MessageSquarePlus size={15} /> Sugerencias
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div className="mt-4">
            {!suggestionsConfigured ? (
              <p className="text-ink/50 text-sm">Este formulario todavía no está activado.</p>
            ) : (
              <>
                <p className="text-ink/60 text-sm mb-4">
                  ¿Algo que mejorarías de la página o de las actividades? Contanos, nos llega directo por mail.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tu sugerencia o comentario…"
                    className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y focus:border-brand outline-none transition-colors"
                  />
                  <div className="flex gap-3 flex-wrap">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre (opcional)"
                      className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm focus:border-brand outline-none transition-colors"
                    />
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Mail o WhatsApp (opcional, por si querés respuesta)"
                      className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm focus:border-brand outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="inline-flex items-center gap-2 bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
                    >
                      <Send size={15} /> {sending ? 'Enviando…' : 'Enviar'}
                    </button>
                    {result === 'ok' && <p className="text-olive text-sm">¡Gracias! Ya nos llegó.</p>}
                    {result === 'error' && (
                      <p className="text-stamp text-sm">No se pudo enviar. Probá de nuevo en un rato.</p>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </footer>
  )
}
