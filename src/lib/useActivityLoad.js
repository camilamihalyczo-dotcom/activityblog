import { useEffect, useState } from 'react'

// Carga los datos de una página de actividad y devuelve
// { status: 'loading' | 'error' | 'ready', data }.
// - Si algo falla (sin conexión, Supabase caído), pasa a 'error' en vez de
//   quedarse en "Cargando…" para siempre.
// - Si el usuario cambia de página antes de que llegue la respuesta, la
//   respuesta vieja se descarta.
// `loader` debe devolver una promesa; `isValid(data)` (opcional) decide si
// lo que llegó alcanza para mostrar la página (ej: que el track exista).
export function useActivityLoad(loader, deps, isValid = () => true) {
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    let active = true
    setState({ status: 'loading', data: null })
    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (!active) return
        setState(isValid(data) ? { status: 'ready', data } : { status: 'error', data: null })
      })
      .catch(() => {
        if (active) setState({ status: 'error', data: null })
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
