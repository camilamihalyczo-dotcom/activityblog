import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Shuffle, Volume2 } from 'lucide-react'
import { getSkin } from '../lib/skin.js'
import { canSpeak, speak } from '../lib/speech.js'

// Mazo de flashcards — un único componente para Adultos e Infancias (el
// estilo sale de src/lib/skin.js). No es colapsable a propósito.
// Atajos de teclado: ← / → cambian de tarjeta, espacio la da vuelta.

function shuffled(n) {
  const next = Array.from({ length: n }, (_, i) => i)
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function FlashcardDeck({ cards, c, kids = false }) {
  const s = getSkin(c, kids)
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const go = (dir) => {
    setFlipped(false)
    setIndex((i) => (i + dir + order.length) % order.length)
  }
  const shuffle = () => {
    setOrder(shuffled(cards.length))
    setIndex(0)
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ' && !e.target.closest?.('button')) {
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.length])

  const card = cards[order[index]]
  if (!card) return null
  const navBtn = `flex items-center gap-1 px-4 py-2 border-2 ${s.option} ${s.idle} ${s.text} font-medium hover:opacity-80 transition-colors`

  return (
    <div className={`${s.card} p-6 sm:p-8 ${s.outer}`}>
      <p className={`${s.small} uppercase tracking-wider mb-3`}>
        Tarjeta {index + 1} de {order.length}
      </p>
      <div className="relative">
        <button
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Ver el frente' : 'Dar vuelta la tarjeta'}
          className={`w-full aspect-[16/9] ${s.card} flex flex-col items-center justify-center gap-4 p-8 text-center transition-transform duration-300`}
        >
          {!flipped && card.image_url && (
            <img loading="lazy" decoding="async" src={card.image_url} alt="" className={`max-h-32 sm:max-h-40 ${s.img} object-contain`} />
          )}
          <span className={`${s.title} text-2xl sm:text-3xl`}>{flipped ? card.back : card.front}</span>
          <span className={`${s.small} opacity-70`}>{flipped ? 'Dorso' : 'Frente'}</span>
        </button>
        {canSpeak() && !flipped && card.front && (
          <button
            type="button"
            onClick={() => speak(card.front)}
            aria-label={`Escuchar “${card.front}”`}
            title="Escuchar"
            className={`absolute top-3 right-3 rounded-full p-2 ${s.soft} ${s.muted} hover:opacity-80`}
          >
            <Volume2 size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 gap-2">
        <button onClick={() => go(-1)} className={navBtn}>
          <ArrowLeft size={16} /> Anterior
        </button>
        <button onClick={() => setFlipped((f) => !f)} className={`flex items-center gap-2 px-4 py-2 ${s.primary} transition-colors`}>
          <RotateCw size={16} /> Girar
        </button>
        <button onClick={() => go(1)} className={navBtn}>
          Siguiente <ArrowRight size={16} />
        </button>
      </div>

      <button onClick={shuffle} className={`mt-8 flex items-center gap-2 mx-auto ${s.muted} ${c.hoverText} text-sm font-medium transition-colors`}>
        <Shuffle size={15} /> Mezclar tarjetas
      </button>
      <p className={`${s.muted} text-xs text-center mt-3 hidden sm:block`}>Atajos: ← → para cambiar de tarjeta, espacio para dar vuelta.</p>
    </div>
  )
}
