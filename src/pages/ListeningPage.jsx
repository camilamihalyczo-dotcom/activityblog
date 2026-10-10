import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { ListeningExercise } from '../components/MultipleChoiceExercises.jsx'

export default function ListeningPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const scopeKey = buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'listening')
  const { status, data } = useActivityLoad(
    () => Promise.all([fetchTrack(themeSlug), fetchTemario(themeSlug, temarioSlug), fetchContent(scopeKey, 'listening')]),
    [scopeKey],
    ([track, temario]) => Boolean(level && track && temario)
  )

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const [theme, temario, content] = data
  const items = content || []
  const c = THEME_COLORS[theme.color_key]
  const submission = { scope: 'adultos', levelSlug: slug, trackSlug: themeSlug, temarioSlug }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Listening']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>Listening</span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Listening</h1>
        <p className="text-ink/60 mb-8">Mirá el video, leé la transcripción si la necesitás y respondé.</p>
        {items.length === 0 ? (
          <EmptyState label="listenings" />
        ) : (
          items.map((item) => <ListeningExercise key={`${scopeKey}-${item.id}`} item={item} c={c} submission={submission} />)
        )}
      </div>
    </div>
  )
}
