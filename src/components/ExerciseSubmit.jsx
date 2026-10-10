import NameField from './NameField.jsx'

// Pie común de los ejercicios autocorregidos: nombre + "Corregir" antes de
// enviar, y el puntaje + "Intentar de nuevo" después. `hint` es el texto
// chico que explica por qué el botón está deshabilitado.
export default function ExerciseSubmit({ s, c, kids, studentName, setStudentName, disabled, hint, onSubmit, submitted, score, total, unit = 'correctas', onRetry }) {
  if (!submitted) {
    return (
      <div className="mt-8">
        <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
        <button
          onClick={onSubmit}
          disabled={disabled}
          className={`w-full py-3 ${s.primary} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Corregir
        </button>
        {disabled && hint && <p className={`${s.muted} text-xs mt-2`}>{hint}</p>}
      </div>
    )
  }
  return (
    <div className={`mt-8 ${s.resultBox} p-6 text-center`}>
      <p className={s.resultTitle}>
        {score} / {total} {unit}
      </p>
      <button onClick={onRetry} className={`mt-4 ${s.link}`}>
        Intentar de nuevo
      </button>
    </div>
  )
}
