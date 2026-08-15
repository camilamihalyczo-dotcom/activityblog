import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGroup, KIDS_GROUP_COLORS } from '../data/kidsGroups.js'
import { KIDS_CONTENT_BY_GROUP } from '../data/kidsContentIndex.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import { RotateCw, ArrowLeft, ArrowRight, Shuffle } from 'lucide-react'

export default function InfanciasFlashcardsPage() {
  const { group: slug } = useParams()
  const group = getGroup(slug)
  const c = KIDS_GROUP_COLORS[group.color]
  const { flashcards } = KIDS_CONTENT_BY_GROUP[slug]
  const [order, setOrder] = useState(flashcards.map((_, i) => i))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const shuffle = () => {
    const next = [...order]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    setOrder(next)
    setIndex(0)
    setFlipped(false)
  }

  const go = (dir) => {
    setFlipped(false)
    setIndex((i) => (i + dir + order.length) % order.length)
  }

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Flashcards']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Vocabulario 🃏
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Flashcards</h1>
        <p className="font-playful text-kidsInk/65 mb-8">Tocá la tarjeta para dar vuelta y ver la traducción.</p>

        {flashcards.length === 0 ? (
          <KidsEmptyState label="flashcards" />
        ) : (
          <>
            <p className="font-playful text-xs text-kidsInk/50 mb-3 uppercase tracking-wider font-semibold">
              Tarjeta {index + 1} de {order.length}
            </p>
            <button
              onClick={() => setFlipped((f) => !f)}
              className={`w-full aspect-[16/9] bg-white rounded-[22px] shadow-kids ${c.borderT8} flex items-center justify-center p-8 text-center transition-transform duration-300`}
              style={{ perspective: '1000px' }}
            >
              <span className="font-body font-extrabold text-2xl sm:text-3xl text-kidsInk">
                {flipped ? flashcards[order[index]].back : flashcards[order[index]].front}
              </span>
            </button>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => go(-1)}
                className="flex items-center gap-1 px-4 py-2 rounded-full border-2 border-kidsInk/15 text-kidsInk font-playful font-semibold hover:border-kidsInk transition-colors"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <button
                onClick={() => setFlipped((f) => !f)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-kidsInk text-white font-playful font-semibold ${c.hoverBg} transition-colors`}
              >
                <RotateCw size={16} /> Girar
              </button>
              <button
                onClick={() => go(1)}
                className="flex items-center gap-1 px-4 py-2 rounded-full border-2 border-kidsInk/15 text-kidsInk font-playful font-semibold hover:border-kidsInk transition-colors"
              >
                Siguiente <ArrowRight size={16} />
              </button>
            </div>

            <button
              onClick={shuffle}
              className={`mt-8 flex items-center gap-2 mx-auto text-kidsInk/60 ${c.hoverText} font-playful text-sm font-semibold transition-colors`}
            >
              <Shuffle size={15} /> Mezclar tarjetas
            </button>
          </>
        )}
      </div>
    </div>
  )
}
