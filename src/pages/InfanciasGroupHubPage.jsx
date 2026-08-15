import { Link, useParams, Navigate } from 'react-router-dom'
import { getGroup, KIDS_GROUP_COLORS } from '../data/kidsGroups.js'
import { useLevelAccess } from '../hooks.js'
import KidsPasswordGate from '../components/KidsPasswordGate.jsx'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsBlobs from '../components/KidsBlobs.jsx'
import { Layers, ListChecks, Headphones, BookOpenText } from 'lucide-react'

const ALL_TOPICS = [
  { slug: 'flashcards', label: 'Flashcards', desc: 'Vocabulario en formato de juego', icon: Layers },
  { slug: 'cuestionario', label: 'Cuestionario', desc: 'Preguntas de opción múltiple', icon: ListChecks },
  { slug: 'listening', label: 'Listening', desc: 'Video, canciones y preguntas', icon: Headphones },
  { slug: 'reading-writing', label: 'Reading & Writing', desc: 'Comprensión lectora y producción escrita', icon: BookOpenText },
]

export default function InfanciasGroupHubPage() {
  const { group: slug } = useParams()
  const group = getGroup(slug)
  const [unlocked, unlock] = useLevelAccess(`infancias-${slug}`)

  if (!group) return <Navigate to="/infancias" replace />
  if (!unlocked) return <KidsPasswordGate group={group} onUnlock={unlock} />

  const topics = ALL_TOPICS.filter((t) => group.topics.includes(t.slug))
  const c = KIDS_GROUP_COLORS[group.color]

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={['Infancias y adolescentes', group.name]} backTo="/infancias" />
      <div className="relative max-w-3xl mx-auto px-5 py-12 sm:py-16 overflow-hidden">
        <KidsBlobs />

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 shrink-0 rounded-full ${c.bg} text-white flex items-center justify-center font-playful font-bold text-sm`}>
            {group.milestone}
          </div>
          <span className={`font-playful font-bold text-xs uppercase tracking-wide ${c.text}`}>
            Nivel {group.milestone} de 4 · {group.ageRange}
          </span>
        </div>

        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Temas generales</h1>
        <p className="font-playful text-kidsInk/65 mb-10">{group.name} · {group.description}</p>

        <div className="relative grid sm:grid-cols-2 gap-5">
          {topics.map(({ slug: tSlug, label, desc, icon: Icon }) => (
            <Link
              key={tSlug}
              to={`/infancias/${slug}/${tSlug}`}
              className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6 hover:-translate-y-1 transition-transform`}
            >
              <Icon className={`${c.text} mb-4`} size={26} />
              <p className="font-body font-extrabold uppercase tracking-wide text-base text-kidsInk mb-1">{label}</p>
              <p className="font-playful text-kidsInk/65 text-sm">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
