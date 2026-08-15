import { useState } from 'react'

export function useLevelAccess(slug) {
  const key = `acceso-nivel-${slug}`
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(key) === 'ok'
    } catch {
      return false
    }
  })

  const unlock = () => {
    try {
      sessionStorage.setItem(key, 'ok')
    } catch {
      // sessionStorage no disponible; el desbloqueo dura solo esta vista
    }
    setUnlocked(true)
  }

  return [unlocked, unlock]
}
