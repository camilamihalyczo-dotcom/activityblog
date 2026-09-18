import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Lightbulb, Mic2, Volume2, XCircle } from 'lucide-react'
import CollapsibleExercise from './CollapsibleExercise.jsx'
import NameField from './NameField.jsx'
import { recordSubmission, useStudentName } from '../lib/submissions.js'

function normalizeWord(value) {
  return value.toLowerCase().replace(/[.,/#!$%^&*;:{}=[\]"'()_`~?-]/g, '')
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export default function VoiceLabExercise({
  challenge,
  c,
  kids = false,
  scope,
  levelSlug,
  groupSlug,
  trackSlug,
  temarioSlug,
}) {
  const [studentName, setStudentName] = useStudentName()
  const [recognizedWords, setRecognizedWords] = useState([])
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const recognitionRef = useRef(null)

  const keywords = useMemo(() => (challenge.keywords || []).map(normalizeWord), [challenge.keywords])
  const spokenSet = new Set(recognizedWords)
  const spokenKeywords = keywords.filter((keyword) => spokenSet.has(keyword))
  const allKeywordsSpoken = keywords.length > 0 && spokenKeywords.length === keywords.length

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setErrorMessage('Tu navegador no soporta reconocimiento de voz nativo. Probá con Google Chrome o Edge.')
      return undefined
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const nextTranscript = event.results[0][0].transcript
      setTranscript(nextTranscript)
      setRecognizedWords(nextTranscript.split(/\s+/).map(normalizeWord).filter(Boolean))
      setErrorMessage('')
    }
    recognition.onerror = (event) => {
      setIsListening(false)
      setErrorMessage(event.error === 'not-allowed' ? 'Necesitamos permiso para usar el micrófono.' : 'No pudimos reconocer la voz. Probá de nuevo.')
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    if (!recognitionRef.current) return
    setTranscript('')
    setRecognizedWords([])
    setErrorMessage('')
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setErrorMessage('El micrófono ya está activo. Esperá un momento y probá de nuevo.')
    }
  }

  const playModel = () => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('Tu navegador no tiene síntesis de voz disponible.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(challenge.sentence)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  return (
    <CollapsibleExercise
      title={challenge.title || 'Desafío de pronunciación'}
      label="Voice Lab"
      className={c.card}
    >
      <div className={kids ? 'bg-white' : ''}>
        <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-sm mb-4`}>
          Escuchá el modelo, presioná el micrófono y leé la oración en voz alta.
        </p>

        <div className={`${kids ? 'bg-kidsCream' : 'bg-paper'} rounded-xl border-2 ${c.border} p-5 mb-5`}>
          <div className="flex flex-wrap gap-1.5 text-lg font-medium leading-relaxed">
            {challenge.sentence.split(/\s+/).map((rawWord, index) => {
              const word = normalizeWord(rawWord)
              const isSpoken = spokenSet.has(word)
              const isCritical = keywords.includes(word)
              return (
                <span
                  key={`${rawWord}-${index}`}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    isSpoken
                      ? kids ? 'bg-kidsGreen/20 text-kidsGreenDeep' : 'bg-olive/15 text-olive'
                      : isCritical && recognizedWords.length > 0
                      ? kids ? 'bg-kidsRed/10 text-kidsRed' : 'bg-stamp/10 text-stamp'
                      : kids ? 'text-kidsInk' : 'text-ink'
                  }`}
                >
                  {rawWord}
                </span>
              )
            })}
          </div>
        </div>

        <div className={`${kids ? 'bg-kidsYellow/20 border-kidsYellow/40 text-kidsInk' : 'bg-gold/10 border-gold/30 text-ink'} flex items-start gap-3 rounded-lg border-2 p-4 mb-5`}>
          <Lightbulb size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm leading-relaxed">{challenge.phoneticTip}</p>
        </div>

        {errorMessage && <p className={`${kids ? 'text-kidsRed font-playful' : 'text-stamp'} text-sm mb-4`}>{errorMessage}</p>}
        {transcript && <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-sm mb-4`}>Escuché: “{transcript}”</p>}

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <button type="button" onClick={playModel} className={`${kids ? 'bg-kidsCream text-kidsInk' : 'bg-ink/5 text-ink'} rounded-full p-3`} aria-label="Escuchar pronunciación modelo">
              <Volume2 size={20} />
            </button>
            <button
              type="button"
              onClick={toggleListening}
              className={`${isListening ? (kids ? 'bg-kidsRed ring-kidsRed/20' : 'bg-stamp ring-stamp/20') : (kids ? 'bg-kidsPurpleDeep' : 'bg-brand')} text-white rounded-full p-5 shadow-md ring-4 transition-colors`}
              aria-label={isListening ? 'Detener grabación' : 'Comenzar grabación'}
            >
              <Mic2 size={26} />
            </button>
          </div>
          <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-xs`}>
            {isListening ? 'Te escucho… hablá ahora' : 'Hacé clic en el micrófono para hablar'}
          </p>
        </div>

        <div className={`${kids ? 'font-playful text-kidsInk' : 'text-ink'} flex flex-wrap items-center justify-center gap-2 mt-4 text-sm`}>
          {keywords.map((keyword) => (
            <span key={keyword} className={`rounded-full border px-3 py-1 ${spokenSet.has(keyword) ? 'border-olive bg-olive/10' : 'border-ink/15'}`}>
              {spokenSet.has(keyword) ? <CheckCircle2 size={14} className="inline mr-1 text-olive" /> : <XCircle size={14} className="inline mr-1 opacity-40" />}
              {keyword}
            </span>
          ))}
        </div>

        {allKeywordsSpoken && <p className={`${kids ? 'text-kidsGreenDeep font-playful' : 'text-olive'} text-center font-semibold mt-4`}>¡Excelente! Detectamos todas las palabras críticas.</p>}

        {!submitted ? (
          <div className="mt-6">
            <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
            <button
              type="button"
              onClick={() => {
                setSubmitted(true)
                recordSubmission({
                  scope,
                  levelSlug,
                  groupSlug,
                  trackSlug,
                  temarioSlug,
                  contentType: 'voice_lab',
                  label: challenge.title,
                  studentName,
                  score: spokenKeywords.length,
                  total: keywords.length,
                  detail: [{ sentence: challenge.sentence, transcript, keywords, spoken_keywords: spokenKeywords, is_complete: allKeywordsSpoken }],
                })
              }}
              disabled={!studentName.trim() || !transcript}
              className={`${kids ? 'bg-kidsInk rounded-full font-playful' : 'bg-ink rounded-lg'} w-full py-3 font-semibold text-white disabled:opacity-40`}
            >
              Guardar resultado
            </button>
          </div>
        ) : (
          <p className={`${kids ? 'font-playful text-kidsInk' : 'text-ink'} mt-6 text-center font-semibold`}>¡Resultado guardado!</p>
        )}
      </div>
    </CollapsibleExercise>
  )
}
