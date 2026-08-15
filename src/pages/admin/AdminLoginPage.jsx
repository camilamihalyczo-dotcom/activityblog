import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useAdminSession } from '../../lib/useAdminSession.js'

export default function AdminLoginPage() {
  const session = useAdminSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) setError('Email o contraseña incorrectos.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="texture-card rounded-2xl p-8 w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-2">Panel de administración</p>
        <h1 className="font-display text-2xl font-semibold text-ink mb-6">Iniciar sesión</h1>

        <label className="block mb-4">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm focus:border-brand outline-none transition-colors"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Contraseña</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm focus:border-brand outline-none transition-colors"
          />
        </label>

        {error && <p className="text-stamp text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-cream font-semibold py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="text-ink/40 text-xs mt-5 leading-relaxed">
          ¿Todavía no tenés usuario? Se crea desde el dashboard de Supabase, no acá — ver supabase/README.md.
        </p>
      </form>
    </div>
  )
}
