// Burbujas de diálogo de English Kids Club — la misma composición que el
// hero de la landing. Todo vectorial: no se pixela y no usa imágenes.
// Se usa en pantallas de bienvenida (clave de acceso, estados vacíos),
// nunca dentro de una actividad, para no competir con el contenido.
export default function KidsSpeechBubbles({
  phrases = ['Hello!', 'Can I try again?', 'I know this one!'],
  variant = 'trio',
  className = 'w-full h-auto',
}) {
  const [a, b, c] = phrases

  // La composición de tres burbujas necesita al menos ~240px de ancho para
  // que el texto se lea. Por debajo de eso usá variant="single": una sola
  // burbuja grande, que es lo que va en la pantalla de clave y en los
  // estados vacíos.
  if (variant === 'single') {
    return (
      <svg viewBox="0 0 210 104" className={className} role="img" aria-label={a}>
        <circle cx="192" cy="20" r="13" fill="#FFC94A" />
        <circle cx="16" cy="74" r="9" fill="#5FC98D" />
        <circle cx="176" cy="88" r="7" fill="#4FB4E8" opacity="0.5" />
        <path
          d="M50 12 H154 A24 24 0 0 1 178 36 V46 A24 24 0 0 1 154 70 H80 L50 92 L62 70 H50 A24 24 0 0 1 26 46 V36 A24 24 0 0 1 50 12 Z"
          fill="#FFFBF2" stroke="#2E2A4A" strokeOpacity="0.16" strokeWidth="2" strokeLinejoin="round"
        />
        <text x="102" y="49" fontSize="27" fontWeight="700" textAnchor="middle" fontFamily="Poppins, sans-serif" fill="#2E2A4A">
          {a}
        </text>
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      role="img"
      aria-label={phrases.join(' ')}
    >
      <circle cx="252" cy="60" r="18" fill="#FFC94A" />
      <circle cx="50" cy="150" r="11" fill="#5FC98D" />
      <circle cx="274" cy="192" r="9" fill="#4FB4E8" opacity="0.45" />
      <circle cx="228" cy="252" r="15" fill="#9B7EDE" opacity="0.35" />
      <circle cx="146" cy="272" r="6" fill="#4FB4E8" opacity="0.4" />

      <g transform="rotate(-5 84 66)">
        <rect x="28" y="42" width="112" height="48" rx="20" fill="#FFFBF2" stroke="#2E2A4A" strokeOpacity="0.12" strokeWidth="2" />
        <path d="M52 88 L48 104 L70 90 Z" fill="#FFFBF2" />
        <text x="84" y="73" fontSize="23" fontWeight="700" textAnchor="middle" fontFamily="Poppins, sans-serif" fill="#2E2A4A">
          {a}
        </text>
      </g>

      <g transform="rotate(3 178 134)">
        <rect x="92" y="112" width="172" height="44" rx="19" fill="#FFFBF2" stroke="#2E2A4A" strokeOpacity="0.12" strokeWidth="2" />
        <path d="M118 154 L112 169 L136 156 Z" fill="#FFFBF2" />
        <text x="178" y="140" fontSize="15" fontWeight="600" textAnchor="middle" fontFamily="Poppins, sans-serif" fill="#2E2A4A">
          {b}
        </text>
      </g>

      <g transform="rotate(-2 118 212)">
        <rect x="34" y="190" width="168" height="44" rx="19" fill="#FFFBF2" stroke="#2E2A4A" strokeOpacity="0.12" strokeWidth="2" />
        <path d="M60 232 L54 247 L78 234 Z" fill="#FFFBF2" />
        <text x="118" y="218" fontSize="15" fontWeight="600" textAnchor="middle" fontFamily="Poppins, sans-serif" fill="#2E2A4A">
          {c}
        </text>
      </g>
    </svg>
  )
}
