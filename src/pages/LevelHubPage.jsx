import { Link, useParams, Navigate } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { THEMES, THEME_COLORS } from '../data/themes.js'
import TicketHeader from '../components/TicketHeader.jsx'
import { Briefcase, Palette, GraduationCap, Sparkles, Code2, Plane } from 'lucide-react'

// Un ícono por track. Los tracks en sí (nombre, color, progresión interna,
// clave de acceso) salen de src/data/themes.js — sacados 1:1 de la landing
// de cursos (English for Developers y English for Travel son la excepción,
// ver comentario en ese archivo). El nivel ya no pide clave: la clave es
// por track (ver ThemeHubPage), así que esta pantalla es de acceso libre.
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

  if (!level) return <Navigate to="/adultos" replace />

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Adultos', level.code]} backTo="/adultos" />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Elegí un track</h1>
        <p className="text-ink/60 mb-10">
          Nivel {level.code} · {level.name} — cada track es una especialización en paralelo, con sus propias flashcards, cuestionario, listening y reading &amp; writing.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          {THEMES.map((theme) => {
            const c = THEME_COLORS[theme.color]
            const Icon = ICONS[theme.slug]
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
