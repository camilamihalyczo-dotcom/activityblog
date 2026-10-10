import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { useActivityLoad } from '../lib/useActivityLoad.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import { ListeningExercise } from '../components/MultipleChoiceExercises.jsx'

export default function InfanciasListeningPage() {
  const { group: slug } = useParams()
  const scopeKey = buildInfanciasScopeKey(slug, 'listening')
  const { status, data } = useActivityLoad(
    () => Promise.all([fetchGroup(slug), fetchContent(scopeKey, 'listening')]),
    [scopeKey],
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
  const items = content || []
  const c = KIDS_GROUP_COLORS[group.color_key]
  const submission = { scope: 'infancias', groupSlug: slug }

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Listening']} backTo={`/infancias/${slug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>Listening 🎧</span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Listening</h1>
        <p className="font-playful text-kidsInk/70 mb-8">Mirá el video, leé la transcripción si la necesitás y respondé.</p>
        {items.length === 0 ? (
          <KidsEmptyState label="listenings" />
        ) : (
          items.map((item) => <ListeningExercise key={`${scopeKey}-${item.id}`} item={item} c={c} kids submission={submission} />)
        )}
      </div>
    </div>
  )
}
