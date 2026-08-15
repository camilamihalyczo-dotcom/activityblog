import { Link } from 'react-router-dom'
import { GROUPS, KIDS_GROUP_COLORS } from '../data/kidsGroups.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsBlobs from '../components/KidsBlobs.jsx'
import { Newspaper } from 'lucide-react'

export default function InfanciasPage() {
  return (
    <div className="relative min-h-screen bg-kidsCream">
      <KidsHeader crumbs={['Infancias y adolescentes']} backTo="/" />
      <div className="relative max-w-5xl mx-auto px-5 py-12 sm:py-16 overflow-hidden">
        <KidsBlobs />
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <span className="inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk bg-kidsYellow px-4 py-1.5 rounded-full">
            English Kids Club 🎈
          </span>
          <Link
            to="/infancias/blog"
            className="relative z-10 inline-flex items-center gap-2 font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk bg-white border-2 border-kidsInk/10 rounded-full px-4 py-1.5 hover:border-kidsPurpleDeep hover:text-kidsPurpleDeep transition-colors"
          >
            <Newspaper size={14} /> Blog
          </Link>
        </div>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2 leading-tight">
          Elegí el grupo
        </h1>
        <p className="font-playful text-kidsInk/65 mb-6 max-w-lg">
          Como en un juego: cada grupo tiene su propio ritmo y su propio color. Vas a necesitar la clave que te compartió la profe para entrar.
        </p>

        {/* Camino de niveles: los 4 colores en orden de progresión
            (amarillo → verde → celeste → violeta), como en la landing. */}
        <div
          className="h-2 rounded-full mb-8 max-w-md bg-[linear-gradient(90deg,#FFC94A,#5FC98D,#4FB4E8,#9B7EDE)]"
          aria-hidden="true"
        />

        <div className="kids-track-path grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GROUPS.map((group) => {
            const c = KIDS_GROUP_COLORS[group.color]
            return (
              <Link
                key={group.slug}
                to={`/infancias/${group.slug}`}
                className={`relative z-10 bg-white rounded-[22px] shadow-kids ${c.borderT8} p-5 flex flex-col hover:-translate-y-1.5 transition-transform`}
              >
                <div className={`w-11 h-11 rounded-full ${c.bg} text-white flex items-center justify-center font-playful font-bold text-lg mb-4`}>
                  {group.milestone}
                </div>
                <p className="font-body font-extrabold uppercase tracking-wide text-lg text-kidsInk leading-tight mb-1">{group.name}</p>
                <p className={`font-playful font-bold text-xs ${c.text} mb-3`}>{group.ageRange}</p>
                <p className="font-playful text-kidsInk/65 text-sm">{group.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
