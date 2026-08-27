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
import { FileText, CheckCircle2, XCircle, Video } from 'lucide-react'

function ListeningItem({ item, c, levelSlug, themeSlug, temarioSlug }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()
  const score = item.questions.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className={`texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8`}>
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">{item.title}</h2>

      {item.image_url && (
        <img src={item.image_url} alt="" className="w-full max-h-56 object-cover rounded-xl mb-4" />
      )}

      <div className="aspect-video rounded-xl overflow-hidden bg-ink/5 flex items-center justify-center mb-4">
        {item.youtubeId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${item.youtubeId}`}
            title={item.title}
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink/40 p-6 text-center">
            <Video size={28} />
            <p className="text-sm">Video de muestra — reemplazar por el ID de YouTube real en los datos de este nivel.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowTranscript((s) => !s)}
        className={`flex items-center gap-2 text-ink/70 ${c.hoverText} text-sm font-medium mb-4 transition-colors`}
      >
        <FileText size={16} /> {showTranscript ? 'Ocultar' : 'Ver'} transcripción
      </button>

      {showTranscript && (
        <pre className="whitespace-pre-wrap font-body text-sm text-ink/80 bg-paper rounded-lg p-4 mb-6 leading-relaxed">
          {item.transcript}
        </pre>
      )}

      <div className="flex flex-col gap-4">
        {item.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-mono text-xs text-ink/40 mb-1">Pregunta {qi + 1}</p>
            {q.image_url && <img src={q.image_url} alt="" className="w-full max-h-56 object-cover rounded-lg mb-2" />}
            <p className="font-semibold text-ink mb-2">{q.q}</p>
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
                    className={`text-left px-4 py-2.5 rounded-lg border-2 transition-colors flex items-center justify-between
                      ${chosen && !submitted ? 'border-ink bg-ink/5' : 'border-ink/15'}
                      ${correct ? 'border-olive bg-olive/10' : ''}
                      ${wrong ? 'border-stamp bg-stamp/10' : ''}
                    `}
                  >
                    <span className="text-sm">{opt}</span>
                    {correct && <CheckCircle2 size={16} className="text-olive shrink-0" />}
                    {wrong && <XCircle size={16} className="text-stamp shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="mt-6">
          <NameField value={studentName} onChange={setStudentName} c={c} />
          <button
            onClick={() => {
              setSubmitted(true)
              recordSubmission({
                scope: 'adultos',
                levelSlug,
                trackSlug: themeSlug,
                temarioSlug,
                contentType: 'listening',
                label: item.title,
                studentName,
                score,
                total: item.questions.length,
                detail: item.questions.map((q) => ({
                  id: q.id,
                  question: q.q,
                  given: q.options[answers[q.id]] ?? null,
                  correct: q.options[q.answer],
                  is_correct: answers[q.id] === q.answer,
                })),
              })
            }}
            disabled={!studentName.trim()}
            className={`bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg ${c.hoverBg} transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Corregir
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setSubmitted(false)
            setAnswers({})
          }}
          className={`mt-6 text-ink/60 ${c.hoverText} text-sm font-medium underline`}
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

export default function ListeningPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [listenings, setListenings] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'listening'), 'listening'),
    ])
      .then(([trackData, temarioData, listeningData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setListenings(listeningData || [])
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

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Listening']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Listening
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Listening</h1>
        <p className="text-ink/60 mb-8">Mirá el video, leé la transcripción si la necesitás y respondé.</p>

        {listenings.length === 0 ? (
          <EmptyState label="listenings" />
        ) : (
          listenings.map((item) => (
            <ListeningItem key={item.id} item={item} c={c} levelSlug={slug} themeSlug={themeSlug} temarioSlug={temarioSlug} />
          ))
        )}
      </div>
    </div>
  )
}
