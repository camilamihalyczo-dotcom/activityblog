import { Link } from 'react-router-dom'
import { LEVELS } from '../data/levels.js'
import StampBadge from '../components/StampBadge.jsx'
import TicketHeader from '../components/TicketHeader.jsx'
import { Newspaper } from 'lucide-react'

// Igual que en la landing, cada nivel tiene su color y se ve en más de un
// lugar: no solo en el sello, también como franja lateral de la card.
const COLORS = {
  olive: { border: 'border-l-olive', tag: 'text-olive border-olive' },
  stamp: { border: 'border-l-stamp', tag: 'text-stamp border-stamp' },
  gold: { border: 'border-l-gold', tag: 'text-gold border-gold' },
}

export default function AdultosPage() {
  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Adultos']} backTo="/" />
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Elegí tu nivel</h1>
          <Link
            to="/adultos/blog"
            className="shrink-0 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-ink/20 rounded-full px-4 py-2 text-ink/70 hover:border-ink hover:text-ink transition-colors"
          >
            <Newspaper size={14} /> Blog
          </Link>
        </div>
        <p className="text-ink/60 mb-10">Dentro de cada nivel vas a elegir un track — ahí vas a necesitar la clave que te compartió tu profesora.</p>

        <div className="flex flex-col gap-5">
          {LEVELS.map((level, i) => {
            const c = COLORS[level.stampColor]
            return (
              <Link
                key={level.slug}
                to={`/adultos/${level.slug}`}
                className={`texture-card rounded-2xl border-l-8 ${c.border} p-6 flex items-center gap-6 hover:-translate-y-0.5 transition-transform`}
              >
                <StampBadge code={level.code} color={level.stampColor} rotate={i % 2 === 0 ? -6 : 5} />
                <div>
                  <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-2 ${c.tag}`}>
                    Nivel {level.code}
                  </span>
                  <p className="font-display text-xl font-semibold text-ink">{level.name}</p>
                  <p className="text-ink/60 text-sm mt-1">{level.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
