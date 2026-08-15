import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Estado de sesión del panel de administración.
// undefined = todavía no sabemos (chequeando) · null = no logueado · objeto = logueado.
export function useAdminSession() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) setSession(newSession)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return session
}
