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
