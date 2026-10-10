import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { fetchInfanciasGlossary } from '../lib/glossary.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { useLevelAccess } from '../hooks.js'
import KidsPasswordGate from '../components/KidsPasswordGate.jsx'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsBlobs from '../components/KidsBlobs.jsx'
import EmptyState from '../components/EmptyState.jsx'
import GlossaryList from '../components/GlossaryList.jsx'

export default function InfanciasGlossaryPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [words, setWords] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | not-found | ready
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

  if (status === 'loading') {
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/70 font-playful text-sm">Cargando…</div>
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
        <p className="font-playful text-kidsInk/70 mb-8">Todas las palabras nuevas que fuimos aprendiendo, juntas acá.</p>

        {words.length === 0 ? (
          <EmptyState label="palabras" />
        ) : (
          <GlossaryList words={words} c={c} kids />
        )}
      </div>
    </div>
  )
}
