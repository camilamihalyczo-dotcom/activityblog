import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import VoiceLabExercise from '../components/VoiceLabExercise.jsx'

export default function InfanciasVoiceLabPage() {
  const { group: groupSlug } = useParams()
  const [group, setGroup] = useState(null)
  const [challenges, setChallenges] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([fetchGroup(groupSlug), fetchContent(buildInfanciasScopeKey(groupSlug, 'voice_lab'), 'voice_lab')])
      .then(([groupData, data]) => {
        if (!active) return
        setGroup(groupData)
        setChallenges(data || [])
      })
    return () => { active = false }
  }, [groupSlug])

  if (!group) return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/70 font-playful text-sm">Cargando…</div>
  const c = KIDS_GROUP_COLORS[group.color_key]
  const styles = { ...c, card: `bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6 sm:p-8 text-kidsInk`, border: c.borderT8 }

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Voice Lab']} backTo={`/infancias/${groupSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>Voice Lab 🎤</span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Voice Lab</h1>
        <p className="font-playful text-kidsInk/70 mb-8">Practicá pronunciación y fluidez en inglés.</p>
        {challenges.length === 0 ? <KidsEmptyState label="desafíos de voz" /> : challenges.map((challenge) => (
          <VoiceLabExercise key={challenge.id} challenge={challenge} c={styles} kids scope="infancias" groupSlug={groupSlug} />
        ))}
      </div>
    </div>
  )
}
