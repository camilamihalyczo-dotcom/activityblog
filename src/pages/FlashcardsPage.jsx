import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { RotateCw, ArrowLeft, ArrowRight, Shuffle } from 'lucide-react'

export default function FlashcardsPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [order, setOrder] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'flashcards'), 'flashcards'),
    ])
      .then(([trackData, temarioData, flashcardsData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        setFlashcards(flashcardsData || [])
        setOrder((flashcardsData || []).map((_, i) => i))
        setIndex(0)
        setFlipped(false)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug, themeSlug, temarioSlug])

  const shuffle = () => {
    const next = [...order]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    setOrder(next)
    setIndex(0)
    setFlipped(false)
  }

  const go = (dir) => {
    setFlipped(false)
    setIndex((i) => (i + dir + order.length) % order.length)
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Cargando…</div>
  }
  if (status === 'error' || !theme || !temario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = THEME_COLORS[theme.color_key]

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Flashcards']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Vocabulario
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Flashcards</h1>
        <p className="text-ink/60 mb-8">Tocá la tarjeta para dar vuelta y ver la traducción.</p>

        {flashcards.length === 0 ? (
          <EmptyState label="flashcards" />
        ) : (
          <>
            <p className="font-mono text-xs text-ink/50 mb-3 uppercase tracking-wider">
              Tarjeta {index + 1} de {order.length}
            </p>
            <button
              onClick={() => setFlipped((f) => !f)}
              className={`w-full aspect-[16/9] texture-card rounded-2xl ${c.borderT4} flex items-center justify-center p-8 text-center transition-transform duration-300`}
              style={{ perspective: '1000px' }}
            >
              <span className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {flipped ? flashcards[order[index]].back : flashcards[order[index]].front}
              </span>
            </button>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => go(-1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-ink/15 text-ink font-medium hover:border-ink transition-colors"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <button
                onClick={() => setFlipped((f) => !f)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-cream font-medium ${c.hoverBg} transition-colors`}
              >
                <RotateCw size={16} /> Girar
              </button>
              <button
                onClick={() => go(1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-ink/15 text-ink font-medium hover:border-ink transition-colors"
              >
                Siguiente <ArrowRight size={16} />
              </button>
            </div>

            <button
              onClick={shuffle}
              className={`mt-8 flex items-center gap-2 mx-auto text-ink/60 ${c.hoverText} text-sm font-medium transition-colors`}
            >
              <Shuffle size={15} /> Mezclar tarjetas
            </button>
          </>
        )}
      </div>
    </div>
  )
}
