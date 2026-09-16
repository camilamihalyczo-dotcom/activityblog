import { Link } from 'react-router-dom'
import { BookMarked, Volume2 } from 'lucide-react'

export default function TrackResources({ glossaryTo, showGlossary = true }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showGlossary && (
        <Link
          to={glossaryTo}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-ink/20 rounded-full px-4 py-2 text-ink/70 hover:border-ink hover:text-ink transition-colors"
        >
          <BookMarked size={14} /> Glosario
        </Link>
      )}
      <Link
        to="/tabla-fonetica"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-ink/20 rounded-full px-4 py-2 text-ink/70 hover:border-ink hover:text-ink transition-colors"
      >
        <Volume2 size={14} /> Tabla fonética
      </Link>
    </div>
  )
}
