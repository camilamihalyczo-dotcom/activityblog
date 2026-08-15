export default function EmptyState({ label }) {
  return (
    <div className="texture-card rounded-2xl p-10 text-center max-w-lg mx-auto">
      <p className="font-display text-xl text-ink mb-2">Todavía no hay {label} para este nivel</p>
      <p className="text-ink/60 text-sm">Muy pronto vamos a sumar contenido acá. ¡Volvé a pasar!</p>
    </div>
  )
}
