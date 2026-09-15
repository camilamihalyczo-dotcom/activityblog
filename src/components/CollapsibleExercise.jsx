import { ChevronDown } from 'lucide-react'

export default function CollapsibleExercise({ children, title, label, icon: Icon, className = '' }) {
  return (
    <details className={`group ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 select-none">
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={18} aria-hidden="true" />}
          <span className="min-w-0">
            {label && <span className="block font-mono text-[10px] uppercase tracking-widest opacity-60">{label}</span>}
            <span className="block truncate font-display text-xl font-semibold sm:text-2xl">{title}</span>
          </span>
        </span>
        <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={22} aria-hidden="true" />
      </summary>
      <div className="pt-5">{children}</div>
    </details>
  )
}
