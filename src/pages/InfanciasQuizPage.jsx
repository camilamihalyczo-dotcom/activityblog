import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGroup, KIDS_GROUP_COLORS } from '../data/kidsGroups.js'
import { KIDS_CONTENT_BY_GROUP } from '../data/kidsContentIndex.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function InfanciasQuizPage() {
  const { group: slug } = useParams()
  const group = getGroup(slug)
  const c = KIDS_GROUP_COLORS[group.color]
  const { quiz } = KIDS_CONTENT_BY_GROUP[slug]
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz) {
    return (
      <div className="min-h-screen bg-kidsCream">
        <KidsHeader crumbs={[group.name, 'Cuestionario']} backTo={`/infancias/${slug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <KidsEmptyState label="cuestionarios" />
        </div>
      </div>
    )
  }

  const score = quiz.questions.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Cuestionario']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Cuestionario ✅
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">{quiz.title}</h1>
        <p className="font-playful text-kidsInk/65 mb-8">Elegí la opción correcta en cada pregunta.</p>

        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, qi) => (
            <div key={q.id} className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6`}>
              <p className="font-playful text-xs text-kidsInk/45 mb-2 font-semibold">Pregunta {qi + 1}</p>
              <p className="font-playful font-semibold text-kidsInk mb-4">{q.q}</p>
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
                      className={`text-left px-4 py-3 rounded-xl border-2 font-playful transition-colors flex items-center justify-between gap-2
                        ${chosen && !submitted ? 'border-kidsInk bg-kidsInk/5' : 'border-kidsInk/12'}
                        ${correct ? 'border-kidsGreenDeep bg-kidsGreen/15' : ''}
                        ${wrong ? 'border-kidsRed bg-kidsRed/10' : ''}
                      `}
                    >
                      <span>{opt}</span>
                      {correct && <CheckCircle2 size={18} className="text-kidsGreenDeep shrink-0" />}
                      {wrong && <XCircle size={18} className="text-kidsRed shrink-0" />}
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
            disabled={Object.keys(answers).length < quiz.questions.length}
            className={`mt-8 w-full bg-kidsInk text-white font-playful font-semibold py-3 rounded-full ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Corregir
          </button>
        ) : (
          <div className="mt-8 bg-white rounded-[22px] shadow-kids p-6 text-center">
            <p className="font-body font-extrabold text-2xl text-kidsInk">
              {score} / {quiz.questions.length} correctas
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
