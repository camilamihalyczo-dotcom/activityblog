import { Link, useParams, Navigate } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { getTheme, getTemario, THEME_COLORS } from '../data/themes.js'
import { useLevelAccess } from '../hooks.js'
import PasswordGate from '../components/PasswordGate.jsx'
import TicketHeader from '../components/TicketHeader.jsx'
import { Layers, ListChecks, Headphones, BookOpenText } from 'lucide-react'

// Las 4 actividades, iguales para cualquier nivel/track/temario. Se
// diferencian por ícono, no por color — el color de identidad es el del
// track al que pertenece el temario (ver ThemeHubPage/themes.js).
const TOPICS = [
  { slug: 'flashcards', label: 'Flashcards', desc: 'Vocabulario en formato de juego', icon: Layers },
  { slug: 'cuestionario', label: 'Cuestionario', desc: 'Preguntas de opción múltiple', icon: ListChecks },
  { slug: 'listening', label: 'Listening', desc: 'Video, transcripción y preguntas', icon: Headphones },
  { slug: 'reading-writing', label: 'Reading & Writing', desc: 'Comprensión lectora y producción escrita', icon: BookOpenText },
]

export default function TemarioHubPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const theme = getTheme(themeSlug)
  const temario = getTemario(themeSlug, temarioSlug)
  // Misma clave que ThemeHubPage: es por track, no por nivel ni por temario.
  const [unlocked, unlock] = useLevelAccess(`track-${themeSlug}`)

  if (!level) return <Navigate to="/adultos" replace />
  if (!theme) return <Navigate to={`/adultos/${slug}`} replace />
  if (!temario) return <Navigate to={`/adultos/${slug}/${themeSlug}`} replace />
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

  const c = THEME_COLORS[theme.color]

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Adultos', level.code, theme.name, temario.name]} backTo={`/adultos/${slug}/${themeSlug}`} />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          {theme.name}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">{temario.name}</h1>
        <p className="text-ink/60 mb-10">Nivel {level.code} · {level.name} — {temario.description}</p>

        <div className="grid sm:grid-cols-2 gap-5">
          {TOPICS.map(({ slug: tSlug, label, desc, icon: Icon }) => (
            <Link
              key={tSlug}
              to={`/adultos/${slug}/${themeSlug}/${temarioSlug}/${tSlug}`}
              className={`texture-card rounded-2xl ${c.borderT4} p-6 hover:-translate-y-0.5 transition-transform`}
            >
              <Icon className={`${c.icon} mb-3`} size={26} />
              <p className="font-display text-lg font-semibold text-ink mb-1">{label}</p>
              <p className="text-ink/60 text-sm mb-3">{desc}</p>
              <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 ${c.tag}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
