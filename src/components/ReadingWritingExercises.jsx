import { useRef, useState } from 'react'
import { BookOpen, CheckCircle2, PenLine, XCircle } from 'lucide-react'
import { buildReadingWritingSubmissions, correctOptionText, isAutoGraded } from '../lib/readingWriting.js'
import { getSkin } from '../lib/skin.js'
import { newSubmissionId, recordSubmission, useStudentName } from '../lib/submissions.js'
import NameField from './NameField.jsx'
import CollapsibleExercise from './CollapsibleExercise.jsx'

// Reading & Writing — un único componente para Adultos e Infancias (el
// estilo sale de src/lib/skin.js). Muestra todos los readings y writings
// de un temario/grupo; cada uno tiene adentro su propio nombre + botón de
// guardar (como el resto de los ejercicios), así no queda un botón suelto
// abajo de todo que se presta a confusión. El nombre es uno solo: si lo
// escriben en un ejercicio, aparece en los demás.
// - las preguntas multiple choice de un Reading se corrigen solas;
// - las abiertas y los Writing quedan para que los revise la profe.
// `submission` = dónde vive ({ scope: 'adultos', levelSlug, trackSlug,
// temarioSlug } o { scope: 'infancias', groupSlug }).

const hasText = (v) => typeof v === 'string' && v.trim() !== ''

// Pie de cada Reading/Writing: nombre + guardar, y después "Seguir editando".
function ItemSave({ s, c, kids, studentName, setStudentName, hasAnswer, saving, saved, onSave, onEdit, emptyHint, doneHint }) {
  if (saved) {
    return (
      <div className={`mt-8 ${s.resultBox} p-6 text-center`}>
        <p className={s.resultTitle.replace('text-2xl', 'text-xl')}>¡Guardado! Tu profe ya lo puede ver.</p>
        {doneHint && <p className={`${s.muted} text-sm mt-2`}>{doneHint}</p>}
        <button onClick={onEdit} className={`mt-4 ${s.link}`}>
          Seguir editando
        </button>
      </div>
    )
  }
  return (
    <div className="mt-8">
      <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
      <button
        onClick={onSave}
        disabled={!hasAnswer || saving || !studentName.trim()}
        className={`w-full py-3 ${s.primary} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {saving ? 'Guardando…' : 'Guardar mis respuestas'}
      </button>
      <p className={`${s.muted} text-xs mt-2`}>
        {!hasAnswer ? emptyHint : !studentName.trim() ? 'Escribí tu nombre para poder guardar.' : 'Tu profe va a ver lo que guardes.'}
      </p>
    </div>
  )
}

function ReadingItem({ item, s, answers, onChange, disabled, showResults, defaultOpen, footer }) {
  return (
    <CollapsibleExercise
      title={item.title}
      label="Reading"
      defaultOpen={defaultOpen}
      icon={BookOpen}
      className={`${s.card} p-6 sm:p-8 mb-8 ${s.outer}`}
    >
      {item.image_url && (
        <img loading="lazy" decoding="async" src={item.image_url} alt="" className={`w-full max-h-64 object-cover ${s.img} mb-4`} />
      )}
      <p className={`${s.body} whitespace-pre-line leading-relaxed mb-6`}>{item.text}</p>

      <div className="flex flex-col gap-4">
        {(item.questions || []).map((q, qi) => {
          const correct = showResults && isAutoGraded(q) ? correctOptionText(q) : null
          const given = answers[q.id]
          return (
            <div key={q.id}>
              <p className={`${s.small} mb-1`}>Pregunta {qi + 1}</p>
              <p className={`${s.text} font-medium mb-2 whitespace-pre-line`}>{q.q}</p>
              {q.type === 'multiple_choice' ? (
                <div className="flex flex-col gap-2">
                  {(q.options || []).filter(Boolean).map((option, oi) => {
                    const chosen = given === option
                    return (
                      <label
                        key={`${q.id}-${oi}`}
                        className={`flex items-center gap-2 text-sm ${s.text} ${correct && option === correct ? 'font-semibold' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`reading-${item.id}-${q.id}`}
                          value={option}
                          checked={chosen}
                          onChange={(e) => onChange(q.id, e.target.value)}
                          disabled={disabled}
                          className={s.accent}
                        />
                        {option}
                        {correct && chosen && option === correct && (
                          <CheckCircle2 size={15} className={`${s.okIcon} shrink-0`} aria-label="Correcta" />
                        )}
                        {correct && chosen && option !== correct && (
                          <XCircle size={15} className={`${s.badIcon} shrink-0`} aria-label="Incorrecta" />
                        )}
                      </label>
                    )
                  })}
                  {correct && given && given !== correct && <p className={s.small}>→ La correcta era: {correct}</p>}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={given || ''}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  disabled={disabled}
                  placeholder="Escribí tu respuesta acá..."
                  className={`w-full px-3 py-2 border-2 text-sm ${s.input} ${s.inputIdle} transition-colors resize-none disabled:opacity-60`}
                />
              )}
            </div>
          )
        })}
      </div>
      {footer}
    </CollapsibleExercise>
  )
}

function WritingItem({ item, s, text, onChange, disabled, defaultOpen, footer }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <CollapsibleExercise
      title={item.title}
      label="Writing"
      defaultOpen={defaultOpen}
      icon={PenLine}
      className={`${s.card} p-6 sm:p-8 mb-8 ${s.outer}`}
    >
      {item.image_url && (
        <img loading="lazy" decoding="async" src={item.image_url} alt="" className={`w-full max-h-64 object-cover ${s.img} mb-4`} />
      )}
      <p className={`${s.text} opacity-80 mb-4 whitespace-pre-line`}>{item.prompt}</p>
      <textarea
        rows={8}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Escribí tu producción acá..."
        className={`w-full px-4 py-3 border-2 text-sm leading-relaxed ${s.input} ${s.inputIdle} transition-colors resize-y disabled:opacity-60`}
      />
      <p className={`text-right ${s.small} mt-2`}>{words} palabras</p>
      {footer}
    </CollapsibleExercise>
  )
}

export default function ReadingWritingExercises({ items, c, kids = false, submission }) {
  const s = getSkin(c, kids)
  const [readingAnswers, setReadingAnswers] = useState({}) // { [itemId]: { [questionId]: text } }
  const [writingAnswers, setWritingAnswers] = useState({}) // { [itemId]: text }
  const [saved, setSaved] = useState({}) // { [itemId]: true }
  const [saving, setSaving] = useState(null) // itemId que se está guardando
  const [studentName, setStudentName] = useStudentName()
  // Un id de entrega por ítem, fijo mientras el alumno esté en la página:
  // si toca "Seguir editando" y vuelve a guardar, se actualiza la misma
  // entrega en vez de crear una duplicada.
  const submissionIds = useRef({})

  const itemHasAnswer = (item) =>
    item.type === 'reading'
      ? Object.values(readingAnswers[item.id] || {}).some(hasText)
      : hasText(writingAnswers[item.id])

  const handleSave = async (item) => {
    setSaving(item.id)
    const [sub] = buildReadingWritingSubmissions([item], readingAnswers, writingAnswers)
    if (sub) {
      const { itemId, ...rest } = sub
      const existing = submissionIds.current[itemId]
      const id = existing || newSubmissionId()
      submissionIds.current[itemId] = id
      await recordSubmission({
        ...submission,
        id,
        replace: Boolean(existing),
        contentType: 'reading_writing',
        studentName,
        ...rest,
      })
    }
    setSaving(null)
    setSaved((m) => ({ ...m, [item.id]: true }))
  }

  const single = items.length === 1

  return (
    <>
      {items.map((item) => {
        const isSaved = Boolean(saved[item.id])
        const hasOpen = item.type === 'reading' && (item.questions || []).some((q) => !isAutoGraded(q))
        const footer = (
          <ItemSave
            s={s}
            c={c}
            kids={kids}
            studentName={studentName}
            setStudentName={setStudentName}
            hasAnswer={itemHasAnswer(item)}
            saving={saving === item.id}
            saved={isSaved}
            onSave={() => handleSave(item)}
            onEdit={() => setSaved((m) => ({ ...m, [item.id]: false }))}
            emptyHint={item.type === 'reading' ? 'Respondé al menos una pregunta para poder guardar.' : 'Escribí tu texto para poder guardar.'}
            doneHint={
              item.type === 'reading'
                ? hasOpen
                  ? 'Las de opción múltiple ya están corregidas arriba; las respuestas escritas las revisa tu profe.'
                  : 'Arriba podés ver cuáles respondiste bien.'
                : null
            }
          />
        )
        return item.type === 'reading' ? (
          <ReadingItem
            key={item.id}
            item={item}
            s={s}
            answers={readingAnswers[item.id] || {}}
            disabled={isSaved}
            showResults={isSaved}
            defaultOpen={single}
            footer={footer}
            onChange={(qId, value) => setReadingAnswers((a) => ({ ...a, [item.id]: { ...a[item.id], [qId]: value } }))}
          />
        ) : (
          <WritingItem
            key={item.id}
            item={item}
            s={s}
            text={writingAnswers[item.id] || ''}
            disabled={isSaved}
            defaultOpen={single}
            footer={footer}
            onChange={(value) => setWritingAnswers((a) => ({ ...a, [item.id]: value }))}
          />
        )
      })}
    </>
  )
}
