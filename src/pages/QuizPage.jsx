import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import NameField from '../components/NameField.jsx'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function QuizPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'quiz'), 'quiz'),
    ])
      .then(([trackData, temarioData, quizData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setQuiz(quizData || null)
        setAnswers({})
        setSubmitted(false)
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
    return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Cargando…</div>
  }
  if (status === 'error' || !theme || !temario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = THEME_COLORS[theme.color_key]

  if (!quiz) {
    return (
      <div className="min-h-screen">
        <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Cuestionario']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <EmptyState label="cuestionarios" />
        </div>
      </div>
    )
  }

  const score = quiz.questions.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Cuestionario']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Cuestionario
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">{quiz.title}</h1>
        <p className="text-ink/60 mb-8">Elegí la opción correcta en cada pregunta.</p>

        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, qi) => (
            <div key={q.id} className={`texture-card rounded-2xl ${c.borderT4} p-6`}>
              <p className="font-mono text-xs text-ink/40 mb-2">Pregunta {qi + 1}</p>
              {q.image_url && <img src={q.image_url} alt="" className="w-full max-h-56 object-cover rounded-lg mb-4" />}
              <p className="font-semibold text-ink mb-4">{q.q}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[q.id] === oi
                  const correct = submitted && oi === q.answer
                  const wrong = submitted && chosen && oi !== q.answer
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`text-left px-4 py-3 rounded-lg border-2 transition-colors flex items-center justify-between gap-2
                        ${chosen && !submitted ? 'border-ink bg-ink/5' : 'border-ink/15'}
                        ${correct ? 'border-olive bg-olive/10' : ''}
                        ${wrong ? 'border-stamp bg-stamp/10' : ''}
                      `}
                    >
                      <span>{opt}</span>
                      {correct && <CheckCircle2 size={18} className="text-olive shrink-0" />}
                      {wrong && <XCircle size={18} className="text-stamp shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <div className="mt-8">
            <NameField value={studentName} onChange={setStudentName} c={c} />
            <button
              onClick={() => {
                setSubmitted(true)
                recordSubmission({
                  scope: 'adultos',
                  levelSlug: slug,
                  trackSlug: themeSlug,
                  temarioSlug,
                  contentType: 'quiz',
                  label: quiz.title,
                  studentName,
                  score,
                  total: quiz.questions.length,
                  detail: quiz.questions.map((q) => ({
                    id: q.id,
                    question: q.q,
                    given: q.options[answers[q.id]] ?? null,
                    correct: q.options[q.answer],
                    is_correct: answers[q.id] === q.answer,
                  })),
                })
              }}
              disabled={Object.keys(answers).length < quiz.questions.length}
              className={`w-full bg-ink text-cream font-semibold py-3 rounded-lg ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Corregir
            </button>
          </div>
        ) : (
          <div className="mt-8 texture-card rounded-2xl p-6 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              {score} / {quiz.questions.length} correctas
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
              }}
              className={`mt-4 text-ink/60 ${c.hoverText} text-sm font-medium underline`}
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
