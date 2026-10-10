import { useMemo, useState } from 'react'
import { Search, Volume2 } from 'lucide-react'
import { getSkin } from '../lib/skin.js'
import { canSpeak, speak } from '../lib/speech.js'

// Buscador + lista de palabras del glosario, común a Adultos e Infancias.
export default function GlossaryList({ words, c, kids = false }) {
  const s = getSkin(c, kids)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return words
    return words.filter((w) => w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q))
  }, [words, query])

  return (
    <>
      <div className="relative z-10 mb-6">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${s.muted}`} size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar una palabra…"
          aria-label="Buscar una palabra"
          className={`w-full pl-10 pr-4 py-2.5 border-2 text-sm ${s.input} ${kids ? 'bg-white' : ''} ${s.inputIdle} transition-colors`}
        />
      </div>
      <p className={`${s.small} mb-2 relative z-10`}>
        {filtered.length === words.length ? `${words.length} palabras` : `${filtered.length} de ${words.length} palabras`}
      </p>

      {filtered.length === 0 ? (
        <p className={`${s.muted} text-sm text-center py-8`}>No encontramos ninguna palabra con eso.</p>
      ) : (
        <div className={kids ? 'relative z-10 flex flex-col gap-2.5' : 'flex flex-col divide-y-2 divide-dashed divide-ink/10'}>
          {filtered.map((w, i) => (
            <div key={`${w.word}-${i}`} className={kids ? 'bg-white rounded-xl shadow-kids p-4' : 'py-3.5'}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="flex items-center gap-1">
                  <span className={s.title}>{w.word}</span>
                  {canSpeak() && (
                    <button
                      type="button"
                      onClick={() => speak(w.word)}
                      aria-label={`Escuchar “${w.word}”`}
                      title="Escuchar"
                      className={`rounded-full p-1 ${s.muted} hover:opacity-80 self-center`}
                    >
                      <Volume2 size={14} aria-hidden="true" />
                    </button>
                  )}
                </span>
                <span className={`${s.muted} text-sm text-right`}>{w.translation}</span>
              </div>
              {w.example && <p className={`${s.muted} text-xs mt-1 italic`}>{w.example}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
