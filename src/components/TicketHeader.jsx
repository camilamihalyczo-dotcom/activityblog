import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import FloatingBackButton from './FloatingBackButton.jsx'

// Franja tipo "boarding pass" usada como header de navegación en las páginas internas.
// `backTo` puede ser una ruta fija (string) o -1, que en vez de un link a
// una ruta puntual vuelve a la página anterior del historial — útil para
// páginas a las que se puede llegar desde varios lugares distintos (ej:
// la tabla fonética, que se linkea desde cualquier track o grupo).
export default function TicketHeader({ crumbs = [], backTo, showFloatingBack = false }) {
  const navigate = useNavigate()
  return (
    <>
    <div className="border-b-2 border-dashed border-ink/25 bg-cream/70">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        {/* overflow-y-hidden es necesario acá y no es cosmético: al poner
            overflow-x-auto sin fijar el otro eje, la spec de CSS convierte
            "overflow-y: visible" en "auto" también — así que un desajuste
            de un par de píxeles entre el peso normal y el font-semibold
            del último crumb (algo que pasa siempre, por el hinting de la
            fuente) alcanza para que el navegador dibuje una scrollbar
            vertical minúscula ahí adentro. En Windows con scrollbars
            clásicas eso se ve como dos flechitas ▲▼ pegadas al texto, sin
            hacer nada (rango de scroll de ~1px) — el bug que reportó
            Agustín. */}
        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-ink/70 min-w-0 overflow-x-auto overflow-y-hidden">
          {backTo === -1 ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cream shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand mr-1"
            >
              <ChevronLeft size={16} />
              <span>Volver</span>
            </button>
          ) : (
            backTo && (
              <Link
                to={backTo}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cream shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand mr-1"
              >
                <ChevronLeft size={16} />
                <span>Volver</span>
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
    {showFloatingBack && <FloatingBackButton backTo={backTo} />}
    </>
  )
}
