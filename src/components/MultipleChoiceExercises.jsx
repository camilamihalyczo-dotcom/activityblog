import { useState } from 'react'
import { CheckCircle2, FileText, Video, XCircle } from 'lucide-react'
import { getSkin } from '../lib/skin.js'
import { parseYouTubeId } from '../lib/youtube.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import CollapsibleExercise from './CollapsibleExercise.jsx'
import ExerciseSubmit from './ExerciseSubmit.jsx'
import QuestionHint from './QuestionHint.jsx'

// Cuestionario y Listening comparten la misma mecánica (preguntas de
// opción múltiple, `answer` = índice de la opción correcta). Un solo
// componente para Adultos e Infancias; el estilo sale de src/lib/skin.js.
// `submission` = dónde vive ({ scope: 'adultos', levelSlug, trackSlug,
// temarioSlug } o { scope: 'infancias', groupSlug }).

const validQuestions = (questions) =>
  (questions || []).filter((q) => q && (q.options || []).some((o) => String(o || '').trim()))

function QuestionList({ questions, answers, onAnswer, submitted, s, kids, nested }) {
  return (
    <div className={`flex flex-col ${nested ? 'gap-6' : 'gap-5'}`}>
      {questions.map((q, qi) => (
        <div key={q.id || qi} className={nested ? `${s.card} p-6` : ''}>
          <p className={`${s.small} mb-2`}>Pregunta {qi + 1}</p>
          {q.image_url && (
            <img loading="lazy" decoding="async" src={q.image_url} alt="" className={`w-full max-h-56 object-cover ${s.img} mb-4`} />
          )}
          <p className={`${s.text} font-semibold mb-2 whitespace-pre-line`}>{q.q}</p>
          <QuestionHint hint={q.hint} kids={kids} />
          <div className="flex flex-col gap-2">
            {(q.options || []).map((opt, oi) => {
              if (!String(opt || '').trim()) return null
              const chosen = answers[q.id] === oi
              const correct = submitted && oi === q.answer
              const wrong = submitted && chosen && oi !== q.answer
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => onAnswer(q.id, oi)}
                  aria-pressed={chosen}
                  className={`text-left px-4 py-3 border-2 ${s.option} text-sm transition-colors flex items-center justify-between gap-2
                    ${correct ? s.ok : wrong ? s.bad : chosen && !submitted ? s.chosen : s.idle}
                  `}
                >
                  <span>{opt}</span>
                  {correct && <CheckCircle2 size={18} className={`${s.okIcon} shrink-0`} />}
                  {wrong && <XCircle size={18} className={`${s.badIcon} shrink-0`} />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Estado + corrección + guardado comunes a los dos tipos.
function useMultipleChoice({ questions, submission, contentType, label }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()
  const score = questions.filter((q) => answers[q.id] === q.answer).length
  const answered = questions.filter((q) => answers[q.id] !== undefined).length
  const allAnswered = answered === questions.length

  const submit = () => {
    setSubmitted(true)
    recordSubmission({
      ...submission,
      contentType,
      label,
      studentName,
      score,
      total: questions.length,
      detail: questions.map((q) => ({
        id: q.id,
        question: q.q,
        given: q.options[answers[q.id]] ?? null,
        correct: q.options[q.answer],
        is_correct: answers[q.id] === q.answer,
      })),
    })
  }
  const retry = () => {
    setSubmitted(false)
    setAnswers({})
  }
  const footerProps = {
    studentName,
    setStudentName,
    disabled: !allAnswered || !studentName.trim(),
    hint: !allAnswered
      ? `Respondé todas las preguntas para poder corregir (${answered} de ${questions.length}).`
      : 'Escribí tu nombre para poder corregir.',
    onSubmit: submit,
    submitted,
    score,
    total: questions.length,
    onRetry: retry,
  }
  return { answers, onAnswer: (qid, oi) => setAnswers((a) => ({ ...a, [qid]: oi })), submitted, footerProps }
}

// ─── Cuestionario ───────────────────────────────────────────────────

export function QuizExercise({ quiz, c, kids = false, submission }) {
  const s = getSkin(c, kids)
  const questions = validQuestions(quiz.questions)
  const mc = useMultipleChoice({ questions, submission, contentType: 'quiz', label: quiz.title })
  if (questions.length === 0) return null

  return (
    <CollapsibleExercise title={quiz.title || 'Cuestionario'} label="Actividad" className={`${s.card} p-6 sm:p-8 mb-8 ${s.outer}`}>
      <QuestionList questions={questions} answers={mc.answers} onAnswer={mc.onAnswer} submitted={mc.submitted} s={s} kids={kids} nested />
      <ExerciseSubmit s={s} c={c} kids={kids} {...mc.footerProps} />
    </CollapsibleExercise>
  )
}

// ─── Listening ──────────────────────────────────────────────────────

export function ListeningExercise({ item, c, kids = false, submission }) {
  const s = getSkin(c, kids)
  const [showTranscript, setShowTranscript] = useState(false)
  const questions = validQuestions(item.questions)
  const mc = useMultipleChoice({ questions, submission, contentType: 'listening', label: item.title })
  const videoId = parseYouTubeId(item.youtubeId)
  const transcript = String(item.transcript || '').trim()

  return (
    <CollapsibleExercise title={item.title || 'Listening'} label="Listening" icon={Video} className={`${s.card} p-6 sm:p-8 mb-8 ${s.outer}`}>
      {item.image_url && (
        <img loading="lazy" decoding="async" src={item.image_url} alt="" className={`w-full max-h-56 object-cover ${s.img} mb-4`} />
      )}

      {videoId && (
        <div className={`aspect-video ${s.img} overflow-hidden ${s.soft} mb-4`}>
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title={item.title || 'Video'}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      )}

      {transcript && (
        <>
          <button
            onClick={() => setShowTranscript((v) => !v)}
            aria-expanded={showTranscript}
            className={`flex items-center gap-2 ${s.muted} ${c.hoverText} text-sm font-medium mb-4 transition-colors`}
          >
            <FileText size={16} /> {showTranscript ? 'Ocultar' : 'Ver'} transcripción
          </button>
          {showTranscript && (
            <pre className={`whitespace-pre-wrap font-body text-sm ${s.body} ${s.soft} rounded-lg p-4 mb-6 leading-relaxed`}>{transcript}</pre>
          )}
        </>
      )}

      {questions.length > 0 && (
        <>
          <QuestionList questions={questions} answers={mc.answers} onAnswer={mc.onAnswer} submitted={mc.submitted} s={s} kids={kids} />
          <ExerciseSubmit s={s} c={c} kids={kids} {...mc.footerProps} />
        </>
      )}
    </CollapsibleExercise>
  )
}
