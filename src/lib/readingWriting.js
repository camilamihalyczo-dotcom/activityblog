// Helpers compartidos por las páginas de Reading & Writing (Adultos e
// Infancias). Las preguntas multiple choice de un Reading se corrigen
// solas, igual que en el Cuestionario; las abiertas y los Writing quedan
// para revisión manual de la profe.

// Devuelve el texto de la opción correcta, o null si no hay una marcada.
// `answer` se guarda como índice (panel nuevo); contenido viejo puede
// tenerlo como texto.
export function correctOptionText(question) {
  const options = question.options || []
  if (Number.isInteger(question.answer)) return options[question.answer] || null
  if (typeof question.answer === 'string' && question.answer.trim()) return question.answer
  return null
}

export function isAutoGraded(question) {
  return question.type === 'multiple_choice' && Boolean(correctOptionText(question))
}

const hasText = (value) => typeof value === 'string' && value.trim() !== ''

// Arma una entrega por ítem que el alumno haya respondido (los ítems que
// dejó en blanco no se guardan, así no aparecen entregas vacías en el
// panel de respuestas).
export function buildReadingWritingSubmissions(items, readingAnswers, writingAnswers) {
  const submissions = []
  for (const item of items) {
    if (item.type === 'reading') {
      const answers = readingAnswers[item.id] || {}
      const questions = item.questions || []
      if (!questions.some((q) => hasText(answers[q.id]))) continue
      const graded = questions.filter(isAutoGraded)
      const detail = questions.map((q) => {
        const given = hasText(answers[q.id]) ? answers[q.id] : null
        if (isAutoGraded(q)) {
          const correct = correctOptionText(q)
          return { id: q.id, question: q.q, given, correct, is_correct: given === correct }
        }
        return { id: q.id, question: q.q, answer: given || '', manual_review: true }
      })
      submissions.push({
        itemId: item.id,
        label: `Reading — ${item.title}`,
        score: graded.length ? detail.filter((d) => d.is_correct).length : null,
        total: graded.length || null,
        detail,
      })
    } else {
      const text = writingAnswers[item.id]
      if (!hasText(text)) continue
      submissions.push({
        itemId: item.id,
        label: `Writing — ${item.title}`,
        score: null,
        total: null,
        detail: [{ prompt: item.prompt, answer: text, manual_review: true }],
      })
    }
  }
  return submissions
}
