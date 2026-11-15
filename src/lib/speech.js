// Lectura en voz alta con la síntesis de voz del navegador (Web Speech
// API). En Chrome y Android usa las voces de Google ("Google US English"),
// en Safari/iPhone las de Apple. No necesita clave ni servidor y es gratis.
//
// Chrome tiene varias mañas que hacen que a veces "no suene nada" sin dar
// error; acá se cubren todas en un solo lugar:
// - En iPhone/iPad (Safari) hay que hablar en el mismo toque: nada de
//   esperas antes de speak().
// - cancel() seguido inmediatamente de speak() a veces descarta el audio
//   nuevo en Chrome: solo se cancela si algo está sonando, y si se perdió
//   se reintenta.
// - Si la síntesis quedó en pausa (por ej. al cambiar de pestaña), se
//   reanuda.
// - El utterance se guarda en una variable del módulo: si no, Chrome puede
//   descartarlo (garbage collection) a mitad y no avisa cuando termina.
// - Si en unos segundos no empezó a sonar, se avisa con onError('timeout')
//   para que la pantalla pueda mostrar un mensaje.

let cachedVoice = null
let currentUtterance = null

function pickVoice(lang) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const base = lang.split('-')[0]
  return (
    voices.find((v) => v.lang === lang && /google/i.test(v.name)) ||
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang?.startsWith(base) && /google/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith(base)) ||
    null
  )
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Pedirlas una vez hace que el navegador empiece a cargarlas ya.
  cachedVoice = pickVoice('en-US')
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = pickVoice('en-US')
  })
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined'
}

export function stopSpeaking() {
  if (!canSpeak()) return
  currentUtterance = null
  window.speechSynthesis.cancel()
}

// Devuelve false si no se puede hablar (navegador sin voz o texto vacío).
// Los callbacks son opcionales: onStart al empezar a sonar, onEnd al
// terminar (o al ser interrumpido por otro audio), onError(motivo) si
// falló o no arrancó.
export function speak(text, { rate = 0.9, lang = 'en-US', onStart, onEnd, onError } = {}) {
  if (!canSpeak() || !text) return false
  const synth = window.speechSynthesis
  const wasBusy = synth.speaking || synth.pending
  if (wasBusy) synth.cancel()
  if (synth.paused) synth.resume()

  // IMPORTANTE (iPhone/iPad): Safari solo deja hablar si speak() se llama
  // en el mismo toque del botón — si se demora (esperando voces, un
  // setTimeout…) lo bloquea en silencio. Por eso se habla siempre al
  // instante; si las voces todavía no cargaron, el navegador elige una por
  // el idioma (en-US), que funciona bien.
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  const voice = cachedVoice || pickVoice(lang)
  if (voice) {
    cachedVoice = voice
    utterance.voice = voice
  }
  currentUtterance = utterance
  let started = false
  let finished = false
  const finish = (cb, arg) => {
    if (finished) return
    finished = true
    if (currentUtterance === utterance) currentUtterance = null
    cb?.(arg)
  }
  utterance.onstart = () => {
    started = true
    onStart?.()
  }
  utterance.onend = () => finish(onEnd)
  utterance.onerror = (event) => {
    // "interrupted"/"canceled": lo cortó otro audio o el usuario; no es un error.
    if (event.error === 'interrupted' || event.error === 'canceled') finish(onEnd)
    else finish(onError, event.error || 'error')
  }
  synth.speak(utterance)

  // Chrome: si justo antes se cortó otro audio, a veces descarta este sin
  // avisar. Si no quedó ni sonando ni en cola, lo volvemos a mandar (Chrome
  // ya no exige el toque para eso; Safari no tiene este problema).
  if (wasBusy) {
    setTimeout(() => {
      if (started || finished || currentUtterance !== utterance) return
      if (!synth.speaking && !synth.pending) synth.speak(utterance)
    }, 250)
  }
  // Si a los 6 s no arrancó, se trabó: lo destrabamos y avisamos.
  setTimeout(() => {
    if (started || finished) return
    finish(onError, 'timeout')
    synth.cancel()
  }, 6000)
  return true
}

// ─── Guion con varias voces (Listening sin audio) ─────────────────────
// Parte una transcripción tipo "Sam: Good morning.\nPriya: Hi!" en líneas
// con su personaje. Las líneas sin "Nombre:" van sin personaje (narrador).
export function parseScript(transcript) {
  return String(transcript || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([A-Za-zÀ-ÿ][\w À-ÿ.'-]{0,24}):\s+(.+)$/)
      return m ? { speaker: m[1].trim(), text: m[2].trim() } : { speaker: '', text: line }
    })
}

// Lee el guion entero, una voz por personaje si el dispositivo tiene varias
// voces en inglés (si tiene una sola, se las distingue con el tono). Todas
// las líneas se encolan en el mismo toque, así funciona también en iPhone.
export function speakScript(lines, { rate = 0.9, lang = 'en-US', onStart, onEnd, onError } = {}) {
  if (!canSpeak() || !lines?.length) return false
  const synth = window.speechSynthesis
  if (synth.speaking || synth.pending) synth.cancel()
  if (synth.paused) synth.resume()

  const base = lang.split('-')[0]
  const all = synth.getVoices().filter((v) => v.lang?.startsWith(base))
  // Primero las de Google/Apple "buenas", después el resto, sin repetir.
  const english = [...all.filter((v) => v.lang === lang), ...all.filter((v) => v.lang !== lang)]
  const speakers = [...new Set(lines.map((l) => l.speaker || ''))]
  const PITCHES = [1, 0.8, 1.2, 0.9, 1.1]
  const voiceFor = (speaker) => {
    const i = speakers.indexOf(speaker || '')
    return { voice: english.length ? english[i % english.length] : null, pitch: english.length > i ? 1 : PITCHES[i % PITCHES.length] }
  }

  let started = false
  let finished = false
  const utterances = lines.map((line, idx) => {
    const u = new SpeechSynthesisUtterance(line.text)
    const { voice, pitch } = voiceFor(line.speaker)
    u.lang = voice?.lang || lang
    if (voice) u.voice = voice
    u.pitch = pitch
    u.rate = rate
    u.onstart = () => {
      if (!started) {
        started = true
        onStart?.()
      }
    }
    u.onerror = (event) => {
      if (finished) return
      finished = true
      if (event.error === 'interrupted' || event.error === 'canceled') onEnd?.()
      else onError?.(event.error || 'error')
    }
    if (idx === lines.length - 1) {
      u.onend = () => {
        if (finished) return
        finished = true
        onEnd?.()
      }
    }
    return u
  })
  currentUtterance = utterances[0]
  // Se guardan para que Chrome no los descarte a mitad (ver arriba).
  speakScript.queue = utterances
  utterances.forEach((u) => synth.speak(u))
  setTimeout(() => {
    if (started || finished) return
    finished = true
    synth.cancel()
    onError?.('timeout')
  }, 6000)
  return true
}
