import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { getTheme, getTemario, THEME_COLORS } from '../data/themes.js'
import { getTemarioContent } from '../data/contentIndex.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { FileText, CheckCircle2, XCircle, Video } from 'lucide-react'

function ListeningItem({ item, c }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className={`texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8`}>
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">{item.title}</h2>

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
        <button
          onClick={() => setSubmitted(true)}
          className={`mt-6 bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg ${c.hoverBg} transition-colors text-sm`}
        >
          Corregir
        </button>
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
  const theme = getTheme(themeSlug)
  const temario = getTemario(themeSlug, temarioSlug)
  const c = THEME_COLORS[theme.color]
  const { listenings } = getTemarioContent(slug, themeSlug, temarioSlug)

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
          listenings.map((item) => <ListeningItem key={item.id} item={item} c={c} />)
        )}
      </div>
    </div>
  )
}
