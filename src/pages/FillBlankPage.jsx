import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { isAnswerCorrect, splitSentenceAtBlank } from '../lib/text.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import NameField from '../components/NameField.jsx'
import { CheckCircle2, XCircle } from 'lucide-react'

function isItemCorrect(item, userAnswer) {
  if ((item.options || []).length > 0) return userAnswer === item.answer
  return userAnswer != null && isAnswerCorrect(userAnswer, item.answer)
}

function FillBlankItem({ item, c, value, onChange, submitted }) {
  const { before, after } = splitSentenceAtBlank(item.sentence)
  const options = item.options || []
  const correct = submitted && isItemCorrect(item, value)
  const wrong = submitted && value != null && !isItemCorrect(item, value)

  return (
    <div className={`texture-card rounded-2xl ${c.borderT4} p-6`}>
      {item.image_url && <img src={item.image_url} alt="" className="w-full max-h-56 object-cover rounded-lg mb-4" />}

      {options.length > 0 ? (
        <>
          <p className="text-ink mb-3 leading-relaxed">
            {before}
            <span className="font-semibold text-ink/40">{value || '_____'}</span>
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
                  className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 text-sm
                    ${chosen && !submitted ? 'border-ink bg-ink/5' : 'border-ink/15'}
                    ${optCorrect ? 'border-olive bg-olive/10' : ''}
                    ${optWrong ? 'border-stamp bg-stamp/10' : ''}
                  `}
                >
                  {opt}
                  {optCorrect && <CheckCircle2 size={14} className="text-olive shrink-0" />}
                  {optWrong && <XCircle size={14} className="text-stamp shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <p className="text-ink leading-relaxed flex flex-wrap items-center gap-2">
          <span>{before}</span>
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={submitted}
            className={`inline-block w-36 px-2 py-1 rounded-lg border-2 text-sm bg-paper transition-colors
              ${!submitted ? `border-ink/15 ${c.focusBorder} outline-none` : ''}
              ${correct ? 'border-olive bg-olive/10' : ''}
              ${wrong ? 'border-stamp bg-stamp/10' : ''}
            `}
          />
          <span>{after}</span>
          {correct && <CheckCircle2 size={16} className="text-olive shrink-0" />}
          {wrong && (
            <>
              <XCircle size={16} className="text-stamp shrink-0" />
              <span className="font-mono text-xs text-ink/50">→ {item.answer.split('/')[0].trim()}</span>
            </>
          )}
        </p>
      )}
    </div>
  )
}

export default function FillBlankPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [items, setItems] = useState([])
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
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'fill_blank'), 'fill_blank'),
    ])
      .then(([trackData, temarioData, itemsData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setItems(itemsData || [])
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Completar oraciones']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <EmptyState label="oraciones para completar" />
        </div>
      </div>
    )
  }

  const score = items.filter((item) => isItemCorrect(item, answers[item.id])).length
  const allAnswered = items.every((item) => {
    const v = answers[item.id]
    return v != null && String(v).trim() !== ''
  })

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Completar oraciones']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Completar oraciones
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Completar oraciones</h1>
        <p className="text-ink/60 mb-8">Completá el espacio en cada oración.</p>

        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <FillBlankItem
              key={item.id}
              item={item}
              c={c}
              value={answers[item.id]}
              onChange={(value) => setAnswers((a) => ({ ...a, [item.id]: value }))}
              submitted={submitted}
            />
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
                  contentType: 'fill_blank',
                  studentName,
                  score,
                  total: items.length,
                  detail: items.map((item) => ({
                    id: item.id,
                    sentence: item.sentence,
                    given: answers[item.id] ?? null,
                    correct: item.answer,
                    is_correct: isItemCorrect(item, answers[item.id]),
                  })),
                })
              }}
              disabled={!allAnswered || !studentName.trim()}
              className={`w-full bg-ink text-cream font-semibold py-3 rounded-lg ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Corregir
            </button>
          </div>
        ) : (
          <div className="mt-8 texture-card rounded-2xl p-6 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              {score} / {items.length} correctas
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
