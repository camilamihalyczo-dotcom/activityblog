// Caché en memoria para lecturas del sitio público. Cuando un alumno pasa
// de Flashcards a Cuestionario dentro del mismo temario, el track y el
// temario ya se pidieron — así no se vuelven a pedir a Supabase y la página
// aparece casi al instante. Dura mientras la pestaña esté abierta (con un
// vencimiento corto, para que el contenido nuevo aparezca sin recargar).
//
// El panel /notas-profe nunca usa la caché: ahí siempre se quiere ver lo
// último que está guardado.

const TTL_MS = 5 * 60 * 1000
const store = new Map() // key -> { promise, expires }

function isAdminRoute() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/notas-profe')
}

export function cached(key, fetcher) {
  if (isAdminRoute()) return fetcher()
  const now = Date.now()
  const hit = store.get(key)
  if (hit && hit.expires > now) return hit.promise
  const promise = fetcher().catch((err) => {
    // Un error no se guarda: el próximo intento vuelve a pedirlo.
    store.delete(key)
    throw err
  })
  store.set(key, { promise, expires: now + TTL_MS })
  return promise
}

// Se llama después de cualquier escritura desde el panel.
export function clearCache() {
  store.clear()
}
