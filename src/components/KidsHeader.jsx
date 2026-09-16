import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import FloatingBackButton from './FloatingBackButton.jsx'

// Header de navegación específico del bloque Infancias y adolescentes —
// look propio de la landing de English Kids Club (Poppins, fondo claro
// con blur, sin la franja tipo boarding-pass de Adultos).
//
// `backTo` acepta una ruta fija (string) o -1, que en vez de un link a una
// ruta puntual vuelve a la página anterior del historial — igual que en
// TicketHeader, útil para páginas a las que se puede llegar desde varios
// lugares distintos (ej: la tabla fonética, que se linkea desde cualquier
// grupo).
export default function KidsHeader({ crumbs = [], backTo, showFloatingBack = false }) {
  const navigate = useNavigate()
  return (
    <>
    <div className="sticky top-0 z-50 bg-kidsCream/90 backdrop-blur-sm border-b-2 border-kidsInk/[0.06]">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {/* overflow-y-hidden es necesario acá y no es cosmético: al poner
            overflow-x-auto sin fijar el otro eje, la spec de CSS convierte
            "overflow-y: visible" en "auto" también — así que un desajuste
            de un par de píxeles entre el peso normal y el font-bold del
            último crumb (algo que pasa siempre, por el hinting de la
            fuente) alcanza para que el navegador dibuje una scrollbar
            vertical minúscula ahí adentro. En Windows con scrollbars
            clásicas eso se ve como dos flechitas ▲▼ pegadas al texto, sin
            hacer nada (rango de scroll de ~1px) — el bug que reportó
            Agustín. */}
        <div className="flex items-center gap-2 font-playful text-xs sm:text-sm font-semibold text-kidsInk/70 min-w-0 overflow-x-auto overflow-y-hidden">
          {backTo === -1 ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-kidsPurpleDeep px-4 py-2 font-playful text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kidsPurpleDeep mr-1"
            >
              <ChevronLeft size={16} />
              <span>Volver</span>
            </button>
          ) : (
            backTo && (
              <Link
                to={backTo}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-kidsPurpleDeep px-4 py-2 font-playful text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kidsPurpleDeep mr-1"
              >
                <ChevronLeft size={16} />
                <span>Volver</span>
              </Link>
            )
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
    {showFloatingBack && <FloatingBackButton backTo={backTo} kids />}
    </>
  )
}
