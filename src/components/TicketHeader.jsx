import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

// Franja tipo "boarding pass" usada como header de navegación en las páginas internas.
// `backTo` puede ser una ruta fija (string) o -1, que en vez de un link a
// una ruta puntual vuelve a la página anterior del historial — útil para
// páginas a las que se puede llegar desde varios lugares distintos (ej:
// la tabla fonética, que se linkea desde cualquier track o grupo).
export default function TicketHeader({ crumbs = [], backTo }) {
  const navigate = useNavigate()
  return (
    <div className="border-b-2 border-dashed border-ink/25 bg-cream/70">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-ink/70 min-w-0 overflow-x-auto">
          {backTo === -1 ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 -m-2 p-2 text-ink hover:text-brand transition-colors mr-1"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Volver</span>
            </button>
          ) : (
            backTo && (
              <Link
                to={backTo}
                className="flex items-center gap-1 -m-2 p-2 text-ink hover:text-brand transition-colors mr-1"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Volver</span>
              </Link>
            )
          )}
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink/60">/</span>}
              <span className={i === crumbs.length - 1 ? 'text-ink font-semibold' : ''}>{c}</span>
            </span>
          ))}
        </div>
        <Link to="/" className="font-display font-bold text-ink text-sm sm:text-base whitespace-nowrap shrink-0">
          Activity Blog
        </Link>
      </div>
    </div>
  )
}
