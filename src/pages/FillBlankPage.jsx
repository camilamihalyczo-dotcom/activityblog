import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import FillBlankExercise from '../components/FillBlankExercise.jsx'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function FillBlankPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [exercises, setExercises] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'fill_blank'), 'fill_blank'),
    ])
      .then(([trackData, temarioData, exercisesData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setExercises(exercisesData || [])
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug, themeSlug, temarioSlug])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  }
  if (status === 'error' || !theme || !temario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = THEME_COLORS[theme.color_key]
  const nonEmptyExercises = exercises.filter((e) => (e.sentences || []).length > 0)

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Completar oraciones']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Completar oraciones
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Completar oraciones</h1>
        <p className="text-ink/60 mb-8">Completá los espacios de cada oración.</p>

        {nonEmptyExercises.length === 0 ? (
          <EmptyState label="oraciones para completar" />
        ) : (
          nonEmptyExercises.map((exercise) => (
            <FillBlankExercise
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
