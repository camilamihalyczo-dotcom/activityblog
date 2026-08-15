import { useState } from 'react'
import { Lock } from 'lucide-react'
import KidsBlobs from './KidsBlobs.jsx'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'

export default function KidsPasswordGate({ group, onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const c = KIDS_GROUP_COLORS[group.color_key] || KIDS_GROUP_COLORS.kidsPurple

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === group.passcode.toLowerCase()) {
      setError(false)
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div className="relative min-h-screen bg-kidsCream flex items-center justify-center px-5 py-16">
      <KidsBlobs />
      <div className="relative bg-white rounded-[28px] shadow-kids p-8 sm:p-10 text-center max-w-md w-full">
        <div className={`w-16 h-16 mx-auto rounded-full ${c.bg} flex items-center justify-center mb-5`}>
          <Lock className="text-white" size={24} />
        </div>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-xl sm:text-2xl text-kidsInk mb-2">
          {group.name} · {group.age_range}
        </h1>
        <p className="font-playful text-kidsInk/65 text-sm mb-8">
          Ingresá la clave que te compartió la profe para entrar a este grupo.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Clave de acceso"
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border-2 border-kidsInk/12 bg-kidsCream font-playful text-kidsInk text-center tracking-widest focus:outline focus:outline-3 ${c.outline} outline-none transition-colors`}
          />
          {error && (
            <p className="text-kidsRed font-playful text-sm font-medium">
              Esa clave no es correcta. Revisá mayúsculas/espacios o consultá con la profe.
            </p>
          )}
          <button
            type="submit"
            className={`mt-2 ${c.bg} text-white font-playful font-semibold py-3 rounded-full hover:-translate-y-0.5 transition-transform`}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
