// Lectura en voz alta con la síntesis de voz del navegador (Web Speech
// API). En Chrome y Android usa las voces de Google ("Google US English"),
// en Safari/iPhone las de Apple. No necesita clave ni servidor y es gratis.

let cachedVoice = null

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

// Las voces cargan de forma asíncrona en Chrome: se elige la mejor apenas
// estén disponibles.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = pickVoice('en-US')
  })
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text, { rate = 0.9, lang = 'en-US' } = {}) {
  if (!canSpeak() || !text) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  const voice = cachedVoice || pickVoice(lang)
  if (voice) {
    cachedVoice = voice
    utterance.voice = voice
  }
  synth.speak(utterance)
  return true
}
