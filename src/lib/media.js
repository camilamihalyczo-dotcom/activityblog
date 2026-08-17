import { supabase } from './supabaseClient.js'

const MAX_SIZE_MB = 5
const BUCKET = 'media'

function genFileId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Sube una imagen al bucket 'media' de Supabase Storage (público) y
// devuelve su URL directa. `folder` es solo para organizar el bucket
// (ej: 'blog', 'flashcards') — no afecta permisos, esos son por bucket.
export async function uploadImage(file, folder = 'uploads') {
  if (!file) return null
  if (!file.type.startsWith('image/')) {
    throw new Error('Ese archivo no es una imagen.')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`La imagen es muy pesada (máximo ${MAX_SIZE_MB}MB).`)
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${folder}/${genFileId()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Borrado best-effort: si una imagen se reemplaza o se quita, tratamos de
// borrar el archivo viejo del bucket para no acumular basura. Si falla (por
// ejemplo porque la URL no es de nuestro bucket), no interrumpe nada.
export async function deleteImage(publicUrl) {
  if (!publicUrl) return
  const marker = `/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const path = publicUrl.slice(idx + marker.length)
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch {
    // no-op — no queremos que un borrado fallido bloquee al usuario
  }
}
