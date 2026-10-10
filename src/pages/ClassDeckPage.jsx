import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { fetchDeckByToken } from '../lib/decks.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import DeckRenderer from '../components/deck/DeckRenderer.jsx'

// Link privado de una clase o glosario: /clase/<token>. Se ve igual que se
// imprime; el botón abre el diálogo de impresión del navegador, donde se
// elige "Guardar como PDF".
export default function ClassDeckPage() {
  const { token } = useParams()
  const { status, data: deck } = useActivityLoad(() => fetchDeckByToken(token), [token], (d) => Boolean(d))

  // Tamaño de hoja para la impresión según sea clase (horizontal) o glosario (vertical).
  useEffect(() => {
    if (!deck) return undefined
    const style = document.createElement('style')
    style.id = 'dk-page-size'
    style.textContent = `@page{size:A4 ${deck.kind === 'glossary' ? 'portrait' : 'landscape'};margin:0}
      @media print{html,body{background:#fff!important;margin:0!important;padding:0!important}}`
    document.head.appendChild(style)
    const prevTitle = document.title
    document.title = (deck.title || 'Clase').replace(/\*/g, '')
    return () => {
      style.remove()
      document.title = prevTitle
    }
  }, [deck])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No encontramos esta clase. Revisá que el link esté completo.
      </div>
    )
  }

  const kids = deck.scope === 'infancias'
  return (
    <div className={`min-h-screen print:min-h-0 py-8 print:py-0 ${kids ? 'bg-[#EFE8DA]' : 'bg-[#E9E4D8]'} print:bg-white`}>
      <div className="dk-noprint print:hidden fixed top-4 right-4 z-30">
        <button
          onClick={() => window.print()}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm shadow-lg transition-transform hover:-translate-y-0.5 ${
            kids ? 'bg-[#2E2A4A] text-white rounded-full' : 'bg-[#121212] text-[#FBF9F4] rounded-full'
          }`}
        >
          <Printer size={16} /> Guardar / Imprimir PDF
        </button>
      </div>
      {/* En pantallas angostas la hoja A4 se ve con scroll horizontal; en
          desktop entra completa, igual que al imprimir. */}
      <div className="overflow-x-auto print:overflow-visible">
        <div className="w-max mx-auto shadow-xl print:shadow-none">
          <DeckRenderer deck={deck} />
        </div>
      </div>
    </div>
  )
}
