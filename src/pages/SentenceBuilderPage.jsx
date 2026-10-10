import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SentenceBuilderExercise from '../components/SentenceBuilderExercise.jsx'

export default function SentenceBuilderPage() {
  const { level: levelSlug, theme: trackSlug, temario: temarioSlug } = useParams()
  const level = getLevel(levelSlug)
  const { status, data } = useActivityLoad(
    () =>
      Promise.all([
        fetchTrack(trackSlug),
        fetchTemario(trackSlug, temarioSlug),
        fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'sentence_builder'), 'sentence_builder'),
      ]),
    [levelSlug, trackSlug, temarioSlug],
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
  const exercises = content || []
  const c = THEME_COLORS[theme.color_key]
  const styles = { ...c, card: `texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 text-ink`, border: c.borderT4 }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Sentence Builder']} backTo={`/adultos/${levelSlug}/${trackSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>Sentence Builder</span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Sentence Builder</h1>
        <p className="text-ink/60 mb-8">Ordená los bloques para construir la oración natural en inglés.</p>
        {exercises.length === 0 ? (
          <EmptyState label="desafíos de sintaxis" />
        ) : (
          exercises.map((exercise) => (
            <SentenceBuilderExercise key={exercise.id} exercise={exercise} c={styles} scope="adultos" levelSlug={levelSlug} trackSlug={trackSlug} temarioSlug={temarioSlug} />
          ))
        )}
      </div>
    </div>
  )
}
