const COLORS = {
  olive: { text: 'text-olive', bg: 'bg-olive/10' },
  stamp: { text: 'text-stamp', bg: 'bg-stamp/10' },
  gold: { text: 'text-gold', bg: 'bg-gold/10' },
  brand: { text: 'text-brand', bg: 'bg-brand/10' },
}

export default function StampBadge({ code, color = 'ink', size = 'md', rotate = -6 }) {
  const c = COLORS[color] || { text: 'text-ink', bg: 'bg-ink/5' }
  const sizes = size === 'lg' ? 'w-28 h-28 text-xl' : 'w-20 h-20 text-sm'
  return (
    <div
      className={`shrink-0 ${sizes} ${c.text} ${c.bg} rounded-full flex items-center justify-center font-mono font-semibold uppercase tracking-wide stamp-border`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {code}
    </div>
  )
}
