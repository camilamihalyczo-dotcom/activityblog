// Campo de nombre que aparece arriba del botón "Corregir"/"Guardar" en cada
// ejercicio. Obligatorio (sin nombre no se puede corregir/guardar) — así la
// profe siempre puede identificar de quién es cada entrega en
// /notas-profe/respuestas, en vez de encontrarse con filas "(sin nombre)"
// porque alguien se olvidó de completarlo. Se usa tanto en Adultos como en
// Infancias (con estilos distintos vía la prop `kids`) — la lógica de
// guardado vive en src/lib/submissions.js (useStudentName).
export default function NameField({ value, onChange, kids = false, c }) {
  if (kids) {
    return (
      <label className="block mb-5">
        <span className="block font-playful text-xs font-semibold uppercase tracking-wide text-kidsInk/50 mb-1">
          Tu nombre
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder="Escribí tu nombre para poder corregir"
          className={`w-full max-w-xs px-3 py-2 rounded-xl border-2 border-kidsInk/12 bg-kidsCream font-playful text-sm focus:outline focus:outline-3 ${c?.outline || ''} outline-none transition-colors`}
        />
      </label>
    )
  }

  return (
    <label className="block mb-5">
      <span className="block font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">Tu nombre</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder="Escribí tu nombre para poder corregir"
        className={`w-full max-w-xs px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm ${c?.focusBorder || ''} outline-none transition-colors`}
      />
    </label>
  )
}
