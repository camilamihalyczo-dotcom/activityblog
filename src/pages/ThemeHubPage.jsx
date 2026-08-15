import { Link, useParams, Navigate } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { getTheme, THEME_COLORS } from '../data/themes.js'
import { useLevelAccess } from '../hooks.js'
import PasswordGate from '../components/PasswordGate.jsx'
import TicketHeader from '../components/TicketHeader.jsx'

export default function ThemeHubPage() {
  const { level: slug, theme: themeSlug } = useParams()
  const level = getLevel(slug)
  const theme = getTheme(themeSlug)
  // La clave es por track, no por nivel: se guarda con una key que depende
  // solo del track, así que desbloquear "Business English" una vez alcanza
  // para cualquier nivel (A1-A2/B1-B2/C1-C2) que use ese mismo track.
  const [unlocked, unlock] = useLevelAccess(`track-${themeSlug}`)

  if (!level) return <Navigate to="/adultos" replace />
  if (!theme) return <Navigate to={`/adultos/${slug}`} replace />
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
      <TicketHeader crumbs={['Adultos', level.code, theme.name]} backTo={`/adultos/${slug}`} />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          {theme.progression}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">{theme.name}</h1>
        <p className="text-ink/60 mb-10">Nivel {level.code} · {level.name} — {theme.description}</p>

        <div className="flex flex-col gap-5">
          {theme.temarios.map((temario, i) => (
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
