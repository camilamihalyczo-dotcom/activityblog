import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { QuizExercise } from '../components/MultipleChoiceExercises.jsx'

export default function QuizPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const scopeKey = buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'quiz')
  const { status, data } = useActivityLoad(
    () => Promise.all([fetchTrack(themeSlug), fetchTemario(themeSlug, temarioSlug), fetchContent(scopeKey, 'quiz')]),
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
  const items = (content || []).filter((q) => (q.questions || []).length > 0)
  const c = THEME_COLORS[theme.color_key]
  const submission = { scope: 'adultos', levelSlug: slug, trackSlug: themeSlug, temarioSlug }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Cuestionario']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>Cuestionario</span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Cuestionario</h1>
        <p className="text-ink/60 mb-8">Elegí la opción correcta en cada pregunta.</p>
        {items.length === 0 ? (
          <EmptyState label="cuestionarios" />
        ) : (
          items.map((item) => <QuizExercise key={`${scopeKey}-${item.id}`} quiz={item} c={c} submission={submission} />)
        )}
      </div>
    </div>
  )
}
