import { Fragment, useMemo, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { splitSentenceAtBlank } from '../lib/text.js'
import { buildWordBankData, isChipCorrectForSlot, isItemCorrect } from '../lib/fillBlank.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import { getSkin } from '../lib/skin.js'
import ExerciseSubmit from './ExerciseSubmit.jsx'
import CollapsibleExercise from './CollapsibleExercise.jsx'

// Un único componente de "Completar oraciones" para Adultos e Infancias.
// Lo único que cambia entre los dos es el estilo, que sale de `getSkin`
// (src/lib/skin.js).
// `submission` trae los datos de dónde vive el ejercicio para guardar la
// entrega ({ scope: 'adultos', levelSlug, trackSlug, temarioSlug } o
// { scope: 'infancias', groupSlug }).

function shuffle(arr) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function ResultIcon({ ok, s, size = 16 }) {
  return ok ? <CheckCircle2 size={size} className={`${s.okIcon} shrink-0`} /> : <XCircle size={size} className={`${s.badIcon} shrink-0`} />
}

// ─── Modo clásico: texto libre u opciones por oración ────────────────

function FillBlankItem({ item, s, value, onChange, submitted }) {
  const { before, after } = splitSentenceAtBlank(item.sentence)
  const options = item.options || []
  const correct = submitted && isItemCorrect(item, value)
  const wrong = submitted && value != null && !isItemCorrect(item, value)

  return (
    <div className={`${s.card} p-6`}>
      {item.image_url && <img loading="lazy" decoding="async" src={item.image_url} alt="" className={`w-full max-h-56 object-cover ${s.img} mb-4`} />}

      {options.length > 0 ? (
        <>
          <p className={`${s.text} mb-3 leading-relaxed`}>
            {before}
            <span className={`font-semibold ${s.muted}`}>{value || '_____'}</span>
            {after}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt, oi) => {
              const chosen = value === opt
              const optCorrect = submitted && opt === item.answer
              const optWrong = submitted && chosen && opt !== item.answer
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => onChange(opt)}
                  className={`px-4 py-2 border-2 ${s.option} transition-colors flex items-center gap-2 text-sm
                    ${chosen && !submitted ? s.chosen : s.idle}
                    ${optCorrect ? s.ok : ''}
                    ${optWrong ? s.bad : ''}
                  `}
                >
                  {opt}
                  {optCorrect && <ResultIcon ok s={s} size={14} />}
                  {optWrong && <ResultIcon ok={false} s={s} size={14} />}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <p className={`${s.text} leading-relaxed flex flex-wrap items-center gap-2`}>
          <span>{before}</span>
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={submitted}
            aria-label="Tu respuesta"
            className={`inline-block w-36 px-2 py-1 border-2 text-sm ${s.input} transition-colors
              ${!submitted ? s.inputIdle : ''}
              ${correct ? s.ok : ''}
              ${wrong ? s.bad : ''}
            `}
          />
          <span>{after}</span>
          {correct && <ResultIcon ok s={s} />}
          {wrong && (
            <>
              <ResultIcon ok={false} s={s} />
              <span className={s.small}>→ {String(item.answer).split('/')[0].trim()}</span>
            </>
          )}
        </p>
      )}
    </div>
  )
}

function ClassicGroup({ exercise, c, s, kids, submission }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  const score = exercise.sentences.filter((item) => isItemCorrect(item, answers[item.id])).length
  const allAnswered = exercise.sentences.every((item) => {
    const v = answers[item.id]
    return v != null && String(v).trim() !== ''
  })

  const handleSubmit = () => {
    setSubmitted(true)
    recordSubmission({
      ...submission,
      contentType: 'fill_blank',
      label: exercise.title,
      studentName,
      score,
      total: exercise.sentences.length,
      detail: exercise.sentences.map((item) => ({
        id: item.id,
        sentence: item.sentence,
        given: answers[item.id] ?? null,
        correct: item.answer,
        is_correct: isItemCorrect(item, answers[item.id]),
      })),
    })
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {exercise.sentences.map((item) => (
          <FillBlankItem
            key={item.id}
            item={item}
            s={s}
            value={answers[item.id]}
            onChange={(value) => setAnswers((a) => ({ ...a, [item.id]: value }))}
            submitted={submitted}
          />
        ))}
      </div>
      <ExerciseSubmit
        s={s}
        c={c}
        kids={kids}
        studentName={studentName}
        setStudentName={setStudentName}
        disabled={!allAnswered || !studentName.trim()}
        hint={!allAnswered ? 'Completá todas las oraciones para poder corregir.' : 'Escribí tu nombre para poder corregir.'}
        onSubmit={handleSubmit}
        submitted={submitted}
        score={score}
        total={exercise.sentences.length}
        onRetry={() => {
          setSubmitted(false)
          setAnswers({})
        }}
      />
    </>
  )
}

// ─── Modo banco de palabras compartido ───────────────────────────────
// Todas las respuestas del ejercicio (más los distractores) se mezclan en
// un solo banco; el alumno toca una palabra y después el casillero.

function WordBankGroup({ exercise, c, s, kids, submission }) {
  const { items, chips, slots } = useMemo(
    () => buildWordBankData(exercise.sentences, exercise.distractors),
    [exercise.sentences, exercise.distractors]
  )
  const [bankOrder, setBankOrder] = useState(() => shuffle(chips.map((chip) => chip.id)))
  const [placements, setPlacements] = useState({}) // slotId -> chipId
  const [selectedChipId, setSelectedChipId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  const chipsById = Object.fromEntries(chips.map((chip) => [chip.id, chip]))
  const slotsById = Object.fromEntries(slots.map((slot) => [slot.id, slot]))
  const placedChipIds = new Set(Object.values(placements))
  const bankChipIds = bankOrder.filter((id) => !placedChipIds.has(id))
  const allPlaced = slots.every((slot) => placements[slot.id])
  const isSlotCorrect = (slot) => isChipCorrectForSlot(chipsById[placements[slot.id]], slot)
  const score = slots.filter(isSlotCorrect).length

  const handleChipClick = (chipId) => {
    if (submitted) return
    setSelectedChipId((cur) => (cur === chipId ? null : chipId))
  }
  const handleSlotClick = (slotId) => {
    if (submitted) return
    if (selectedChipId) {
      // Si la ficha ya estaba en otro casillero, se mueve (no se duplica).
      setPlacements((p) => {
        const next = {}
        for (const [sid, cid] of Object.entries(p)) if (cid !== selectedChipId) next[sid] = cid
        next[slotId] = selectedChipId
        return next
      })
      setSelectedChipId(null)
    } else if (placements[slotId]) {
      // Tocar un casillero lleno sin nada seleccionado devuelve la ficha.
      setPlacements((p) => {
        const next = { ...p }
        delete next[slotId]
        return next
      })
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    recordSubmission({
      ...submission,
      contentType: 'fill_blank',
      label: exercise.title,
      studentName,
      score,
      total: slots.length,
      detail: slots.map((slot) => {
        const item = items.find((it) => it.id === slot.sentenceId)
        return {
          sentence: item?.sentence,
          blank_index: slot.blankIndex,
          given: chipsById[placements[slot.id]]?.text ?? null,
          correct: slot.expected,
          is_correct: isSlotCorrect(slot),
        }
      }),
    })
  }

  const retry = () => {
    setPlacements({})
    setSelectedChipId(null)
    setBankOrder(shuffle(chips.map((chip) => chip.id)))
    setSubmitted(false)
  }

  return (
    <>
      <div className={`${s.bankBox} p-5 mb-6 z-10`}>
        <p className={`${s.bankLabel} mb-3`}>Banco de palabras</p>
        <div className="flex flex-wrap gap-2">
          {bankChipIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleChipClick(id)}
              aria-pressed={selectedChipId === id}
              className={`px-3 py-2 border-2 ${s.option} text-sm font-medium transition-colors ${
                selectedChipId === id ? s.chipSelected : s.chipIdle
              }`}
            >
              {chipsById[id].text}
            </button>
          ))}
          {bankChipIds.length === 0 && <p className={`${s.muted} text-xs`}>Usaste todas las palabras.</p>}
        </div>
        {selectedChipId && !submitted && (
          <p className={`${s.muted} text-xs mt-3`}>Ahora tocá el espacio donde va “{chipsById[selectedChipId]?.text}”.</p>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className={`${s.card} p-6`}>
            {item.image_url && <img loading="lazy" decoding="async" src={item.image_url} alt="" className={`w-full max-h-56 object-cover ${s.img} mb-4`} />}
            <p className={`${s.text} leading-relaxed flex flex-wrap items-center gap-2`}>
              {item.segments.map((seg, si) => {
                const isLast = si === item.segments.length - 1
                const slotId = item.blanks[si]
                if (isLast || !slotId) {
                  return (
                    <Fragment key={si}>
                      {seg && <span>{seg}</span>}
                      {!isLast && <span className={s.muted}>___</span>}
                    </Fragment>
                  )
                }
                const slot = slotsById[slotId]
                const chip = chipsById[placements[slotId]]
                const correct = submitted && isSlotCorrect(slot)
                const wrong = submitted && !correct
                return (
                  <Fragment key={si}>
                    {seg && <span>{seg}</span>}
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSlotClick(slotId)}
                      className={`min-w-[96px] px-3 py-1.5 border-2 ${s.option} text-sm font-medium transition-colors text-center
                        ${submitted ? `border-solid ${correct ? s.ok : s.bad}` : chip ? s.slotFilled : `border-dashed ${s.slotEmpty}`}
                      `}
                    >
                      {chip ? chip.text : '···'}
                    </button>
                    {correct && <ResultIcon ok s={s} />}
                    {wrong && (
                      <>
                        <ResultIcon ok={false} s={s} />
                        <span className={s.small}>→ {slot.expected}</span>
                      </>
                    )}
                  </Fragment>
                )
              })}
            </p>
          </div>
        ))}
      </div>

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
        total={slots.length}
        onRetry={retry}
      />
    </>
  )
}

export default function FillBlankExercise({ exercise, c, kids = false, submission }) {
  const s = getSkin(c, kids)
  const hasContent = exercise.wordBank
    ? buildWordBankData(exercise.sentences).slots.length > 0
    : (exercise.sentences || []).length > 0
  if (!hasContent) return null

  return (
    <CollapsibleExercise
      title={exercise.title || 'Completar oraciones'}
      label="Actividad"
      className={`${s.card} p-6 sm:p-8 mb-8 ${s.outer}`}
    >
      {exercise.wordBank ? (
        <WordBankGroup exercise={exercise} c={c} s={s} kids={kids} submission={submission} />
      ) : (
        <ClassicGroup exercise={exercise} c={c} s={s} kids={kids} submission={submission} />
      )}
    </CollapsibleExercise>
  )
}
