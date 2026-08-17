import { useState } from 'react'
import { Lock, MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '../lib/contact.js'

export default function PasswordGate({ target, onUnlock, title, subtitle }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === target.passcode.toLowerCase()) {
      setError(false)
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16 sm:py-24">
      <div className="texture-card rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-ink/5 flex items-center justify-center mb-5">
          <Lock className="text-ink" size={22} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">
          {title}
        </h1>
        <p className="text-ink/60 text-sm mb-8">
          {subtitle || 'Ingresá la clave que te compartió tu profesora para entrar.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Clave de acceso"
            autoFocus
            className="w-full px-4 py-3 rounded-lg border-2 border-ink/15 bg-paper font-mono text-ink text-center tracking-widest focus:border-brand outline-none transition-colors"
          />
          {error && (
            <p className="text-stamp text-sm font-medium">
              Esa clave no es correcta. Revisá mayúsculas/espacios o consultá con tu profesora.
            </p>
          )}
          <button
            type="submit"
            className="mt-2 bg-ink text-cream font-semibold py-3 rounded-lg hover:bg-brand transition-colors"
          >
            Entrar
          </button>
        </form>
        <a
          href={buildWhatsAppLink('Hola! No puedo entrar a Activity Blog con mi clave, ¿me ayudás?')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 hover:text-ink transition-colors"
        >
          <MessageCircle size={14} /> ¿No te funciona? Escribinos por WhatsApp
        </a>
      </div>
    </div>
  )
}
