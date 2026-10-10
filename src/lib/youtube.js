// Acepta lo que se pegue en el panel — el ID solo ("dQw4w9WgXcQ") o
// cualquier link de YouTube (watch?v=, youtu.be/, shorts/, embed/, con
// parámetros extra como &t=30s) — y devuelve el ID del video, o '' si no
// se reconoce.
export function parseYouTubeId(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^[\w-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const host = url.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return url.pathname.slice(1, 12)
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v) return v.slice(0, 11)
      const m = url.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/)
      if (m) return m[1]
    }
  } catch {
    // no es una URL válida
  }
  return ''
}
