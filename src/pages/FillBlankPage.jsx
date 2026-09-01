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

function shuffle(arr) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

// Para el modo "banco de palabras compartido": cada oración con respuesta
// aporta una ficha al banco. La corrección se fija por la oración de
// origen de la ficha (no por comparar texto), igual que en Pronunciación.
function buildWordBankData(sentences) {
  const valid = (sentences || []).filter((s) => (s.answer || '').trim())
  const chips = valid.map((s) => ({ id: `${s.id}-c`, text: s.answer.trim(), sentenceId: s.id }))
  const slots = valid.map((s) => ({ id: `${s.id}-s`, sentenceId: s.id }))
  return { sentences: valid, chips, slots }
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

// Cada temario puede tener más de un ejercicio de completar oraciones —
// por eso cada uno corrige y se envía por separado, con su propio puntaje.
function FillBlankGroup({ exercise, c, levelSlug, themeSlug, temarioSlug }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  if (exercise.sentences.length === 0) return null

  const score = exercise.sentences.filter((item) => isItemCorrect(item, answers[item.id])).length
  const allAnswered = exercise.sentences.every((item) => {
    const v = answers[item.id]
    return v != null && String(v).trim() !== ''
  })

  return (
    <div className="mb-10">
      {exercise.title && <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">{exercise.title}</h2>}
      <div className="flex flex-col gap-6">
        {exercise.sentences.map((item) => (
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
                levelSlug,
                trackSlug: themeSlug,
                temarioSlug,
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
            {score} / {exercise.sentences.length} correctas
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
  )
}

// Modo "banco de palabras compartido": en vez de opciones propias por
// oración, todas las respuestas del ejercicio se mezclan en un solo banco
// y el alumno toca una palabra y después el casillero donde cree que va —
// misma mecánica que Pronunciación.
function FillBlankWordBankGroup({ exercise, c, levelSlug, themeSlug, temarioSlug }) {
  const { sentences, chips, slots } = buildWordBankData(exercise.sentences)
  const [bankOrder, setBankOrder] = useState(() => shuffle(chips.map((chip) => chip.id)))
  const [placements, setPlacements] = useState({})
  const [selectedChipId, setSelectedChipId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  if (sentences.length === 0) return null

  const chipsById = Object.fromEntries(chips.map((chip) => [chip.id, chip]))
  const placedChipIds = new Set(Object.values(placements))
  const bankChipIds = bankOrder.filter((id) => !placedChipIds.has(id))
  const allPlaced = Object.keys(placements).length === slots.length
  const score = slots.filter((s) => chipsById[placements[s.id]]?.sentenceId === s.sentenceId).length

  const handleChipClick = (chipId) => {
    if (submitted) return
    setSelectedChipId((cur) => (cur === chipId ? null : chipId))
  }
  const handleSlotClick = (slotId) => {
    if (submitted) return
    if (selectedChipId) {
      setPlacements((p) => {
        const next = {}
        for (const [sid, cid] of Object.entries(p)) {
          if (cid !== selectedChipId) next[sid] = cid
        }
        next[slotId] = selectedChipId
        return next
      })
      setSelectedChipId(null)
    } else if (placements[slotId]) {
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
      scope: 'adultos',
      levelSlug,
      trackSlug: themeSlug,
      temarioSlug,
      contentType: 'fill_blank',
      label: exercise.title,
      studentName,
      score,
      total: slots.length,
      detail: sentences.map((item) => {
        const chip = chipsById[placements[`${item.id}-s`]]
        return {
          id: item.id,
          sentence: item.sentence,
          given: chip?.text ?? null,
          correct: item.answer,
          is_correct: chip?.sentenceId === item.id,
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
    <div className="mb-10">
      {exercise.title && <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">{exercise.title}</h2>}
      <div className="flex flex-col gap-6">
        {sentences.map((item) => {
          const { before, after } = splitSentenceAtBlank(item.sentence)
          const slotId = `${item.id}-s`
          const chip = chipsById[placements[slotId]]
          const correct = submitted && chip && chip.sentenceId === item.id
          const wrong = submitted && (!chip || chip.sentenceId !== item.id)
          return (
            <div key={item.id} className={`texture-card rounded-2xl ${c.borderT4} p-6`}>
              {item.image_url && <img src={item.image_url} alt="" className="w-full max-h-56 object-cover rounded-lg mb-4" />}
              <p className="text-ink leading-relaxed flex flex-wrap items-center gap-2">
                <span>{before}</span>
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => handleSlotClick(slotId)}
                  className={`min-w-[96px] px-3 py-1.5 rounded-lg border-2 border-dashed text-sm font-medium transition-colors text-center
                    ${!chip ? 'border-ink/25 text-ink/30' : 'border-solid border-ink bg-ink/5 text-ink'}
                    ${correct ? 'border-solid border-olive bg-olive/10 text-ink' : ''}
                    ${wrong ? 'border-solid border-stamp bg-stamp/10 text-ink' : ''}
                  `}
                >
                  {chip ? chip.text : '···'}
                </button>
                <span>{after}</span>
                {correct && <CheckCircle2 size={16} className="text-olive shrink-0" />}
                {wrong && (
                  <>
                    <XCircle size={16} className="text-stamp shrink-0" />
                    <span className="font-mono text-xs text-ink/50">→ {item.answer}</span>
                  </>
                )}
              </p>
            </div>
          )
        })}
      </div>

      <div className="texture-card rounded-2xl p-5 mt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-3">Banco de palabras</p>
        <div className="flex flex-wrap gap-2">
          {bankChipIds.map((id) => {
            const chipItem = chipsById[id]
            const selected = selectedChipId === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleChipClick(id)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors
                  ${selected ? 'border-ink bg-ink text-cream' : 'border-ink/15 bg-paper text-ink hover:border-ink/40'}
                `}
              >
                {chipItem.text}
              </button>
            )
          })}
          {bankChipIds.length === 0 && <p className="text-ink/40 text-xs">Usaste todas las palabras.</p>}
        </div>
      </div>

      {!submitted ? (
        <div className="mt-8">
          <NameField value={studentName} onChange={setStudentName} c={c} />
          <button
            onClick={handleSubmit}
            disabled={!allPlaced || !studentName.trim()}
            className={`w-full bg-ink text-cream font-semibold py-3 rounded-lg ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Corregir
          </button>
        </div>
      ) : (
        <div className="mt-8 texture-card rounded-2xl p-6 text-center">
          <p className="font-display text-2xl font-semibold text-ink">
            {score} / {slots.length} correctas
          </p>
          <button onClick={retry} className={`mt-4 text-ink/60 ${c.hoverText} text-sm font-medium underline`}>
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}

export default function FillBlankPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [exercises, setExercises] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'fill_blank'), 'fill_blank'),
    ])
      .then(([trackData, temarioData, exercisesData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setExercises(exercisesData || [])
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
  const nonEmptyExercises = exercises.filter((e) => e.sentences.length > 0)

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Completar oraciones']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Completar oraciones
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Completar oraciones</h1>
        <p className="text-ink/60 mb-8">Completá el espacio en cada oración.</p>

        {nonEmptyExercises.length === 0 ? (
          <EmptyState label="oraciones para completar" />
        ) : (
          nonEmptyExercises.map((exercise) =>
            exercise.wordBank ? (
              <FillBlankWordBankGroup key={exercise.id} exercise={exercise} c={c} levelSlug={slug} themeSlug={themeSlug} temarioSlug={temarioSlug} />
            ) : (
              <FillBlankGroup key={exercise.id} exercise={exercise} c={c} levelSlug={slug} themeSlug={themeSlug} temarioSlug={temarioSlug} />
            )
          )
        )}
      </div>
    </div>
  )
}
