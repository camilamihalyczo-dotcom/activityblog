import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Lightbulb, Mic2, RotateCcw, Send, Snail, Square, Volume2, XCircle } from 'lucide-react'
import CollapsibleExercise from './CollapsibleExercise.jsx'
import NameField from './NameField.jsx'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import { canSpeak, speak, stopSpeaking } from '../lib/speech.js'
import { withCode } from '../lib/exerciseCode.js'
import { MAX_SECONDS, canRecord, uploadRecording, useRecorder } from '../lib/voiceRecording.js'

function normalizeWord(value) {
  return value.toLowerCase().replace(/[.,/#!$%^&*;:{}=[\]"'()_`~?-]/g, '')
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

// iPhone/iPad (los iPad nuevos se presentan como Mac con pantalla táctil).
function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

const UNSUPPORTED_MIC = () =>
  isIOS()
    ? 'En iPhone el micrófono funciona solo en Safari (no en Chrome ni dentro de Instagram o WhatsApp). Abrí el link en Safari.'
    : 'Tu navegador no soporta reconocimiento de voz. Probá con Google Chrome, Edge o Safari.'

function micErrorMessage(error) {
  switch (error) {
    case 'not-allowed':
      return isIOS()
        ? 'Necesitamos permiso para usar el micrófono. En el iPhone: Ajustes › Safari › Micrófono › Permitir.'
        : 'Necesitamos permiso para usar el micrófono. Tocá el candado de la barra de direcciones y permitilo.'
    case 'service-not-allowed':
      return isIOS()
        ? 'Para usar el micrófono en el iPhone tiene que estar activado el Dictado: Ajustes › General › Teclado › Activar Dictado.'
        : 'El reconocimiento de voz no está disponible en este navegador. Probá con Google Chrome.'
    case 'no-speech':
      return 'No te escuchamos. Tocá el micrófono y hablá cerca del teléfono.'
    case 'audio-capture':
      return 'No encontramos un micrófono. Revisá que esté conectado y no lo esté usando otra app.'
    case 'network':
      return 'El reconocimiento de voz necesita internet. Revisá la conexión y probá de nuevo.'
    default:
      return 'No pudimos reconocer la voz. Probá de nuevo.'
  }
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
  const [playing, setPlaying] = useState(null) // null | 'normal' | 'slow'
  const recognitionRef = useRef(null)
  const ttsAvailable = canSpeak()
  // Dos grabadoras: una para practicar y escucharse (donde no hay
  // corrección automática) y otra para la versión que se le manda a la profe.
  const practiceRec = useRecorder()
  const sendRec = useRecorder()
  const recordingAvailable = canRecord()
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const keywords = useMemo(() => (challenge.keywords || []).map(normalizeWord), [challenge.keywords])
  const spokenSet = new Set(recognizedWords)
  const spokenKeywords = keywords.filter((keyword) => spokenSet.has(keyword))
  const allKeywordsSpoken = keywords.length > 0 && spokenKeywords.length === keywords.length

  const micSupported = Boolean(getSpeechRecognition())
  const stopTimer = useRef(null)

  // Se crea un reconocedor nuevo en cada toque del micrófono (reusar uno
  // solo falla seguido en iPhone/Safari). Con resultados parciales, lo que
  // se va diciendo aparece en pantalla y, si Safari corta sin un resultado
  // "final", igual queda lo último que escuchó.
  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) text += `${event.results[i][0].transcript} `
      text = text.trim()
      if (!text) return
      setTranscript(text)
      setRecognizedWords(text.split(/\s+/).map(normalizeWord).filter(Boolean))
      setErrorMessage('')
    }
    recognition.onerror = (event) => {
      if (event.error === 'aborted') return
      setErrorMessage(micErrorMessage(event.error))
    }
    recognition.onend = () => {
      clearTimeout(stopTimer.current)
      if (recognitionRef.current === recognition) recognitionRef.current = null
      setIsListening(false)
    }
    recognitionRef.current = recognition
    recognition.start()
    // Por si el navegador no corta solo (pasa en algunos iPhone).
    clearTimeout(stopTimer.current)
    stopTimer.current = setTimeout(() => recognition.stop(), 15000)
  }

  useEffect(
    () => () => {
      clearTimeout(stopTimer.current)
      const recognition = recognitionRef.current
      if (recognition) {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.abort()
      }
    },
    []
  )

  // Si se cierra la página con el audio sonando, lo cortamos.
  useEffect(() => () => stopSpeaking(), [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    if (!micSupported) {
      setErrorMessage(UNSUPPORTED_MIC())
      return
    }
    if (practiceRec.state === 'recording' || sendRec.state === 'recording') return
    // Que el micrófono no "escuche" al modelo sonando.
    if (playing) {
      stopSpeaking()
      setPlaying(null)
    }
    setTranscript('')
    setRecognizedWords([])
    setErrorMessage('')
    try {
      startListening()
      setIsListening(true)
    } catch {
      setErrorMessage('El micrófono ya está activo. Esperá un momento y probá de nuevo.')
    }
  }

  const playModel = (speed) => {
    if (playing === speed) {
      stopSpeaking()
      setPlaying(null)
      return
    }
    if (isListening) recognitionRef.current?.abort()
    setErrorMessage('')
    setPlaying(speed)
    const ok = speak(challenge.sentence, {
      rate: speed === 'slow' ? 0.6 : 0.9,
      onEnd: () => setPlaying((cur) => (cur === speed ? null : cur)),
      onError: () => {
        setPlaying((cur) => (cur === speed ? null : cur))
        setErrorMessage(
          isIOS()
            ? 'No pudimos reproducir el audio. Revisá que el iPhone no esté en modo silencio (el botón del costado) y que el volumen esté alto.'
            : 'No pudimos reproducir el audio. Revisá que el volumen esté activo; si sigue sin sonar, probá en Google Chrome o Edge.'
        )
      },
    })
    if (!ok) {
      setPlaying(null)
      setErrorMessage('Tu navegador no tiene síntesis de voz disponible.')
    }
  }

  const stepCls = `${kids ? 'font-playful text-kidsInk/70' : 'font-mono text-ink/60'} text-[11px] uppercase tracking-widest`

  // Envía a la profe: sube el audio (si hay) y guarda la entrega con el
  // último resultado de la práctica. Si algo falla se avisa (no se finge
  // que se mandó).
  const sendToTeacher = async () => {
    setSending(true)
    setSendError('')
    try {
      const audioPath = sendRec.blob ? await uploadRecording(sendRec.blob) : null
      await recordSubmission({
        strict: true,
        scope,
        levelSlug,
        groupSlug,
        trackSlug,
        temarioSlug,
        contentType: 'voice_lab',
        label: withCode(challenge.code, challenge.title),
        studentName,
        score: transcript ? spokenKeywords.length : null,
        total: transcript ? keywords.length : null,
        detail: [
          { sentence: challenge.sentence, transcript, keywords, spoken_keywords: spokenKeywords, is_complete: allKeywordsSpoken, audio_path: audioPath },
        ],
      })
      setSubmitted(true)
    } catch {
      setSendError('No se pudo enviar. Revisá la conexión y probá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <CollapsibleExercise
      title={challenge.title || 'Desafío de pronunciación'}
      label="Voice Lab"
      code={challenge.code}
      className={c.card}
    >
      <div className={kids ? 'bg-white' : ''}>
        <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-sm mb-4`}>
          Escuchá cómo suena, practicá todas las veces que quieras y, cuando te salga bien, mandáselo a tu profe.
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

        {challenge.phoneticTip?.trim() && (
        <div className={`${kids ? 'bg-kidsYellow/20 border-kidsYellow/40 text-kidsInk' : 'bg-gold/10 border-gold/30 text-ink'} flex items-start gap-3 rounded-lg border-2 p-4 mb-5`}>
          <Lightbulb size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm leading-relaxed">{challenge.phoneticTip}</p>
        </div>
        )}

        {errorMessage && <p className={`${kids ? 'text-kidsRed font-playful' : 'text-stamp'} text-sm mb-4`}>{errorMessage}</p>}
        {transcript && <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-sm mb-4`}>Escuché: “{transcript}”</p>}

        <div className="flex flex-col items-center gap-5">
          {ttsAvailable && (
            <div className="flex flex-col items-center gap-2">
              <p className={`${kids ? 'font-playful text-kidsInk/70' : 'font-mono text-ink/60'} text-[11px] uppercase tracking-widest`}>1 · Escuchá el modelo</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playModel('normal')}
                  aria-pressed={playing === 'normal'}
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    playing === 'normal'
                      ? kids ? 'border-kidsPurpleDeep bg-kidsPurpleDeep text-white' : 'border-brand bg-brand text-white'
                      : kids ? 'border-kidsInk/15 bg-kidsCream text-kidsInk hover:border-kidsInk/40 font-playful' : 'border-ink/15 bg-paper text-ink hover:border-ink/40'
                  }`}
                >
                  <Volume2 size={18} aria-hidden="true" className={playing === 'normal' ? 'animate-pulse' : ''} />
                  {playing === 'normal' ? 'Sonando… (tocá para parar)' : 'Escuchar'}
                </button>
                <button
                  type="button"
                  onClick={() => playModel('slow')}
                  aria-pressed={playing === 'slow'}
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    playing === 'slow'
                      ? kids ? 'border-kidsPurpleDeep bg-kidsPurpleDeep text-white' : 'border-brand bg-brand text-white'
                      : kids ? 'border-kidsInk/15 bg-kidsCream text-kidsInk hover:border-kidsInk/40 font-playful' : 'border-ink/15 bg-paper text-ink hover:border-ink/40'
                  }`}
                >
                  <Snail size={18} aria-hidden="true" className={playing === 'slow' ? 'animate-pulse' : ''} />
                  {playing === 'slow' ? 'Sonando…' : 'Más lento'}
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <p className={`${stepCls}`}>{ttsAvailable ? '2 · Practicá todas las veces que quieras' : 'Practicá todas las veces que quieras'}</p>
            {micSupported ? (
              <>
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={sendRec.state === 'recording'}
                  className={`${isListening ? (kids ? 'bg-kidsRed ring-kidsRed/20' : 'bg-stamp ring-stamp/20') : (kids ? 'bg-kidsPurpleDeep ring-kidsPurpleDeep/15' : 'bg-brand ring-brand/15')} text-white rounded-full p-5 shadow-md ring-4 transition-colors disabled:opacity-40`}
                  aria-label={isListening ? 'Detener grabación' : 'Comenzar grabación'}
                >
                  <Mic2 size={26} />
                </button>
                <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-xs text-center max-w-xs`}>
                  {isListening ? 'Te escucho… hablá ahora (tocá de nuevo para terminar)' : 'Tocá el micrófono y leé la oración: las palabras se ponen en verde.'}
                </p>
              </>
            ) : recordingAvailable ? (
              // Sin reconocimiento de voz (ej. Chrome de iPhone): se graba y se
              // escucha para compararse con el modelo.
              <>
                <RecorderButton rec={practiceRec} kids={kids} disabled={sendRec.state === 'recording'} idleLabel="Grabarme" onStart={() => stopSpeaking()} />
                {practiceRec.state === 'done' && (
                  <audio controls src={practiceRec.url} className="w-full max-w-xs" data-testid="practice-audio" />
                )}
                <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-xs text-center max-w-xs`}>
                  En este navegador no hay corrección automática: grabate, escuchate y compará con el modelo.
                </p>
                {practiceRec.error && <p className={`${kids ? 'text-kidsRed font-playful' : 'text-stamp'} text-xs text-center`}>{practiceRec.error}</p>}
              </>
            ) : (
              <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-xs text-center max-w-xs`}>{UNSUPPORTED_MIC()}</p>
            )}
          </div>
        </div>

        {micSupported && (
          <>
            <div className={`${kids ? 'font-playful text-kidsInk' : 'text-ink'} flex flex-wrap items-center justify-center gap-2 mt-4 text-sm`}>
              {keywords.map((keyword) => (
                <span key={keyword} className={`rounded-full border px-3 py-1 ${spokenSet.has(keyword) ? 'border-olive bg-olive/10' : 'border-ink/15'}`}>
                  {spokenSet.has(keyword) ? <CheckCircle2 size={14} className="inline mr-1 text-olive" /> : <XCircle size={14} className="inline mr-1 opacity-40" />}
                  {keyword}
                </span>
              ))}
            </div>
            {allKeywordsSpoken && <p className={`${kids ? 'text-kidsGreenDeep font-playful' : 'text-olive'} text-center font-semibold mt-4`}>¡Excelente! Detectamos todas las palabras críticas.</p>}
          </>
        )}

        {/* 3 · Envío a la profe: separado de la práctica. */}
        <div className={`mt-8 pt-6 border-t-2 border-dashed ${kids ? 'border-kidsInk/10' : 'border-ink/10'}`} data-testid="send-to-teacher">
          <p className={`${stepCls} text-center mb-3`}>{ttsAvailable ? '3 · ' : ''}Mandáselo a tu profe</p>
          {submitted ? (
            <div className="text-center">
              <p className={`${kids ? 'font-playful text-kidsGreenDeep' : 'text-olive'} font-semibold`}>¡Listo! Tu profe ya lo puede escuchar.</p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  sendRec.reset()
                }}
                className={`mt-3 text-sm underline ${kids ? 'font-playful text-kidsInk/80' : 'text-ink/70'}`}
              >
                Grabar y mandar otra vez
              </button>
            </div>
          ) : recordingAvailable ? (
            <div className="flex flex-col items-center gap-3">
              {sendRec.state !== 'done' ? (
                <>
                  <RecorderButton
                    rec={sendRec}
                    kids={kids}
                    disabled={isListening || practiceRec.state === 'recording'}
                    idleLabel="Grabar para mi profe"
                    onStart={() => {
                      stopSpeaking()
                      setPlaying(null)
                      setSendError('')
                    }}
                  />
                  <p className={`${kids ? 'font-playful text-kidsInk/70' : 'text-ink/60'} text-xs text-center max-w-xs`}>
                    Cuando te salga bien, grabá tu versión final (hasta {MAX_SECONDS} segundos).
                  </p>
                  {sendRec.error && <p className={`${kids ? 'text-kidsRed font-playful' : 'text-stamp'} text-xs text-center`}>{sendRec.error}</p>}
                </>
              ) : (
                <>
                  <audio controls src={sendRec.url} className="w-full max-w-sm" data-testid="send-audio" />
                  <button type="button" onClick={sendRec.reset} className={`inline-flex items-center gap-1 text-sm underline ${kids ? 'font-playful text-kidsInk/80' : 'text-ink/70'}`}>
                    <RotateCcw size={14} aria-hidden="true" /> Volver a grabar
                  </button>
                  <div className="w-full mt-2">
                    <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
                    <button
                      type="button"
                      onClick={sendToTeacher}
                      disabled={!studentName.trim() || sending}
                      className={`${kids ? 'bg-kidsInk rounded-full font-playful' : 'bg-ink rounded-lg'} w-full py-3 font-semibold text-white disabled:opacity-40 inline-flex items-center justify-center gap-2`}
                    >
                      <Send size={16} aria-hidden="true" /> {sending ? 'Enviando…' : 'Enviar a mi profe'}
                    </button>
                  </div>
                </>
              )}
              {sendError && <p className={`${kids ? 'text-kidsRed font-playful' : 'text-stamp'} text-sm text-center`}>{sendError}</p>}
            </div>
          ) : (
            // Navegador sin grabación (muy viejo): se manda solo el resultado de la práctica.
            <div>
              <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
              <button
                type="button"
                onClick={sendToTeacher}
                disabled={!studentName.trim() || !transcript || sending}
                className={`${kids ? 'bg-kidsInk rounded-full font-playful' : 'bg-ink rounded-lg'} w-full py-3 font-semibold text-white disabled:opacity-40`}
              >
                {sending ? 'Enviando…' : 'Enviar resultado a mi profe'}
              </button>
              {sendError && <p className={`${kids ? 'text-kidsRed font-playful' : 'text-stamp'} text-sm text-center mt-2`}>{sendError}</p>}
            </div>
          )}
        </div>
      </div>
    </CollapsibleExercise>
  )
}

// Botón de grabar/detener con contador.
function RecorderButton({ rec, kids, disabled, idleLabel, onStart }) {
  const recording = rec.state === 'recording'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (recording) rec.stop()
        else {
          onStart?.()
          rec.start()
        }
      }}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-white shadow-md ring-4 transition-colors disabled:opacity-40 ${
        recording
          ? kids ? 'bg-kidsRed ring-kidsRed/20 font-playful' : 'bg-stamp ring-stamp/20'
          : kids ? 'bg-kidsPurpleDeep ring-kidsPurpleDeep/15 font-playful' : 'bg-brand ring-brand/15'
      }`}
    >
      {recording ? <Square size={18} aria-hidden="true" /> : <Mic2 size={20} aria-hidden="true" />}
      {recording ? `Detener (0:${String(rec.seconds).padStart(2, '0')})` : idleLabel}
    </button>
  )
}
