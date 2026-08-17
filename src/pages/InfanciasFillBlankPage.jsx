import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { isAnswerCorrect, splitSentenceAtBlank } from '../lib/text.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
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
    <div className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6`}>
      {item.image_url && <img src={item.image_url} alt="" className="w-full max-h-56 object-cover rounded-xl mb-4" />}

      {options.length > 0 ? (
        <>
          <p className="font-playful text-kidsInk mb-3 leading-relaxed">
            {before}
            <span className="font-semibold text-kidsInk/40">{value || '_____'}</span>
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
                  className={`px-4 py-2 rounded-xl border-2 font-playful transition-colors flex items-center gap-2 text-sm
                    ${chosen && !submitted ? 'border-kidsInk bg-kidsInk/5' : 'border-kidsInk/12'}
                    ${optCorrect ? 'border-kidsGreenDeep bg-kidsGreen/15' : ''}
                    ${optWrong ? 'border-kidsRed bg-kidsRed/10' : ''}
                  `}
                >
                  {opt}
                  {optCorrect && <CheckCircle2 size={14} className="text-kidsGreenDeep shrink-0" />}
                  {optWrong && <XCircle size={14} className="text-kidsRed shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <p className="font-playful text-kidsInk leading-relaxed flex flex-wrap items-center gap-2">
          <span>{before}</span>
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={submitted}
            className={`inline-block w-36 px-2 py-1 rounded-xl border-2 font-playful text-sm bg-kidsCream transition-colors
              ${!submitted ? `border-kidsInk/12 focus:outline focus:outline-3 ${c.outline} outline-none` : ''}
              ${correct ? 'border-kidsGreenDeep bg-kidsGreen/15' : ''}
              ${wrong ? 'border-kidsRed bg-kidsRed/10' : ''}
            `}
          />
          <span>{after}</span>
          {correct && <CheckCircle2 size={16} className="text-kidsGreenDeep shrink-0" />}
          {wrong && (
            <>
              <XCircle size={16} className="text-kidsRed shrink-0" />
              <span className="font-playful text-xs text-kidsInk/45">→ {item.answer.split('/')[0].trim()}</span>
            </>
          )}
        </p>
      )}
    </div>
  )
}

export default function InfanciasFillBlankPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'fill_blank'), 'fill_blank')])
      .then(([groupData, itemsData]) => {
        if (!active) return
        setGroup(groupData)
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-kidsCream">
        <KidsHeader crumbs={[group.name, 'Completar oraciones']} backTo={`/infancias/${slug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <KidsEmptyState label="oraciones para completar" />
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
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Completar oraciones']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Completar oraciones ✏️
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Completar oraciones</h1>
        <p className="font-playful text-kidsInk/65 mb-8">Completá el espacio en cada oración.</p>

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
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className={`mt-8 w-full bg-kidsInk text-white font-playful font-semibold py-3 rounded-full ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Corregir
          </button>
        ) : (
          <div className="mt-8 bg-white rounded-[22px] shadow-kids p-6 text-center">
            <p className="font-body font-extrabold text-2xl text-kidsInk">
              {score} / {items.length} correctas
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setAnswers({})
              }}
              className={`mt-4 text-kidsInk/60 ${c.hoverText} font-playful text-sm font-semibold underline`}
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
