import { useEffect, useState } from 'react'
import TicketHeader from '../components/TicketHeader.jsx'
import { Volume2 } from 'lucide-react'

// Los 44 sonidos del inglés británico (RP), agrupados igual que en las
// tablas fonéticas clásicas (tipo Adrian Underhill): vocales cortas,
// vocales largas, diptongos, y consonantes en pares sordo/sonoro + el
// resto. No usamos audios grabados (habría que grabar o conseguir 44+
// clips) — en su lugar usamos la síntesis de voz del navegador para leer
// la palabra de ejemplo en voz alta al tocar cada símbolo.

const SHORT_VOWELS = [
  { ipa: 'ɪ', word: 'sit' },
  { ipa: 'e', word: 'bed' },
  { ipa: 'æ', word: 'cat' },
  { ipa: 'ʌ', word: 'cup' },
  { ipa: 'ɒ', word: 'hot' },
  { ipa: 'ʊ', word: 'book' },
  { ipa: 'ə', word: 'about' },
]

const LONG_VOWELS = [
  { ipa: 'iː', word: 'see' },
  { ipa: 'ɜː', word: 'bird' },
  { ipa: 'ɑː', word: 'car' },
  { ipa: 'ɔː', word: 'door' },
  { ipa: 'uː', word: 'blue' },
]

const DIPHTHONGS = [
  { ipa: 'eɪ', word: 'day' },
  { ipa: 'aɪ', word: 'my' },
  { ipa: 'ɔɪ', word: 'boy' },
  { ipa: 'əʊ', word: 'go' },
  { ipa: 'aʊ', word: 'how' },
  { ipa: 'ɪə', word: 'ear' },
  { ipa: 'eə', word: 'hair' },
  { ipa: 'ʊə', word: 'pure' },
]

// Pares sordo (arriba, sin vibrar las cuerdas vocales) / sonoro (abajo).
const CONSONANT_PAIRS = [
  [{ ipa: 'p', word: 'pen' }, { ipa: 'b', word: 'bad' }],
  [{ ipa: 't', word: 'tea' }, { ipa: 'd', word: 'did' }],
  [{ ipa: 'k', word: 'cat' }, { ipa: 'ɡ', word: 'get' }],
  [{ ipa: 'f', word: 'fall' }, { ipa: 'v', word: 'van' }],
  [{ ipa: 'θ', word: 'thin' }, { ipa: 'ð', word: 'this' }],
  [{ ipa: 's', word: 'see' }, { ipa: 'z', word: 'zoo' }],
  [{ ipa: 'ʃ', word: 'shoe' }, { ipa: 'ʒ', word: 'vision' }],
  [{ ipa: 'tʃ', word: 'chair' }, { ipa: 'dʒ', word: 'June' }],
]

const OTHER_CONSONANTS = [
  { ipa: 'm', word: 'man' },
  { ipa: 'n', word: 'no' },
  { ipa: 'ŋ', word: 'sing' },
  { ipa: 'l', word: 'leg' },
  { ipa: 'r', word: 'red' },
  { ipa: 'j', word: 'yes' },
  { ipa: 'w', word: 'wet' },
  { ipa: 'h', word: 'hat' },
]

function pickEnglishVoice(voices) {
  return voices.find((v) => v.lang === 'en-GB') || voices.find((v) => v.lang?.startsWith('en')) || null
}

function PhonemeChip({ ipa, word, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={`/${ipa}/ como en "${word}"`}
      className={`flex flex-col items-center justify-center gap-0.5 w-[72px] h-[72px] rounded-xl border-2 transition-colors shrink-0
        ${active ? 'border-brand bg-brand/10' : 'border-ink/15 bg-paper hover:border-ink/40'}
        disabled:opacity-40 disabled:cursor-default disabled:hover:border-ink/15
      `}
    >
      <span className="font-display text-xl font-semibold text-ink">{ipa}</span>
      <span className="text-[10px] text-ink/60">{word}</span>
    </button>
  )
}

function Section({ title, note, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-lg font-semibold text-ink mb-1">{title}</h2>
      {note && <p className="text-ink/60 text-xs mb-3">{note}</p>}
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  )
}

export default function PhoneticChartPage() {
  const [voice, setVoice] = useState(null)
  const [supported, setSupported] = useState(true)
  const [speakingIpa, setSpeakingIpa] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false)
      return
    }
    const loadVoice = () => setVoice(pickEnglishVoice(window.speechSynthesis.getVoices()))
    loadVoice()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoice)
  }, [])

  const speak = (ipa, word) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-GB'
    if (voice) utterance.voice = voice
    utterance.rate = 0.9
    utterance.onstart = () => setSpeakingIpa(ipa)
    utterance.onend = () => setSpeakingIpa((cur) => (cur === ipa ? null : cur))
    utterance.onerror = () => setSpeakingIpa((cur) => (cur === ipa ? null : cur))
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Tabla fonética']} backTo={-1} />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 border-brand/40 text-brand">
          <Volume2 size={12} /> Recurso para todos
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Tabla fonética</h1>
        <p className="text-ink/60 mb-1">
          Los 44 sonidos del inglés (pronunciación británica), agrupados como en las tablas fonéticas clásicas. Tocá
          cualquier símbolo para escuchar cómo suena en una palabra de ejemplo.
        </p>
        {!supported && (
          <p className="text-stamp text-sm mb-6">
            Tu navegador no puede leer los sonidos en voz alta acá, pero podés seguir usando la tabla como
            referencia visual.
          </p>
        )}

        <div className="mt-8">
          <Section title="Vocales cortas">
            {SHORT_VOWELS.map((p) => (
              <PhonemeChip
                key={p.ipa}
                {...p}
                active={speakingIpa === p.ipa}
                disabled={!supported}
                onClick={() => speak(p.ipa, p.word)}
              />
            ))}
          </Section>

          <Section title="Vocales largas">
            {LONG_VOWELS.map((p) => (
              <PhonemeChip
                key={p.ipa}
                {...p}
                active={speakingIpa === p.ipa}
                disabled={!supported}
                onClick={() => speak(p.ipa, p.word)}
              />
            ))}
          </Section>

          <Section title="Diptongos">
            {DIPHTHONGS.map((p) => (
              <PhonemeChip
                key={p.ipa}
                {...p}
                active={speakingIpa === p.ipa}
                disabled={!supported}
                onClick={() => speak(p.ipa, p.word)}
              />
            ))}
          </Section>

          <div className="mb-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-1">Consonantes en pares</h2>
            <p className="text-ink/60 text-xs mb-3">
              Arriba: sin vibrar las cuerdas vocales (sordas). Abajo: vibrando las cuerdas vocales (sonoras).
            </p>
            <div className="flex flex-wrap gap-4">
              {CONSONANT_PAIRS.map(([voiceless, voiced]) => (
                <div key={voiceless.ipa} className="flex flex-col gap-2.5">
                  <PhonemeChip
                    {...voiceless}
                    active={speakingIpa === voiceless.ipa}
                    disabled={!supported}
                    onClick={() => speak(voiceless.ipa, voiceless.word)}
                  />
                  <PhonemeChip
                    {...voiced}
                    active={speakingIpa === voiced.ipa}
                    disabled={!supported}
                    onClick={() => speak(voiced.ipa, voiced.word)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Section title="Otras consonantes">
            {OTHER_CONSONANTS.map((p) => (
              <PhonemeChip
                key={p.ipa}
                {...p}
                active={speakingIpa === p.ipa}
                disabled={!supported}
                onClick={() => speak(p.ipa, p.word)}
              />
            ))}
          </Section>
        </div>
      </div>
    </div>
  )
}
