import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

// Pista opcional por pregunta (solo Cuestionario, por ahora). Si la
// pregunta no tiene `hint` cargado, no renderiza nada — es 100% opcional,
// item por item, como se cargó desde /notas-profe/content.
export default function QuestionHint({ hint, kids = false }) {
  const [shown, setShown] = useState(false)
  if (!hint) return null

  if (kids) {
    return (
      <div className="mb-3">
        {!shown ? (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="flex items-center gap-1.5 text-kidsInk/70 hover:text-kidsInk font-playful text-xs font-semibold underline"
          >
            <Lightbulb size={14} /> Ver pista
          </button>
        ) : (
          <p className="font-playful text-xs text-kidsInk/70 bg-kidsCream rounded-lg p-2.5 flex items-start gap-1.5">
            <Lightbulb size={14} className="shrink-0 mt-0.5" />
            <span>{hint}</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mb-3">
      {!shown ? (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="flex items-center gap-1.5 text-ink/60 hover:text-ink text-xs font-medium underline"
        >
          <Lightbulb size={14} /> Ver pista
        </button>
      ) : (
        <p className="text-xs text-ink/60 bg-paper rounded-lg p-2.5 flex items-start gap-1.5">
          <Lightbulb size={14} className="shrink-0 mt-0.5" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  )
}
