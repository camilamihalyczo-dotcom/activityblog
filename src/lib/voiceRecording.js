import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Grabaciones de voz del Voice Lab (Adultos y Kids).
// - Se graban con MediaRecorder, que anda en todos los navegadores modernos
//   (también en Chrome de iPhone y dentro de WhatsApp/Instagram, donde no
//   hay reconocimiento de voz).
// - Se suben al bucket PRIVADO "voice-recordings" de Supabase (ver
//   supabase/schema_phase12_voice_recordings.sql): lxs alumnxs pueden subir
//   pero no ver nada; solo la profe, logueada en el panel, las escucha.
// - Se borran solas a los 90 días (lo hace el panel al abrir Respuestas).

export const RECORDINGS_BUCKET = 'voice-recordings'
export const MAX_SECONDS = 20
export const KEEP_DAYS = 90

export function canRecord() {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  )
}

// Safari/iPhone graba en mp4; Chrome, Firefox y Android en webm/ogg.
function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg']
  for (const type of candidates) {
    try {
      if (window.MediaRecorder.isTypeSupported?.(type)) return type
    } catch {
      /* sigue probando */
    }
  }
  return ''
}

const EXT = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/aac': 'aac' }
const baseType = (type) => String(type || '').split(';')[0].trim() || 'audio/webm'

export function recordErrorMessage(err) {
  const name = err?.name || ''
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Necesitamos permiso para usar el micrófono. Permitilo en el navegador y probá de nuevo.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No encontramos un micrófono en este dispositivo.'
  if (name === 'NotReadableError') return 'El micrófono lo está usando otra app. Cerrala y probá de nuevo.'
  return 'No pudimos grabar. Probá de nuevo.'
}

// Hook para grabar: start() / stop() / reset(). Corta solo a los MAX_SECONDS.
export function useRecorder() {
  const [state, setState] = useState('idle') // idle | recording | done
  const [blob, setBlob] = useState(null)
  const [url, setUrl] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const recRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const urlRef = useRef('')

  const cleanupStream = () => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const setNewUrl = (next) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = next
    setUrl(next)
  }

  useEffect(
    () => () => {
      try {
        if (recRef.current?.state === 'recording') recRef.current.stop()
      } catch {
        /* nada */
      }
      cleanupStream()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    []
  )

  const stop = useCallback(() => {
    try {
      if (recRef.current?.state === 'recording') recRef.current.stop()
    } catch {
      cleanupStream()
      setState('idle')
    }
  }, [])

  const start = useCallback(async () => {
    setError('')
    if (!canRecord()) {
      setError('Este navegador no permite grabar audio.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMimeType()
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      const chunks = []
      rec.ondataavailable = (e) => {
        if (e.data?.size) chunks.push(e.data)
      }
      rec.onstop = () => {
        cleanupStream()
        const out = new Blob(chunks, { type: baseType(rec.mimeType || mimeType) })
        if (!out.size) {
          setError('No se grabó nada. Probá de nuevo.')
          setState('idle')
          return
        }
        setBlob(out)
        setNewUrl(URL.createObjectURL(out))
        setState('done')
      }
      recRef.current = rec
      rec.start()
      setSeconds(0)
      setState('recording')
      const started = Date.now()
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - started) / 1000)
        setSeconds(s)
        if (s >= MAX_SECONDS) stop()
      }, 250)
    } catch (err) {
      cleanupStream()
      setError(recordErrorMessage(err))
      setState('idle')
    }
  }, [stop])

  const reset = useCallback(() => {
    setBlob(null)
    setNewUrl('')
    setSeconds(0)
    setState('idle')
  }, [])

  return { state, blob, url, seconds, error, start, stop, reset }
}

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

// Sube la grabación y devuelve su ruta en el bucket ("2026-11/uuid.webm").
// A diferencia de las entregas comunes, si falla TIRA error: el alumnx
// tiene que saber que no le llegó a la profe.
export async function uploadRecording(blob) {
  const type = baseType(blob.type)
  const now = new Date()
  const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const path = `${folder}/${uuid()}.${EXT[type] || 'webm'}`
  const { error } = await supabase.storage.from(RECORDINGS_BUCKET).upload(path, blob, { contentType: type, upsert: false })
  if (error) throw error
  return path
}

// Link temporal (1 hora) para escuchar una grabación desde el panel.
export async function recordingUrl(path) {
  const { data, error } = await supabase.storage.from(RECORDINGS_BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function deleteRecordings(paths) {
  const list = (paths || []).filter(Boolean)
  if (!list.length) return
  const { error } = await supabase.storage.from(RECORDINGS_BUCKET).remove(list)
  if (error) throw error
}

// Borra las grabaciones de más de KEEP_DAYS días. La corre el panel de
// Respuestas como mucho una vez por día (por navegador). Las carpetas son
// por mes, así que alcanza con revisar las de hace 3 meses o más.
export async function cleanupOldRecordings() {
  const KEY = 'voice-recordings-cleanup'
  try {
    const last = Number(localStorage.getItem(KEY) || 0)
    if (Date.now() - last < 24 * 3600 * 1000) return 0
  } catch {
    /* sin storage: se corre igual */
  }
  const cutoff = Date.now() - KEEP_DAYS * 24 * 3600 * 1000
  const cutoffDate = new Date(cutoff)
  const cutoffFolder = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`
  const bucket = supabase.storage.from(RECORDINGS_BUCKET)
  const { data: folders, error } = await bucket.list('', { limit: 1000 })
  if (error) return 0
  let removed = 0
  for (const folder of folders || []) {
    if (!/^\d{4}-\d{2}$/.test(folder.name) || folder.name > cutoffFolder) continue
    const { data: files } = await bucket.list(folder.name, { limit: 1000 })
    const old = (files || [])
      .filter((f) => f.name && new Date(f.created_at || f.updated_at || 0).getTime() < cutoff)
      .map((f) => `${folder.name}/${f.name}`)
    if (old.length) {
      await bucket.remove(old)
      removed += old.length
    }
  }
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* nada */
  }
  return removed
}
