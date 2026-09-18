import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import VoiceLabExercise from '../components/VoiceLabExercise.jsx'

export default function VoiceLabPage() {
  const { level: levelSlug, theme: trackSlug, temario: temarioSlug } = useParams()
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [challenges, setChallenges] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([
      fetchTrack(trackSlug),
      fetchTemario(trackSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(levelSlug, trackSlug, temarioSlug, 'voice_lab'), 'voice_lab'),
    ]).then(([track, temarioData, data]) => {
      if (!active) return
      setTheme(track)
      setTemario(temarioData)
      setChallenges(data || [])
    })
    return () => { active = false }
  }, [levelSlug, trackSlug, temarioSlug])

  if (!theme || !temario) return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  const c = THEME_COLORS[theme.color_key]
  const styles = { ...c, card: `texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8 text-ink`, border: c.borderT4 }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[getLevel(levelSlug).code, theme.name, temario.name, 'Voice Lab']} backTo={`/adultos/${levelSlug}/${trackSlug}/${temarioSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>Voice Lab</span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Voice Lab</h1>
        <p className="text-ink/60 mb-8">Entrená pronunciación y fluidez con desafíos de voz.</p>
        {challenges.length === 0 ? <EmptyState label="desafíos de voz" /> : challenges.map((challenge) => (
          <VoiceLabExercise key={challenge.id} challenge={challenge} c={styles} scope="adultos" levelSlug={levelSlug} trackSlug={trackSlug} temarioSlug={temarioSlug} />
        ))}
      </div>
    </div>
  )
}
