import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { cleanPairs } from '../lib/pronunciation.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PronunciationExercise from '../components/PronunciationExercise.jsx'

export default function PronunciationPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const { status, data } = useActivityLoad(
    () =>
      Promise.all([
        fetchTrack(themeSlug),
        fetchTemario(themeSlug, temarioSlug),
        fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'pronunciation'), 'pronunciation'),
      ]),
    [slug, themeSlug, temarioSlug],
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
  const exercises = (content || []).filter((e) => cleanPairs(e.pairs).length > 0)
  const c = THEME_COLORS[theme.color_key]

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Pronunciación']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>Pronunciación</span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Pronunciación</h1>
        <p className="text-ink/60 mb-8">Escuchá las palabras y emparejá las que suenan igual.</p>
        {exercises.length === 0 ? (
          <EmptyState label="ejercicios de pronunciación" />
        ) : (
          exercises.map((exercise) => (
            <PronunciationExercise
              key={exercise.id}
              exercise={exercise}
              c={c}
              submission={{ scope: 'adultos', levelSlug: slug, trackSlug: themeSlug, temarioSlug }}
            />
          ))
        )}
      </div>
    </div>
  )
}
