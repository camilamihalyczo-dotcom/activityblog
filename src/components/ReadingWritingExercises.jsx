import { useRef, useState } from 'react'
import { BookOpen, CheckCircle2, PenLine, XCircle } from 'lucide-react'
import { buildReadingWritingSubmissions, correctOptionText, isAutoGraded } from '../lib/readingWriting.js'
import { getSkin } from '../lib/skin.js'
import { newSubmissionId, recordSubmission, useStudentName } from '../lib/submissions.js'
import NameField from './NameField.jsx'
import CollapsibleExercise from './CollapsibleExercise.jsx'

// Reading & Writing — un único componente para Adultos e Infancias (el
// estilo sale de src/lib/skin.js). Muestra todos los readings y writings
// de un temario/grupo y los guarda juntos con un solo botón:
// - las preguntas multiple choice de un Reading se corrigen solas;
// - las abiertas y los Writing quedan para que los revise la profe.
// `submission` = dónde vive ({ scope: 'adultos', levelSlug, trackSlug,
// temarioSlug } o { scope: 'infancias', groupSlug }).

function ReadingItem({ item, s, answers, onChange, disabled, showResults, defaultOpen }) {
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
    </CollapsibleExercise>
  )
}

function WritingItem({ item, s, text, onChange, disabled, defaultOpen }) {
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
    </CollapsibleExercise>
  )
}

export default function ReadingWritingExercises({ items, c, kids = false, submission }) {
  const s = getSkin(c, kids)
  const [readingAnswers, setReadingAnswers] = useState({}) // { [itemId]: { [questionId]: text } }
  const [writingAnswers, setWritingAnswers] = useState({}) // { [itemId]: text }
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentName, setStudentName] = useStudentName()
  // Un id de entrega por ítem, fijo mientras el alumno esté en la página:
  // si toca "Seguir editando" y vuelve a guardar, se actualiza la misma
  // entrega en vez de crear una duplicada.
  const submissionIds = useRef({})

  const hasAnyAnswer =
    Object.values(readingAnswers).some((qs) => Object.values(qs || {}).some((v) => v && v.trim() !== '')) ||
    Object.values(writingAnswers).some((v) => v && v.trim() !== '')

  const handleSave = async () => {
    setSaving(true)
    const submissions = buildReadingWritingSubmissions(items, readingAnswers, writingAnswers)
    // Primera vez que se guarda un ítem: id nuevo. Las siguientes: mismo id
    // + replace, para actualizar en vez de duplicar.
    const submissionIdFor = (itemId) => {
      const existing = submissionIds.current[itemId]
      if (existing) return { id: existing, replace: true }
      const id = newSubmissionId()
      submissionIds.current[itemId] = id
      return { id, replace: false }
    }
    await Promise.all(
      submissions.map(({ itemId, ...sub }) =>
        recordSubmission({
          ...submission,
          ...submissionIdFor(itemId),
          contentType: 'reading_writing',
          studentName,
          ...sub,
        })
      )
    )
    setSaving(false)
    setSaved(true)
  }

  const single = items.length === 1

  return (
    <>
      {items.map((item) =>
        item.type === 'reading' ? (
          <ReadingItem
            key={item.id}
            item={item}
            s={s}
            answers={readingAnswers[item.id] || {}}
            disabled={saved}
            showResults={saved}
            defaultOpen={single}
            onChange={(qId, value) => setReadingAnswers((a) => ({ ...a, [item.id]: { ...a[item.id], [qId]: value } }))}
          />
        ) : (
          <WritingItem
            key={item.id}
            item={item}
            s={s}
            text={writingAnswers[item.id] || ''}
            disabled={saved}
            defaultOpen={single}
            onChange={(value) => setWritingAnswers((a) => ({ ...a, [item.id]: value }))}
          />
        )
      )}

      {!saved ? (
        <div className="mt-2">
          <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
          <button
            onClick={handleSave}
            disabled={!hasAnyAnswer || saving || !studentName.trim()}
            className={`w-full py-3 ${s.primary} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {saving ? 'Guardando…' : 'Guardar mis respuestas'}
          </button>
          <p className={`${s.muted} text-xs mt-2`}>
            {!hasAnyAnswer
              ? 'Respondé al menos una pregunta o escribí algo para poder guardar.'
              : !studentName.trim()
              ? 'Escribí tu nombre para poder guardar.'
              : 'Las preguntas de opción múltiple se corrigen solas; lo que escribís lo revisa tu profe.'}
          </p>
        </div>
      ) : (
        <div className={`mt-2 ${s.resultBox} p-6 text-center`}>
          <p className={s.resultTitle.replace('text-2xl', 'text-xl')}>¡Guardado! Tu profe ya lo puede ver.</p>
          <button onClick={() => setSaved(false)} className={`mt-4 ${s.link}`}>
            Seguir editando
          </button>
        </div>
      )}
    </>
  )
}
