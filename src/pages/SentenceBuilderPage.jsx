import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SentenceBuilderExercise from '../components/SentenceBuilderExercise.jsx'

export default function SentenceBuilderPage() {
  const { level: levelSlug, theme: trackSlug, temario: temarioSlug } = useParams()
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [exercises, setExercises] = useState([])
  useEffect(() => {
    Promise.all([fetchTrack(trackSlug), fetchTemario(trackSlug, temarioSlug), fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'sentence_builder'), 'sentence_builder')])
      .then(([track, temarioData, data]) => { setTheme(track); setTemario(temarioData); setExercises(data || []) })
  }, [levelSlug, trackSlug, temarioSlug])
  if (!theme || !temario) return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  const c = THEME_COLORS[theme.color_key]
  return <div className="min-h-screen">
    <TicketHeader crumbs={[getLevel(levelSlug).code, theme.name, temario.name, 'Sentence Builder']} backTo={`/adultos/${levelSlug}/${trackSlug}/${temarioSlug}`} showFloatingBack />
    <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
      <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>Sentence Builder</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Sentence Builder</h1>
      <p className="text-ink/60 mb-8">Ordená los bloques para construir la oración natural en inglés.</p>
      {!exercises.length ? <EmptyState label="desafíos de sintaxis" /> : exercises.map((exercise) => <SentenceBuilderExercise key={exercise.id} exercise={exercise} c={{ ...c, card: `texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 text-ink`, border: c.borderT4 }} scope="adultos" levelSlug={levelSlug} trackSlug={trackSlug} temarioSlug={temarioSlug} />)}
    </div>
  </div>
}
