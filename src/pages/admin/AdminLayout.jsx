import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom'
import { useAdminSession } from '../../lib/useAdminSession.js'
import { supabase } from '../../lib/supabaseClient.js'

export default function AdminLayout() {
  const session = useAdminSession()
  const navigate = useNavigate()

  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Cargando…</div>
  }
  if (session === null) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <div className="border-b-2 border-dashed border-ink/25 bg-cream/70">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-ink/70">
            <Link to="/admin" className="font-display font-bold text-ink text-sm sm:text-base normal-case tracking-normal">
              Activity Blog
            </Link>
            <span className="text-ink/30">/</span>
            <span className="text-ink font-semibold">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="font-mono text-xs uppercase tracking-widest text-ink/60 hover:text-ink transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 py-10">
        <Outlet />
      </div>
    </div>
  )
}
