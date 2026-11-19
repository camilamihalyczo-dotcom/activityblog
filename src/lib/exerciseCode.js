// Código visible de cada ejercicio ("Clase 3 · Ej. 2"), para que lxs
// alumnxs lo puedan nombrar y para identificarlo en "Respuestas de los
// alumnos". Lo pone el importador de semanas (src/lib/weekImport.js); el
// contenido cargado a mano no lo tiene y se ve igual que siempre.
export function withCode(code, label) {
  const c = String(code || '').trim()
  const l = String(label || '').trim()
  if (!c) return label
  return l ? `${c} — ${l}` : c
}

// Número de clase/unidad a partir del código ("Clase 4 · Ej. 2" → 4).
// Adultos usa "Clase N"; English Kids Club, "Unidad N".
export function classOfCode(code) {
  const m = String(code || '').match(/^(?:Clase|Unidad)\s+(\d+)/i)
  return m ? Number(m[1]) : null
}

// "Unidad 4 · Ej. 2" → "Unidad 4" (para los botones de filtro).
export function unitLabelOfCode(code) {
  const m = String(code || '').match(/^((?:Clase|Unidad)\s+\d+)/i)
  return m ? m[1] : null
}
