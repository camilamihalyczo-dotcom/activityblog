import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { fetchInfanciasGlossary } from '../lib/glossary.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { useLevelAccess } from '../hooks.js'
import KidsPasswordGate from '../components/KidsPasswordGate.jsx'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsBlobs from '../components/KidsBlobs.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Search } from 'lucide-react'

export default function InfanciasGlossaryPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [words, setWords] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | not-found | ready
  const [query, setQuery] = useState('')
  const [unlocked, unlock] = useLevelAccess(`infancias-${slug}`)

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchInfanciasGlossary(slug)])
      .then(([groupData, glossaryData]) => {
        if (!active) return
        setGroup(groupData)
        setWords(glossaryData)
        setStatus(groupData ? 'ready' : 'not-found')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return words
    return words.filter((w) => w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q))
  }, [words, query])

  if (status === 'loading') {
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/50 font-playful text-sm">Cargando…</div>
  }
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar el glosario ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }
  if (status === 'not-found') return <Navigate to="/infancias" replace />
  if (!unlocked) return <KidsPasswordGate group={group} onUnlock={unlock} />

  const c = KIDS_GROUP_COLORS[group.color_key]

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={['Infancias y adolescentes', group.name, 'Glosario']} backTo={`/infancias/${slug}`} />
      <div className="relative max-w-2xl mx-auto px-5 py-12 sm:py-16 overflow-hidden">
        <KidsBlobs />
        <span className={`inline-block font-playful font-bold text-xs uppercase tracking-wide ${c.text} mb-3`}>
          {group.name}
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">
          Glosario
        </h1>
        <p className="font-playful text-kidsInk/65 mb-8">Todas las palabras nuevas que fuimos aprendiendo, juntas acá.</p>

        {words.length === 0 ? (
          <EmptyState label="palabras" />
        ) : (
          <>
            <div className="relative z-10 mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-kidsInk/30" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar una palabra…"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-kidsInk/12 bg-white font-playful text-sm focus:outline focus:outline-3 ${c.outline} outline-none transition-colors`}
              />
            </div>

            {filtered.length === 0 ? (
              <p className="font-playful text-kidsInk/50 text-sm text-center py-8">No encontramos ninguna palabra con eso.</p>
            ) : (
              <div className="relative z-10 flex flex-col gap-2.5">
                {filtered.map((w, i) => (
                  <div key={`${w.word}-${i}`} className="bg-white rounded-xl shadow-kids p-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-body font-extrabold text-kidsInk">{w.word}</span>
                      <span className="font-playful text-kidsInk/60 text-sm text-right">{w.translation}</span>
                    </div>
                    {w.example && <p className="font-playful text-kidsInk/45 text-xs mt-1 italic">{w.example}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
