import { ChevronDown } from 'lucide-react'

// `code` (opcional): código del ejercicio ("Clase 3 · Ej. 2"), se ve como
// una etiqueta arriba del título para que lxs alumnxs lo identifiquen.
export default function CollapsibleExercise({ children, title, label, code, icon: Icon, className = '', defaultOpen = false }) {
  return (
    <details className={`group ${className}`} open={defaultOpen || undefined}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 select-none">
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={18} aria-hidden="true" />}
          <span className="min-w-0">
            {(label || code) && (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-widest">
                {code && <span className="rounded border border-current px-1.5 py-px font-bold opacity-90" data-testid="exercise-code">{code}</span>}
                {label && <span className="opacity-60">{label}</span>}
              </span>
            )}
            <span className="block truncate font-display text-xl font-semibold sm:text-2xl">{title}</span>
          </span>
        </span>
        <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={22} aria-hidden="true" />
      </summary>
      <div className="pt-5">{children}</div>
    </details>
  )
}
