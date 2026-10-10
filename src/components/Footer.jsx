import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquarePlus, ChevronUp, ChevronDown, Send } from 'lucide-react'
import { SUGGESTION_CATEGORIES, sendSuggestion } from '../lib/suggestions.js'

// Pie común de las páginas públicas con el formulario de sugerencias. En
// Infancias usa la estética de English Kids Club; en el resto, la de
// Adultos. Las sugerencias quedan guardadas en Supabase y se leen en
// /notas-profe/sugerencias.

const MAX = 2000

const STYLES = {
  adultos: {
    footer: 'border-t-2 border-dashed border-ink/15 bg-cream/60',
    toggle: 'text-ink/60 hover:text-ink',
    toggleLabel: 'font-mono text-xs uppercase tracking-widest',
    text: 'text-ink/70',
    field: 'rounded-lg border-2 border-ink/15 bg-paper focus:border-brand',
    chip: 'rounded-full border-2 font-medium',
    chipOn: 'bg-ink text-cream border-ink',
    chipOff: 'border-ink/15 text-ink/70 hover:border-ink/40',
    button: 'bg-ink text-cream rounded-lg hover:bg-brand',
    ok: 'text-olive',
    bad: 'text-stamp',
    muted: 'text-ink/50',
  },
  infancias: {
    footer: 'border-t-2 border-dashed border-kidsInk/15 bg-kidsCream/60',
    toggle: 'text-kidsInk/70 hover:text-kidsInk',
    toggleLabel: 'font-playful font-semibold text-xs uppercase tracking-wide',
    text: 'font-playful text-kidsInk/75',
    field: 'rounded-xl border-2 border-kidsInk/15 bg-white font-playful focus:border-kidsPurpleDeep',
    chip: 'rounded-full border-2 font-playful font-semibold',
    chipOn: 'bg-kidsInk text-white border-kidsInk',
    chipOff: 'border-kidsInk/15 text-kidsInk/75 hover:border-kidsInk/40',
    button: 'bg-kidsInk text-white rounded-full font-playful hover:bg-kidsPurpleDeep',
    ok: 'font-playful text-kidsGreenDeep',
    bad: 'font-playful text-kidsRed',
    muted: 'font-playful text-kidsInk/50',
  },
}

export default function Footer() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('idea')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [website, setWebsite] = useState('') // trampa anti-spam: los humanos no la ven
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // null | 'ok' | 'error'

  // El panel de administración tiene su propio layout (y no se publicita).
  if (location.pathname.startsWith('/notas-profe')) return null

  const s = STYLES[location.pathname.startsWith('/infancias') ? 'infancias' : 'adultos']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    // Si se completó el campo oculto es un bot: se simula el envío.
    if (website) {
      setResult('ok')
      return
    }
    setSending(true)
    setResult(null)
    try {
      await sendSuggestion({ category, message, name, contact, page: location.pathname })
      setResult('ok')
      setMessage('')
      setName('')
      setContact('')
      setCategory('idea')
    } catch {
      setResult('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <footer className={`${s.footer} mt-16`}>
      <div className="max-w-2xl mx-auto px-5 py-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="sugerencias-form"
          className={`w-full flex items-center justify-between gap-3 transition-colors ${s.toggle}`}
        >
          <span className={`flex items-center gap-2 ${s.toggleLabel}`}>
            <MessageSquarePlus size={15} /> Sugerencias
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div id="sugerencias-form" className="mt-4">
            {result === 'ok' ? (
              <div className="py-2">
                <p className={`${s.ok} font-semibold`}>¡Gracias! Tu sugerencia ya nos llegó.</p>
                <button type="button" onClick={() => setResult(null)} className={`${s.text} text-sm underline mt-2`}>
                  Enviar otra
                </button>
              </div>
            ) : (
              <>
                <p className={`${s.text} text-sm mb-4`}>
                  ¿Algo que mejorarías de la página o de las actividades? ¿Encontraste un error? Contanos.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Tipo de sugerencia">
                    {Object.entries(SUGGESTION_CATEGORIES).map(([key, c]) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={category === key}
                        onClick={() => setCategory(key)}
                        className={`px-3 py-1.5 text-xs transition-colors ${s.chip} ${category === key ? s.chipOn : s.chipOff}`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <textarea
                      required
                      rows={3}
                      maxLength={MAX}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      aria-label="Tu sugerencia"
                      placeholder={
                        category === 'bug'
                          ? '¿Qué pasó? ¿En qué actividad? Ej: "En Completar oraciones no me deja poner la última palabra"'
                          : 'Tu sugerencia o comentario…'
                      }
                      className={`w-full px-3 py-2 text-sm resize-y outline-none transition-colors ${s.field}`}
                    />
                    {message.length > MAX * 0.8 && (
                      <p className={`${s.muted} text-xs text-right`}>
                        {message.length} / {MAX}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={120}
                      aria-label="Tu nombre (opcional)"
                      placeholder="Tu nombre (opcional)"
                      className={`flex-1 min-w-[160px] px-3 py-2 text-sm outline-none transition-colors ${s.field}`}
                    />
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      maxLength={160}
                      aria-label="Mail o WhatsApp (opcional)"
                      placeholder="Mail o WhatsApp (opcional, por si querés respuesta)"
                      className={`flex-1 min-w-[160px] px-3 py-2 text-sm outline-none transition-colors ${s.field}`}
                    />
                  </div>
                  {/* Campo trampa para bots: invisible y fuera del orden de tabulación. */}
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] w-px h-px opacity-0"
                  />
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className={`inline-flex items-center gap-2 font-semibold px-5 py-2.5 transition-colors disabled:opacity-50 ${s.button}`}
                    >
                      <Send size={15} /> {sending ? 'Enviando…' : 'Enviar'}
                    </button>
                    {result === 'error' && <p className={`${s.bad} text-sm`}>No se pudo enviar. Probá de nuevo en un rato.</p>}
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
