import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTracks } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import TicketHeader from '../components/TicketHeader.jsx'
import { Briefcase, Palette, GraduationCap, Sparkles, Code2, Plane } from 'lucide-react'

// Un ícono por track conocido. Los tracks en sí (nombre, color, progresión
// interna, clave de acceso, temarios) ahora viven en Supabase y se cargan
// acá — se editan desde /notas-profe/tracks. Un track nuevo cargado desde
// el panel que no esté en este mapa cae en el ícono genérico (Sparkles).
// El nivel ya no pide clave: la clave es por track (ver ThemeHubPage), así
// que esta pantalla es de acceso libre.
const ICONS = {
  'business-english': Briefcase,
  'english-for-creatives': Palette,
  'exam-prep': GraduationCap,
  'special-courses': Sparkles,
  'english-for-developers': Code2,
  'english-for-travel': Plane,
}

export default function LevelHubPage() {
  const { level: slug } = useParams()
  const level = getLevel(slug)
  const [tracks, setTracks] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    fetchTracks()
      .then((data) => {
        if (!active) return
        setTracks(data)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  if (!level) return <Navigate to="/adultos" replace />

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Adultos', level.code]} backTo="/adultos" />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Elegí un track</h1>
        <p className="text-ink/60 mb-10">
          Nivel {level.code} · {level.name} — cada track es una especialización en paralelo, con sus propias flashcards, cuestionario, listening y reading &amp; writing.
        </p>

        {status === 'loading' && <p className="text-ink/50 text-sm mb-6">Cargando…</p>}
        {status === 'error' && (
          <p className="text-stamp text-sm mb-6">No pudimos cargar los tracks ahora mismo. Probá de nuevo en un rato.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          {tracks.map((theme) => {
            const c = THEME_COLORS[theme.color_key]
            const Icon = ICONS[theme.slug] || Sparkles
            return (
              <Link
                key={theme.slug}
                to={`/adultos/${slug}/${theme.slug}`}
                className={`texture-card rounded-2xl ${c.borderT4} p-6 hover:-translate-y-0.5 transition-transform`}
              >
                <Icon className={`${c.icon} mb-3`} size={26} />
                <p className="font-display text-lg font-semibold text-ink mb-1">{theme.name}</p>
                <p className="text-ink/60 text-sm mb-3">{theme.description}</p>
                <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 ${c.tag}`}>
                  {theme.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
