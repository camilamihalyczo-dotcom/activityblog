import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { canSpeak, speak, stopSpeaking } from '../lib/speech.js'

// Ayudas para lxs más chicxs (solo en el estilo Kids):
// - Si todas las opciones de una pregunta son emojis (🐱 / 🐶), se muestran
//   como fichas grandes en vez de una lista de texto.
// - Un botón 🔊 lee en voz alta la pregunta (y las opciones si son
//   palabras), para que puedan responder aunque todavía no lean.

const EMOJI_RE = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Emoji_Component}|‍|️|\s)+$/u
const HAS_PICTO = /\p{Extended_Pictographic}/u

export function isEmojiOption(option) {
  const t = String(option || '').trim()
  return Boolean(t) && EMOJI_RE.test(t) && HAS_PICTO.test(t)
}

export function allEmojiOptions(options) {
  const list = (options || []).filter((o) => String(o || '').trim())
  return list.length > 0 && list.every(isEmojiOption)
}

// Texto a leer: la pregunta y, si las opciones son palabras, "x, y, or z".
export function readAloudText(question, options = []) {
  const q = String(question || '').replace(/_{2,}/g, '…').trim()
  const words = (options || []).map((o) => String(o || '').trim()).filter((o) => o && !isEmojiOption(o))
  if (!words.length) return q
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')}, or ${words[words.length - 1]}` : words[0]
  return `${q} ${list}?`
}

export function ReadAloudButton({ text, label = 'Escuchar la pregunta' }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => playing && stopSpeaking(), [playing])
  if (!canSpeak() || !String(text || '').trim()) return null
  const onClick = () => {
    if (playing) {
      stopSpeaking()
      setPlaying(false)
      return
    }
    setPlaying(true)
    speak(text, { rate: 0.8, onEnd: () => setPlaying(false), onError: () => setPlaying(false) })
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={playing}
      title={label}
      className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
        playing ? 'bg-kidsPurpleDeep border-kidsPurpleDeep text-white' : 'bg-kidsCream border-kidsInk/15 text-kidsInk hover:border-kidsInk/40'
      }`}
      data-testid="read-aloud"
    >
      <Volume2 size={18} aria-hidden="true" className={playing ? 'animate-pulse' : ''} />
    </button>
  )
}
