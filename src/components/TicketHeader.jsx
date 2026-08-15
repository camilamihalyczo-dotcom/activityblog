import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

// Franja tipo "boarding pass" usada como header de navegación en las páginas internas.
export default function TicketHeader({ crumbs = [], backTo }) {
  return (
    <div className="border-b-2 border-dashed border-ink/25 bg-cream/70">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-ink/70">
          {backTo && (
            <Link
              to={backTo}
              className="flex items-center gap-1 text-ink hover:text-brand transition-colors mr-1"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          )}
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink/30">/</span>}
              <span className={i === crumbs.length - 1 ? 'text-ink font-semibold' : ''}>{c}</span>
            </span>
          ))}
        </div>
        <Link to="/" className="font-display font-bold text-ink text-sm sm:text-base whitespace-nowrap">
          Activity Blog
        </Link>
      </div>
    </div>
  )
}
