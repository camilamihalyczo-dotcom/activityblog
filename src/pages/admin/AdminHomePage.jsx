import { Link } from 'react-router-dom'

// A medida que se sume contenido a Supabase, cada sección pasa de
// `ready: false` a `ready: true` — el patrón (tabla + RLS + página pública
// que lee + pantalla acá que escribe) es el mismo que se usó para el blog.
const SECTIONS = [
  {
    to: '/admin/blog',
    label: 'Blog',
    desc: 'Novedades y reflexiones para Adultos e Infancias.',
    ready: true,
  },
  {
    to: '#',
    label: 'Tracks y grupos',
    desc: 'Nombre, descripción, color y clave de acceso de cada track (Adultos) y grupo (Infancias).',
    ready: false,
  },
  {
    to: '#',
    label: 'Flashcards, cuestionarios, listening y reading & writing',
    desc: 'El contenido de estudio de cada temario/grupo.',
    ready: false,
  },
]

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Panel de administración</h1>
      <p className="text-ink/60 mb-10">Desde acá vas a poder cargar contenido sin pasar por el chat.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {SECTIONS.map((s) =>
          s.ready ? (
            <Link
              key={s.label}
              to={s.to}
              className="texture-card rounded-2xl p-6 hover:-translate-y-0.5 transition-transform"
            >
              <p className="font-display text-lg font-semibold text-ink mb-1">{s.label}</p>
              <p className="text-ink/60 text-sm">{s.desc}</p>
            </Link>
          ) : (
            <div key={s.label} className="texture-card rounded-2xl p-6 opacity-50">
              <p className="font-display text-lg font-semibold text-ink mb-1">{s.label}</p>
              <p className="text-ink/60 text-sm mb-3">{s.desc}</p>
              <span className="inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 text-ink/40 border-ink/20">
                Próximamente
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
