import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import FillBlankExercise from '../components/FillBlankExercise.jsx'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'

export default function InfanciasFillBlankPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [exercises, setExercises] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'fill_blank'), 'fill_blank')])
      .then(([groupData, exercisesData]) => {
        if (!active) return
        setGroup(groupData)
        setExercises(exercisesData || [])
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug])

  if (status === 'loading') {
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/70 font-playful text-sm">Cargando…</div>
  }
  if (status === 'error' || !group) {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = KIDS_GROUP_COLORS[group.color_key]
  const nonEmptyExercises = exercises.filter((e) => (e.sentences || []).length > 0)

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Completar oraciones']} backTo={`/infancias/${slug}`} showFloatingBack />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Completar oraciones ✏️
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Completar oraciones</h1>
        <p className="font-playful text-kidsInk/70 mb-8">Completá los espacios de cada oración.</p>

        {nonEmptyExercises.length === 0 ? (
          <KidsEmptyState label="oraciones para completar" />
        ) : (
          nonEmptyExercises.map((exercise) => (
            <FillBlankExercise key={exercise.id} exercise={exercise} c={c} kids submission={{ scope: 'infancias', groupSlug: slug }} />
          ))
        )}
      </div>
    </div>
  )
}
