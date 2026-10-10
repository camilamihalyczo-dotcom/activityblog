import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack } from '../lib/tracks.js'
import { fetchAdultosGlossary } from '../lib/glossary.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { useLevelAccess } from '../hooks.js'
import PasswordGate from '../components/PasswordGate.jsx'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import TrackResources from '../components/TrackResources.jsx'
import GlossaryList from '../components/GlossaryList.jsx'

export default function GlossaryPage() {
  const { level: slug, theme: themeSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [words, setWords] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | not-found | ready
  // Misma clave que ThemeHubPage/TemarioHubPage: es por track, no por nivel.
  const [unlocked, unlock] = useLevelAccess(`track-${themeSlug}`)

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchTrack(themeSlug), fetchAdultosGlossary(slug, themeSlug)])
      .then(([trackData, glossaryData]) => {
        if (!active) return
        setTheme(trackData)
        setWords(glossaryData)
        setStatus(trackData ? 'ready' : 'not-found')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug, themeSlug])

  if (!level) return <Navigate to="/adultos" replace />
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  }
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar el glosario ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }
  if (status === 'not-found') return <Navigate to={`/adultos/${slug}`} replace />
  if (!unlocked) {
    return (
      <PasswordGate
        target={theme}
        onUnlock={unlock}
        title={theme.name}
        subtitle={`Ingresá la clave del track "${theme.name}" que te compartió tu profesora.`}
      />
    )
  }

  const c = THEME_COLORS[theme.color_key]

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Adultos', level.code, theme.name, 'Glosario']} backTo={`/adultos/${slug}/${themeSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          {theme.name}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Glosario</h1>
        <p className="text-ink/60 mb-8">
          Todo el vocabulario que fuimos viendo en este track, en un solo lugar.
        </p>
        <div className="mb-8">
          <TrackResources glossaryTo={`/adultos/${slug}/${themeSlug}/glosario`} showGlossary={false} />
        </div>

        {words.length === 0 ? (
          <EmptyState label="palabras" />
        ) : (
          <GlossaryList words={words} c={c} />
        )}
      </div>
    </div>
  )
}
