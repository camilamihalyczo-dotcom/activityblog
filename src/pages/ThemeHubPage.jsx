import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemarios } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { useLevelAccess } from '../hooks.js'
import PasswordGate from '../components/PasswordGate.jsx'
import TicketHeader from '../components/TicketHeader.jsx'
import { BookMarked, Volume2 } from 'lucide-react'

export default function ThemeHubPage() {
  const { level: slug, theme: themeSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temarios, setTemarios] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | not-found | ready
  // La clave es por track, no por nivel: se guarda con una key que depende
  // solo del track, así que desbloquear "Business English" una vez alcanza
  // para cualquier nivel (A1-A2/B1-B2/C1-C2) que use ese mismo track.
  const [unlocked, unlock] = useLevelAccess(`track-${themeSlug}`)

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchTrack(themeSlug), fetchTemarios(themeSlug)])
      .then(([trackData, temariosData]) => {
        if (!active) return
        setTheme(trackData)
        setTemarios(temariosData)
        setStatus(trackData ? 'ready' : 'not-found')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [themeSlug])

  if (!level) return <Navigate to="/adultos" replace />
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  }
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este track ahora mismo. Probá de nuevo en un rato.
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
      <TicketHeader crumbs={['Adultos', level.code, theme.name]} backTo={`/adultos/${slug}`} />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 ${c.tag}`}>
            {theme.progression}
          </span>
          <div className="flex items-center gap-2">
            <Link
              to={`/adultos/${slug}/${themeSlug}/glosario`}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-ink/20 rounded-full px-4 py-2 text-ink/70 hover:border-ink hover:text-ink transition-colors"
            >
              <BookMarked size={14} /> Glosario
            </Link>
            <Link
              to="/tabla-fonetica"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-ink/20 rounded-full px-4 py-2 text-ink/70 hover:border-ink hover:text-ink transition-colors"
            >
              <Volume2 size={14} /> Tabla fonética
            </Link>
          </div>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">{theme.name}</h1>
        <p className="text-ink/60 mb-10">Nivel {level.code} · {level.name} — {theme.description}</p>

        <div className="flex flex-col gap-5">
          {temarios.map((temario, i) => (
            <Link
              key={temario.slug}
              to={`/adultos/${slug}/${themeSlug}/${temario.slug}`}
              className={`texture-card rounded-2xl ${c.borderL8} p-6 flex items-center gap-5 hover:-translate-y-0.5 transition-transform`}
            >
              <span className={`shrink-0 w-9 h-9 rounded-full border-2 ${c.tag} flex items-center justify-center font-mono text-sm font-semibold`}>
                {i + 1}
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-ink mb-1">{temario.name}</p>
                <p className="text-ink/60 text-sm">{temario.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
