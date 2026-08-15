// Manchas de color de fondo, tomadas del hero de la landing de Kids Club
// (.hero-blob). Puramente decorativas — se usan con moderación, solo en
// pantallas "de bienvenida" (selector de grupo, pantalla de clave).
export default function KidsBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
      <div className="absolute rounded-full blur-[2px] opacity-30 bg-kidsYellow w-64 h-64 -top-20 -left-16" />
      <div className="absolute rounded-full blur-[2px] opacity-30 bg-kidsBlue w-44 h-44 top-1/3 -right-10" />
      <div className="absolute rounded-full blur-[2px] opacity-25 bg-kidsPurple w-56 h-56 bottom-0 left-1/3" />
    </div>
  )
}
