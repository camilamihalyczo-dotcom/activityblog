import KidsSpeechBubbles from './KidsSpeechBubbles.jsx'

export default function KidsEmptyState({ label }) {
  return (
    <div className="bg-white rounded-3xl shadow-kids p-10 text-center max-w-lg mx-auto">
      <KidsSpeechBubbles
        phrases={['Soon!', 'Coming up next…', "It's on the way!"]}
        className="w-40 h-40 mx-auto mb-4"
      />
      <p className="font-body font-bold uppercase tracking-wide text-lg text-kidsInk mb-2">
        Todavía no hay {label} para este grupo
      </p>
      <p className="font-playful text-kidsInk/70 text-sm">Muy pronto voy a sumar contenido acá. ¡Volvé a pasar! 🎈</p>
    </div>
  )
}
