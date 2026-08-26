import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Guarda cada corrección/entrega de un ejercicio en la tabla `submissions`
// (ver supabase/schema_phase7.sql) para que la profe pueda revisarla
// después en /notas-profe/respuestas. Nunca bloquea ni rompe la UI del
// alumno: el ✓/✗ que ya ve en pantalla no depende de que esto se guarde
// bien (por ejemplo, sin conexión, o si todavía no corriste el schema).
export async function recordSubmission({
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
  try {
    const { error } = await supabase.from('submissions').insert({
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
    })
    if (error) console.warn('[submissions] no se pudo guardar la respuesta:', error.message)
  } catch (err) {
    console.warn('[submissions] no se pudo guardar la respuesta:', err)
  }
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
