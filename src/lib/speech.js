// Lectura en voz alta con la síntesis de voz del navegador (Web Speech
// API). En Chrome y Android usa las voces de Google ("Google US English"),
// en Safari/iPhone las de Apple. No necesita clave ni servidor y es gratis.
//
// Chrome tiene varias mañas que hacen que a veces "no suene nada" sin dar
// error; acá se cubren todas en un solo lugar:
// - Las voces cargan de forma asíncrona: si todavía no están, se espera un
//   momento en vez de hablar con una voz cualquiera (o con ninguna).
// - cancel() seguido inmediatamente de speak() a veces descarta el audio
//   nuevo: solo se cancela si algo está sonando, y se habla un instante
//   después.
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
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = pickVoice('en-US')
  })
}

// Espera (como mucho `timeout` ms) a que el navegador tenga voces cargadas.
function waitForVoices(timeout = 1500) {
  const synth = window.speechSynthesis
  if (synth.getVoices().length) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener?.('voiceschanged', done)
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(done, timeout)
    synth.addEventListener?.('voiceschanged', done)
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

  const say = () => {
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
    // Si a los 5 s no arrancó, Chrome se trabó: lo destrabamos y avisamos.
    setTimeout(() => {
      if (started || finished) return
      finish(onError, 'timeout')
      synth.cancel()
    }, 5000)
  }

  const needsVoices = !cachedVoice && !synth.getVoices().length
  if (needsVoices) waitForVoices().then(say)
  else if (wasBusy) setTimeout(say, 80)
  else say()
  return true
}
