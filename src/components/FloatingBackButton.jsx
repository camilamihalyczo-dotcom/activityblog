import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function FloatingBackButton({ backTo, kids = false }) {
  const navigate = useNavigate()
  if (!backTo) return null

  const className = kids
    ? 'fixed bottom-5 left-1/2 z-40 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-kidsPurpleDeep px-5 py-3 font-playful font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-kidsPurpleDeep'
    : 'fixed bottom-5 left-1/2 z-40 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-cream shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-brand'

  const content = (
    <>
      <ArrowLeft size={17} aria-hidden="true" />
      <span>Volver</span>
    </>
  )

  return backTo === -1 ? (
    <button type="button" onClick={() => navigate(-1)} className={className} aria-label="Volver a la página anterior">
      {content}
    </button>
  ) : (
    <Link to={backTo} className={className} aria-label="Volver al temario">
      {content}
    </Link>
  )
}
