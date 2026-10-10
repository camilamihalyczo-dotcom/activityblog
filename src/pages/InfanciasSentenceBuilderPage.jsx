import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import SentenceBuilderExercise from '../components/SentenceBuilderExercise.jsx'

export default function InfanciasSentenceBuilderPage() {
  const { group: groupSlug } = useParams()
  const { status, data } = useActivityLoad(
    () => Promise.all([fetchGroup(groupSlug), fetchContent(buildInfanciasScopeKey(groupSlug, 'sentence_builder'), 'sentence_builder')]),
    [groupSlug],
    ([group]) => Boolean(group)
  )

  if (status === 'loading') return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/70 font-playful text-sm">Cargando…</div>
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const [group, content] = data
  const exercises = content || []
  const c = KIDS_GROUP_COLORS[group.color_key]
  const styles = { ...c, card: `bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6 sm:p-8 text-kidsInk`, border: c.borderT8 }

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Sentence Builder']} backTo={`/infancias/${groupSlug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>Sentence Builder 🧩</span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Sentence Builder</h1>
        <p className="font-playful text-kidsInk/70 mb-8">Ordená los bloques para construir la oración.</p>
        {exercises.length === 0 ? (
          <KidsEmptyState label="desafíos de sintaxis" />
        ) : (
          exercises.map((exercise) => (
            <SentenceBuilderExercise key={exercise.id} exercise={exercise} c={styles} kids scope="infancias" groupSlug={groupSlug} />
          ))
        )}
      </div>
    </div>
  )
}
