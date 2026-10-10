import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { cleanPairs } from '../lib/pronunciation.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import PronunciationExercise from '../components/PronunciationExercise.jsx'

export default function InfanciasPronunciationPage() {
  const { group: slug } = useParams()
  const { status, data } = useActivityLoad(
    () => Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'pronunciation'), 'pronunciation')]),
    [slug],
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
  const exercises = (content || []).filter((e) => cleanPairs(e.pairs).length > 0)
  const c = KIDS_GROUP_COLORS[group.color_key]

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Pronunciación']} backTo={`/infancias/${slug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>Pronunciación 🔊</span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Pronunciación</h1>
        <p className="font-playful text-kidsInk/70 mb-8">Escuchá las palabras y juntá las que suenan igual.</p>
        {exercises.length === 0 ? (
          <KidsEmptyState label="ejercicios de pronunciación" />
        ) : (
          exercises.map((exercise) => (
            <PronunciationExercise key={exercise.id} exercise={exercise} c={c} kids submission={{ scope: 'infancias', groupSlug: slug }} />
          ))
        )}
      </div>
    </div>
  )
}
