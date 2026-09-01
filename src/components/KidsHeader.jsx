import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

// Header de navegación específico del bloque Infancias y adolescentes —
// look propio de la landing de English Kids Club (Poppins, fondo claro
// con blur, sin la franja tipo boarding-pass de Adultos).
export default function KidsHeader({ crumbs = [], backTo }) {
  return (
    <div className="sticky top-0 z-50 bg-kidsCream/90 backdrop-blur-sm border-b-2 border-kidsInk/[0.06]">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-playful text-xs sm:text-sm font-semibold text-kidsInk/70 min-w-0 overflow-x-auto">
          {backTo && (
            <Link
              to={backTo}
              className="flex items-center gap-1 -m-2 p-2 text-kidsInk hover:text-kidsPurpleDeep transition-colors mr-1"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          )}
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-kidsInk/70">/</span>}
              <span className={i === crumbs.length - 1 ? 'text-kidsInk font-bold' : ''}>{c}</span>
            </span>
          ))}
        </div>
        <Link to="/" className="font-playful font-extrabold text-kidsInk text-sm sm:text-base whitespace-nowrap shrink-0">
          Activity<span className="text-kidsPurpleDeep">·</span>Blog
        </Link>
      </div>
    </div>
  )
}
