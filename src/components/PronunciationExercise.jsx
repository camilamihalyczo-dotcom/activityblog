import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CheckCircle2, Gauge, Volume2, XCircle } from 'lucide-react'
import { buildPairsBoard, matchRow } from '../lib/pronunciation.js'
import { canSpeak, speak } from '../lib/speech.js'
import { getSkin } from '../lib/skin.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import ExerciseSubmit from './ExerciseSubmit.jsx'
import CollapsibleExercise from './CollapsibleExercise.jsx'

// Pronunciación — "parejas que suenan igual".
// El alumno escucha cada palabra (voz del navegador), la arrastra a una
// fila del tablero y arma parejas. Cuando completó todas, corrige: cada
// fila está bien si sus palabras forman una de las parejas cargadas, en
// cualquier orden y en cualquier fila. También se puede jugar sin
// arrastrar: tocar una palabra y después el casillero.

const POOL_ID = 'pool'

function shuffle(arr) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function SpeakButton({ text, rate, s, label }) {
  if (!canSpeak()) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speak(text, { rate })
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={label || `Escuchar “${text}”`}
      title={label || 'Escuchar'}
      className={`shrink-0 rounded-full p-1.5 ${s.muted} hover:opacity-100 opacity-80`}
    >
      <Volume2 size={16} aria-hidden="true" />
    </button>
  )
}

function Chip({ chip, s, selected, disabled, onClick, rate, overlay = false }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: chip.id, disabled })
  return (
    <span
      ref={overlay ? undefined : setNodeRef}
      className={`inline-flex items-center gap-0.5 border-2 ${s.option} pl-3 pr-1 py-1 text-sm font-medium transition-colors touch-none
        ${selected ? s.chipSelected : s.chipIdle}
        ${isDragging && !overlay ? 'opacity-30' : ''}
        ${overlay ? 'shadow-lg cursor-grabbing' : disabled ? '' : 'cursor-grab'}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-pressed={selected}
        className="py-1"
        {...(overlay ? {} : listeners)}
        {...(overlay ? {} : attributes)}
      >
        {chip.text}
      </button>
      <SpeakButton text={chip.text} rate={rate} s={s} />
    </span>
  )
}

function Slot({ id, chip, s, selected, submitted, onSlotClick, onChipClick, rate, selectedChipId }) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: submitted })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[48px] flex-1 min-w-[120px] flex items-center justify-center rounded-xl border-2 p-1 transition-colors
        ${isOver ? s.dropActive : chip ? 'border-transparent' : `border-dashed ${s.slotEmpty}`}`}
    >
      {chip ? (
        <Chip
          chip={chip}
          s={s}
          rate={rate}
          disabled={submitted}
          selected={selectedChipId === chip.id}
          onClick={() => onChipClick(chip.id, id)}
        />
      ) : (
        <button
          type="button"
          disabled={submitted}
          onClick={() => onSlotClick(id)}
          className={`w-full h-full min-h-[40px] text-xs ${s.muted} ${selected ? 'font-semibold' : ''}`}
        >
          {selected ? 'Soltar acá' : 'Arrastrá o tocá'}
        </button>
      )}
    </div>
  )
}

function Pool({ children, s }) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID })
  return (
    <div
      ref={setNodeRef}
      className={`${s.bankBox} z-10 p-4 mb-6 border-2 transition-colors ${isOver ? s.dropActive : 'border-transparent'}`}
    >
      {children}
    </div>
  )
}

export default function PronunciationExercise({ exercise, c, kids = false, submission }) {
  const s = getSkin(c, kids)
  const { pairs, chips, rows } = useMemo(() => buildPairsBoard(exercise), [exercise])
  const [poolOrder, setPoolOrder] = useState(() => shuffle(chips.map((chip) => chip.id)))
  const [placements, setPlacements] = useState({}) // slotId -> chipId
  const [selectedChipId, setSelectedChipId] = useState(null)
  const [activeChipId, setActiveChipId] = useState(null)
  const [slow, setSlow] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()
  // Solo puntero/touch: con teclado se juega con el modo "tocar" (cada
  // palabra y casillero es un botón), que es más simple que arrastrar.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  if (pairs.length === 0) return null

  const rate = slow ? 0.6 : 0.9
  const chipsById = Object.fromEntries(chips.map((chip) => [chip.id, chip]))
  const placed = new Set(Object.values(placements))
  const poolChips = poolOrder.filter((id) => !placed.has(id)).map((id) => chipsById[id])
  const allSlots = rows.flatMap((r) => r.slots)
  const allPlaced = allSlots.every((slotId) => placements[slotId])

  const rowResults = rows.map((row) => {
    const words = row.slots.map((sid) => chipsById[placements[sid]]?.text || '')
    return { row, words, match: matchRow(words, pairs) }
  })
  const score = rowResults.filter((r) => r.match).length

  // Pone una ficha en un casillero. Si el casillero estaba ocupado, la ficha
  // que estaba ahí se intercambia (si la nueva venía de otro casillero) o
  // vuelve al banco.
  const place = (chipId, slotId) => {
    setPlacements((p) => {
      const next = { ...p }
      const from = Object.keys(next).find((sid) => next[sid] === chipId)
      const occupant = next[slotId]
      if (from) delete next[from]
      if (occupant && occupant !== chipId && from) next[from] = occupant
      next[slotId] = chipId
      return next
    })
    setSelectedChipId(null)
  }
  const unplace = (chipId) => {
    setPlacements((p) => {
      const next = { ...p }
      const from = Object.keys(next).find((sid) => next[sid] === chipId)
      if (from) delete next[from]
      return next
    })
    setSelectedChipId(null)
  }

  const handleDragStart = ({ active }) => {
    setActiveChipId(active.id)
    setSelectedChipId(null)
    speak(chipsById[active.id]?.text, { rate })
  }
  const handleDragEnd = ({ active, over }) => {
    setActiveChipId(null)
    if (!over || submitted) return
    if (over.id === POOL_ID) unplace(active.id)
    else place(active.id, over.id)
  }

  // Tocar una palabra del banco la selecciona (y la lee en voz alta).
  const handlePoolChipClick = (chipId) => {
    if (submitted) return
    if (selectedChipId === chipId) return setSelectedChipId(null)
    setSelectedChipId(chipId)
    speak(chipsById[chipId]?.text, { rate })
  }
  // Tocar una palabra ya ubicada: si hay otra seleccionada, la reemplaza
  // (intercambio); si no, la devuelve al banco.
  const handlePlacedChipClick = (chipId, slotId) => {
    if (submitted) return
    if (selectedChipId && selectedChipId !== chipId) place(selectedChipId, slotId)
    else unplace(chipId)
  }
  const handleSlotClick = (slotId) => {
    if (submitted || !selectedChipId) return
    place(selectedChipId, slotId)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setSelectedChipId(null)
    recordSubmission({
      ...submission,
      contentType: 'pronunciation',
      label: exercise.title || 'Pronunciación',
      studentName,
      score,
      total: rows.length,
      detail: rowResults.map(({ words, match }, i) => {
        const partners = pairs.find((p) => p.words.some((w) => w === words[0]))
        return {
          question: `Pareja ${i + 1}`,
          given: words.join(' + '),
          correct: match ? words.join(' + ') : partners ? partners.words.join(' + ') : '',
          is_correct: Boolean(match),
        }
      }),
    })
  }

  const retry = () => {
    setPlacements({})
    setSelectedChipId(null)
    setPoolOrder(shuffle(chips.map((chip) => chip.id)))
    setSubmitted(false)
  }

  const activeChip = activeChipId ? chipsById[activeChipId] : null

  return (
    <CollapsibleExercise
      title={exercise.title || 'Parejas que suenan igual'}
      label="Pronunciación"
      defaultOpen
      className={`${s.card} p-6 sm:p-8 mb-8 ${s.outer}`}
    >
      <p className={`${s.text} text-sm mb-4`}>
        {exercise.instructions?.trim() ||
          'Escuchá cada palabra y armá parejas con las que suenan igual. Arrastralas a una fila (o tocá una palabra y después el casillero). Cuando completes todas, corregí.'}
      </p>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveChipId(null)}>
        {!submitted && (
        <Pool s={s}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={s.bankLabel}>Palabras</p>
            {canSpeak() && (
              <button
                type="button"
                onClick={() => setSlow((v) => !v)}
                aria-pressed={slow}
                className={`flex items-center gap-1 text-xs ${s.muted} ${slow ? 'font-semibold underline' : ''}`}
              >
                <Gauge size={14} aria-hidden="true" /> {slow ? 'Voz lenta' : 'Voz normal'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {poolChips.map((chip) => (
              <Chip
                key={chip.id}
                chip={chip}
                s={s}
                rate={rate}
                disabled={submitted}
                selected={selectedChipId === chip.id}
                onClick={() => handlePoolChipClick(chip.id)}
              />
            ))}
            {poolChips.length === 0 && !submitted && (
              <p className={`${s.muted} text-xs self-center`}>Ubicaste todas las palabras. ¡Ya podés corregir!</p>
            )}
          </div>
          {selectedChipId && (
            <p className={`${s.muted} text-xs mt-3`}>Ahora tocá un casillero para “{chipsById[selectedChipId]?.text}”.</p>
          )}
        </Pool>
        )}

        <div className="flex flex-col gap-3">
          {rowResults.map(({ row, words, match }, ri) => (
            <div
              key={row.id}
              className={`rounded-2xl border-2 p-3 ${s.soft} ${submitted ? (match ? s.ok : s.bad) : 'border-transparent'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`${s.small} w-6 shrink-0 text-center`}>{ri + 1}</span>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {row.slots.map((slotId) => (
                    <Slot
                      key={slotId}
                      id={slotId}
                      chip={chipsById[placements[slotId]]}
                      s={s}
                      rate={rate}
                      submitted={submitted}
                      selected={Boolean(selectedChipId)}
                      selectedChipId={selectedChipId}
                      onSlotClick={handleSlotClick}
                      onChipClick={handlePlacedChipClick}
                    />
                  ))}
                </div>
                {words.every(Boolean) && (
                  <SpeakButton text={words.join('... ')} rate={rate} s={s} label="Escuchar la pareja" />
                )}
                {submitted &&
                  (match ? (
                    <CheckCircle2 size={20} className={`${s.okIcon} shrink-0`} aria-label="Correcta" />
                  ) : (
                    <XCircle size={20} className={`${s.badIcon} shrink-0`} aria-label="Incorrecta" />
                  ))}
              </div>
              {submitted && match?.hint && <p className={`${s.small} mt-2 ml-8`}>{match.hint}</p>}
            </div>
          ))}
        </div>

        {/* Sin animación de "vuelta" al soltar: la ficha queda donde se soltó al
            instante y no tapa el banco mientras el alumno toca la siguiente. */}
        <DragOverlay dropAnimation={null}>{activeChip ? <Chip chip={activeChip} s={s} rate={rate} overlay /> : null}</DragOverlay>
      </DndContext>

      {submitted && score < rows.length && (
        <div className={`mt-6 rounded-2xl p-4 ${s.soft}`}>
          <p className={`${s.bankLabel} mb-2`}>Las parejas eran</p>
          <ul className="flex flex-col gap-1.5">
            {pairs.map((p) => (
              <li key={p.id} className={`${s.text} text-sm flex items-center gap-1 flex-wrap`}>
                <span className="font-semibold">{p.words.join(' — ')}</span>
                <SpeakButton text={p.words.join('... ')} rate={rate} s={s} label={`Escuchar ${p.words.join(' y ')}`} />
                {p.hint && <span className={s.small}>{p.hint}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ExerciseSubmit
        s={s}
        c={c}
        kids={kids}
        studentName={studentName}
        setStudentName={setStudentName}
        disabled={!allPlaced || !studentName.trim()}
        hint={!allPlaced ? 'Ubicá todas las palabras para poder corregir.' : 'Escribí tu nombre para poder corregir.'}
        onSubmit={handleSubmit}
        submitted={submitted}
        score={score}
        total={rows.length}
        unit="parejas correctas"
        onRetry={retry}
      />
    </CollapsibleExercise>
  )
}
