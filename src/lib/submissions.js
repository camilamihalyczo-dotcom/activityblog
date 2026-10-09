import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Guarda cada corrección/entrega de un ejercicio en la tabla `submissions`
// (ver supabase/schema_phase7.sql) para que la profe pueda revisarla
// después en /notas-profe/respuestas. Nunca bloquea ni rompe la UI del
// alumno: el ✓/✗ que ya ve en pantalla no depende de que esto se guarde
// bien (por ejemplo, sin conexión, o si todavía no corriste el schema).
// `id` (opcional): la entrega se guarda con ese id. Si además se pasa
// `replace: true`, en vez de crear otra entrega se ACTUALIZA la que ya
// tiene ese id (lo usa Reading & Writing cuando el alumno toca "Seguir
// editando" y vuelve a guardar). Requiere la función de
// supabase/schema_phase9_submission_edits.sql; si todavía no se corrió (o
// pasó más de una hora), se guarda como entrega nueva, igual que antes.
export async function recordSubmission({
  id = null,
  replace = false,
  scope,
  levelSlug = null,
  trackSlug = null,
  temarioSlug = null,
  groupSlug = null,
  contentType,
  label = null,
  studentName = '',
  score = null,
  total = null,
  detail = [],
}) {
  const row = {
    scope,
    level_slug: levelSlug,
    track_slug: trackSlug,
    temario_slug: temarioSlug,
    group_slug: groupSlug,
    content_type: contentType,
    label,
    student_name: studentName?.trim() || null,
    score,
    total,
    detail,
  }
  try {
    if (id && replace) {
      const { data, error } = await supabase.rpc('update_recent_submission', {
        p_id: id,
        p_student_name: row.student_name,
        p_score: score,
        p_total: total,
        p_detail: detail,
      })
      if (!error && data === true) return
      if (error) console.warn('[submissions] no se pudo actualizar la entrega, se guarda como nueva:', error.message)
    }
    // Si se intentó reemplazar y no se pudo, va como entrega nueva (sin el
    // id viejo, para no chocar con la que ya existe).
    const { error } = await supabase.from('submissions').insert(id && !replace ? { id, ...row } : row)
    if (error) console.warn('[submissions] no se pudo guardar la respuesta:', error.message)
  } catch (err) {
    console.warn('[submissions] no se pudo guardar la respuesta:', err)
  }
}

export function newSubmissionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const STORAGE_KEY = 'activityblog_student_name'

// El nombre es opcional y se guarda en este navegador (localStorage) nomás
// para no tener que volver a escribirlo en cada ejercicio — no es un login.
export function useStudentName() {
  const [name, setName] = useState('')

  useEffect(() => {
    try {
      setName(localStorage.getItem(STORAGE_KEY) || '')
    } catch {
      // Si localStorage no está disponible (modo privado, etc.) el campo
      // arranca vacío y listo — no es un error que valga la pena mostrar.
    }
  }, [])

  const update = (value) => {
    setName(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Idem: si falla el guardado, el alumno solo va a tener que
      // reescribir su nombre la próxima vez.
    }
  }

  return [name, update]
}
