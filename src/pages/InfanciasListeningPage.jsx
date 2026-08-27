import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import NameField from '../components/NameField.jsx'
import { FileText, CheckCircle2, XCircle, Video } from 'lucide-react'

function ListeningItem({ item, c, groupSlug }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()
  const score = item.questions.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6 sm:p-8 mb-8`}>
      <h2 className="font-body font-extrabold uppercase tracking-wide text-xl sm:text-2xl text-kidsInk mb-4">{item.title}</h2>

      {item.image_url && (
        <img src={item.image_url} alt="" className="w-full max-h-56 object-cover rounded-2xl mb-4" />
      )}

      <div className="aspect-video rounded-2xl overflow-hidden bg-kidsInk/5 flex items-center justify-center mb-4">
        {item.youtubeId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${item.youtubeId}`}
            title={item.title}
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-kidsInk/40 p-6 text-center">
            <Video size={28} />
            <p className="font-playful text-sm">Video de muestra — reemplazar por el ID de YouTube real en los datos de este grupo.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowTranscript((s) => !s)}
        className={`flex items-center gap-2 text-kidsInk/70 ${c.hoverText} font-playful text-sm font-semibold mb-4 transition-colors`}
      >
        <FileText size={16} /> {showTranscript ? 'Ocultar' : 'Ver'} transcripción
      </button>

      {showTranscript && (
        <pre className="whitespace-pre-wrap font-playful text-sm text-kidsInk/80 bg-kidsCream rounded-xl p-4 mb-6 leading-relaxed">
          {item.transcript}
        </pre>
      )}

      <div className="flex flex-col gap-4">
        {item.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-playful text-xs text-kidsInk/45 mb-1 font-semibold">Pregunta {qi + 1}</p>
            {q.image_url && <img src={q.image_url} alt="" className="w-full max-h-56 object-cover rounded-xl mb-2" />}
            <p className="font-playful font-semibold text-kidsInk mb-2">{q.q}</p>
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
                    className={`text-left px-4 py-2.5 rounded-xl border-2 font-playful transition-colors flex items-center justify-between
                      ${chosen && !submitted ? 'border-kidsInk bg-kidsInk/5' : 'border-kidsInk/12'}
                      ${correct ? 'border-kidsGreenDeep bg-kidsGreen/15' : ''}
                      ${wrong ? 'border-kidsRed bg-kidsRed/10' : ''}
                    `}
                  >
                    <span className="text-sm">{opt}</span>
                    {correct && <CheckCircle2 size={16} className="text-kidsGreenDeep shrink-0" />}
                    {wrong && <XCircle size={16} className="text-kidsRed shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="mt-6">
          <NameField value={studentName} onChange={setStudentName} kids c={c} />
          <button
            onClick={() => {
              setSubmitted(true)
              recordSubmission({
                scope: 'infancias',
                groupSlug,
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
            className={`bg-kidsInk text-white font-playful font-semibold px-5 py-2.5 rounded-full ${c.hoverBg} transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
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
          className={`mt-6 text-kidsInk/60 ${c.hoverText} font-playful text-sm font-semibold underline`}
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

export default function InfanciasListeningPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [listenings, setListenings] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'listening'), 'listening')])
      .then(([groupData, listeningData]) => {
        if (!active) return
        setGroup(groupData)
        setListenings(listeningData || [])
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug])

  if (status === 'loading') {
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/50 font-playful text-sm">Cargando…</div>
  }
  if (status === 'error' || !group) {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = KIDS_GROUP_COLORS[group.color_key]

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Listening']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Listening 🎧
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Listening</h1>
        <p className="font-playful text-kidsInk/65 mb-8">Mirá el video, leé la transcripción si la necesitás y respondé.</p>

        {listenings.length === 0 ? (
          <KidsEmptyState label="listenings" />
        ) : (
          listenings.map((item) => <ListeningItem key={item.id} item={item} c={c} groupSlug={slug} />)
        )}
      </div>
    </div>
  )
}
