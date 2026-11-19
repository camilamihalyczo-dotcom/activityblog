import { useMemo, useState } from 'react'
import FlashcardDeck from './FlashcardDeck.jsx'
import { classOfCode } from '../lib/exerciseCode.js'

// Mazo de flashcards con el código de clase. Si las tarjetas vienen de
// varias clases (Kids suma una clase por archivo), aparecen botones para
// practicar solo una clase o todas juntas.
export default function CodedFlashcards({ cards, c, kids = false, deckKey }) {
  const codes = useMemo(() => [...new Set(cards.map((card) => card.code).filter(Boolean))], [cards])
  const [selected, setSelected] = useState('all')
  const multi = codes.length > 1
  const shown = multi && selected !== 'all' ? cards.filter((card) => card.code === selected) : cards

  const chip = (active) =>
    `rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors ${
      active
        ? kids
          ? 'border-kidsPurpleDeep bg-kidsPurpleDeep text-white'
          : 'border-ink bg-ink text-cream'
        : kids
          ? 'border-kidsInk/15 text-kidsInk/80 font-playful'
          : 'border-ink/15 text-ink/70'
    }`

  return (
    <>
      {codes.length === 1 && (
        <p className="mb-4">
          <span className="inline-block rounded border border-current px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-widest opacity-80" data-testid="exercise-code">
            {codes[0]}
          </span>
        </p>
      )}
      {multi && (
        <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Elegir clase">
          <button type="button" onClick={() => setSelected('all')} className={chip(selected === 'all')} aria-pressed={selected === 'all'}>
            Todas
          </button>
          {codes.map((code) => (
            <button key={code} type="button" onClick={() => setSelected(code)} className={chip(selected === code)} aria-pressed={selected === code} data-testid="exercise-code">
              {classOfCode(code) ? `Clase ${classOfCode(code)}` : code}
            </button>
          ))}
        </div>
      )}
      <FlashcardDeck key={`${deckKey}:${selected}`} cards={shown} c={c} kids={kids} />
    </>
  )
}
