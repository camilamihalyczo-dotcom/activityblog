import { createClient } from '@supabase/supabase-js'

// Credenciales del proyecto de Supabase. Se leen de variables de entorno
// (ver .env.example) para no dejar la URL/clave hardcodeadas en el código —
// la "anon key" es pública por diseño (es la que usa el navegador), pero
// igual conviene manejarla como config y no como texto fijo en el repo.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // No tiramos error para que la app siga renderizando (útil en desarrollo
  // antes de configurar Supabase) — pero sin las variables reales, todo lo
  // que dependa de la base de datos (blog, panel de admin) va a fallar al
  // pedir datos. Ver supabase/README.md para los pasos de configuración.
  console.warn(
    '[Supabase] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Copiá .env.example a .env.local y completá los datos de tu proyecto (instrucciones en supabase/README.md).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
