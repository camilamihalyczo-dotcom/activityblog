import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { newSubmissionId, recordSubmission, useStudentName } from '../lib/submissions.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import NameField from '../components/NameField.jsx'
import CollapsibleExercise from '../components/CollapsibleExercise.jsx'
import { BookOpen, PenLine, CheckCircle2, XCircle } from 'lucide-react'
import { buildReadingWritingSubmissions, correctOptionText, isAutoGraded } from '../lib/readingWriting.js'

function ReadingItem({ item, c, answers, onChange, disabled, showResults, defaultOpen }) {
  return (
    <CollapsibleExercise
      title={item.title}
      label="Reading"
      defaultOpen={defaultOpen}
      icon={BookOpen}
      className={`texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8 text-ink`}
    >
      {item.image_url && (
        <img loading="lazy" decoding="async" src={item.image_url} alt="" className="w-full max-h-64 object-cover rounded-xl mb-4" />
      )}
      <p className="whitespace-pre-line text-ink/85 leading-relaxed mb-6">{item.text}</p>

      <div className="flex flex-col gap-4">
        {(item.questions || []).map((q, qi) => (
          <div key={q.id}>
            <p className="font-mono text-xs text-ink/60 mb-1">Pregunta {qi + 1}</p>
            <p className="font-medium text-ink mb-2 whitespace-pre-line">{q.q}</p>
            {q.type === 'multiple_choice' ? (
              <div className="flex flex-col gap-2">
                {(q.options || []).filter(Boolean).map((option, oi) => {
                  const correct = showResults && isAutoGraded(q) ? correctOptionText(q) : null
                  const chosen = answers[q.id] === option
                  return (
                  <label key={`${q.id}-${oi}`} className={`flex items-center gap-2 text-sm text-ink ${correct && option === correct ? 'font-semibold' : ''}`}>
                    <input
                      type="radio"
                      name={`reading-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={(e) => onChange(q.id, e.target.value)}
                      disabled={disabled}
                      className="accent-brand"
                    />
                    {option}
                    {correct && chosen && option === correct && <CheckCircle2 size={15} className="text-olive shrink-0" aria-label="Correcta" />}
                    {correct && chosen && option !== correct && <XCircle size={15} className="text-stamp shrink-0" aria-label="Incorrecta" />}
                  </label>
                  )
                })}
              </div>
            ) : (
              <textarea
                rows={2}
                value={answers[q.id] || ''}
                onChange={(e) => onChange(q.id, e.target.value)}
                disabled={disabled}
                placeholder="Escribí tu respuesta acá..."
                className={`w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm ${c.focusBorder} outline-none transition-colors resize-none disabled:opacity-60`}
              />
            )}
          </div>
        ))}
      </div>
    </CollapsibleExercise>
  )
}

function WritingItem({ item, c, text, onChange, disabled, defaultOpen }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <CollapsibleExercise
      title={item.title}
      label="Writing"
      defaultOpen={defaultOpen}
      icon={PenLine}
      className={`texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8 text-ink`}
    >
      {item.image_url && (
        <img loading="lazy" decoding="async" src={item.image_url} alt="" className="w-full max-h-64 object-cover rounded-xl mb-4" />
      )}
      <p className="text-ink/70 mb-4 whitespace-pre-line">{item.prompt}</p>
      <textarea
        rows={8}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Escribí tu producción acá..."
        className={`w-full px-4 py-3 rounded-lg border-2 border-ink/15 bg-paper text-sm leading-relaxed ${c.focusBorder} outline-none transition-colors resize-y disabled:opacity-60`}
      />
      <p className="text-right font-mono text-xs text-ink/60 mt-2">{words} palabras</p>
    </CollapsibleExercise>
  )
}

export default function ReadingWritingPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [readingWriting, setReadingWriting] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [readingAnswers, setReadingAnswers] = useState({}) // { [itemId]: { [questionId]: text } }
  const [writingAnswers, setWritingAnswers] = useState({}) // { [itemId]: text }
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentName, setStudentName] = useStudentName()
  // Un id de entrega por ítem, fijo mientras el alumno esté en la página:
  // si toca "Seguir editando" y vuelve a guardar, se actualiza la misma
  // entrega en vez de crear una duplicada.
  const submissionIds = useRef({})

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'reading_writing'), 'reading_writing'),
    ])
      .then(([trackData, temarioData, readingWritingData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setReadingWriting(readingWritingData || [])
        setReadingAnswers({})
        setWritingAnswers({})
        submissionIds.current = {}
        setSaved(false)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug, themeSlug, temarioSlug])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  }
  if (status === 'error' || !theme || !temario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = THEME_COLORS[theme.color_key]

  const hasAnyAnswer =
    Object.values(readingAnswers).some((qs) => Object.values(qs || {}).some((v) => v && v.trim() !== '')) ||
    Object.values(writingAnswers).some((v) => v && v.trim() !== '')

  const handleSave = async () => {
    setSaving(true)
    const submissions = buildReadingWritingSubmissions(readingWriting, readingAnswers, writingAnswers)
    // Primera vez que se guarda este ítem: id nuevo. Las siguientes:
    // mismo id + replace, para actualizar en vez de duplicar.
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
          ...submissionIdFor(itemId),
          scope: 'adultos',
          levelSlug: slug,
          trackSlug: themeSlug,
          temarioSlug,
          contentType: 'reading_writing',
          studentName,
          ...sub,
        })
      )
    )
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Reading & Writing']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Reading & Writing
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Reading & Writing</h1>
        <p className="text-ink/60 mb-8">Leé, respondé y practicá tu producción escrita.</p>

        {readingWriting.length === 0 ? (
          <EmptyState label="ejercicios de reading/writing" />
        ) : (
          <>
            {readingWriting.map((item) =>
              item.type === 'reading' ? (
                <ReadingItem
                  key={item.id}
                  item={item}
                  c={c}
                  answers={readingAnswers[item.id] || {}}
                  disabled={saved}
                  showResults={saved}
                  defaultOpen={readingWriting.length === 1}
                  onChange={(qId, value) =>
                    setReadingAnswers((a) => ({ ...a, [item.id]: { ...a[item.id], [qId]: value } }))
                  }
                />
              ) : (
                <WritingItem
                  key={item.id}
                  item={item}
                  c={c}
                  text={writingAnswers[item.id] || ''}
                  disabled={saved}
                  defaultOpen={readingWriting.length === 1}
                  onChange={(value) => setWritingAnswers((a) => ({ ...a, [item.id]: value }))}
                />
              )
            )}

            {!saved ? (
              <div className="mt-2">
                <NameField value={studentName} onChange={setStudentName} c={c} />
                <button
                  onClick={handleSave}
                  disabled={!hasAnyAnswer || saving || !studentName.trim()}
                  className={`w-full bg-ink text-cream font-semibold py-3 rounded-lg ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {saving ? 'Guardando…' : 'Guardar mis respuestas'}
                </button>
                <p className="text-ink/60 text-xs mt-2">
                  {!hasAnyAnswer
                    ? 'Respondé al menos una pregunta o escribí algo para poder guardar.'
                    : !studentName.trim()
                    ? 'Escribí tu nombre para poder guardar.'
                    : 'Las preguntas de opción múltiple se corrigen solas; las respuestas abiertas y el writing los revisa tu profe.'}
                </p>
              </div>
            ) : (
              <div className="mt-2 texture-card rounded-2xl p-6 text-center">
                <p className="font-display text-xl font-semibold text-ink">¡Guardado! Tu profe ya lo puede ver.</p>
                <button
                  onClick={() => setSaved(false)}
                  className={`mt-4 text-ink/60 ${c.hoverText} text-sm font-medium underline`}
                >
                  Seguir editando
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
