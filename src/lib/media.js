import { supabase } from './supabaseClient.js'

const MAX_SIZE_MB = 5
const BUCKET = 'media'
// Techo de tamaño (lado más largo) al que se reducen las fotos antes de
// subirlas — de sobra para cómo se muestran en el sitio (nunca a pantalla
// completa), pero mucho más liviano que una foto de celular sin tocar.
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

function genFileId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Redimensiona y recomprime la imagen en el navegador antes de subirla —
// las fotos sacadas con el celular suelen venir a resolución/peso mucho
// más grande de lo que hace falta para una card del sitio, y eso hace más
// lenta cualquier página que las use. Si algo falla en el proceso (formato
// raro, navegador viejo), seguimos con el archivo original sin bloquear la
// subida.
async function compressImage(file) {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file
  // Ya es chica — no vale la pena reprocesarla.
  if (file.size < 300 * 1024) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close?.()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    // El PNG se mantiene como PNG (puede tener transparencia); todo lo
    // demás se recomprime como JPEG, que pesa mucho menos para fotos.
    const keepPng = file.type === 'image/png'
    const mime = keepPng ? 'image/png' : 'image/jpeg'
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, keepPng ? undefined : JPEG_QUALITY))
    if (!blob || blob.size >= file.size) return file

    const ext = keepPng ? 'png' : 'jpg'
    const newName = file.name.replace(/\.[^.]+$/, '') + '.' + ext
    return new File([blob], newName, { type: mime })
  } catch {
    return file
  }
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

  const processed = await compressImage(file)
  const ext = (processed.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${folder}/${genFileId()}.${ext}`

  // cacheControl largo: cada subida usa un nombre de archivo nuevo (UUID),
  // así que la URL de una imagen ya subida nunca cambia de contenido — se
  // puede cachear por mucho tiempo sin riesgo de mostrar algo desactualizado.
  const { error } = await supabase.storage.from(BUCKET).upload(path, processed, {
    cacheControl: '31536000',
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
