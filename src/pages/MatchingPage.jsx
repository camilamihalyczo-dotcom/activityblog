import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { CheckCircle2, XCircle, GripVertical } from 'lucide-react'

function shuffle(arr) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function BankChip({ id, text, selected, onClick, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 } : undefined
  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium bg-paper transition-colors touch-none
        ${isDragging ? 'opacity-50' : ''}
        ${selected ? 'border-ink bg-ink/5' : 'border-ink/15'}
        ${disabled ? 'opacity-40' : 'cursor-grab'}
      `}
      {...listeners}
      {...attributes}
    >
      <GripVertical size={14} className="text-ink/30 shrink-0" />
      {text}
    </button>
  )
}

function DropZone({ id, item, chipText, c, submitted, correct, onClickZone }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div className={`texture-card rounded-2xl ${c.borderT4} p-5 flex flex-col gap-3`}>
      {item.image_url && <img src={item.image_url} alt="" className="w-full max-h-40 object-cover rounded-lg" />}
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[10px] uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${c.tag}`}>
          {item.relation === 'antonym' ? 'Antónimo' : 'Sinónimo'}
        </span>
        <span className="font-semibold text-ink">{item.word}</span>
      </div>
      <button
        ref={setNodeRef}
        onClick={() => !submitted && onClickZone(id)}
        disabled={submitted}
        className={`min-h-[46px] rounded-lg border-2 border-dashed flex items-center justify-between gap-2 px-3 text-sm font-medium transition-colors
          ${isOver ? 'border-ink bg-ink/5' : 'border-ink/20'}
          ${submitted ? (correct ? 'border-olive bg-olive/10 border-solid' : chipText ? 'border-stamp bg-stamp/10 border-solid' : '') : ''}
        `}
      >
        <span>{chipText || (submitted ? '(sin responder)' : 'Soltá o tocá acá')}</span>
        {submitted && correct && <CheckCircle2 size={16} className="text-olive shrink-0" />}
        {submitted && !correct && chipText && <XCircle size={16} className="text-stamp shrink-0" />}
      </button>
    </div>
  )
}

export default function MatchingPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [bankOrder, setBankOrder] = useState([])
  const [placement, setPlacement] = useState({}) // targetItemId -> sourceItemId
  const [selectedChip, setSelectedChip] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor))

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'synonyms_antonyms'), 'synonyms_antonyms'),
    ])
      .then(([trackData, temarioData, itemsData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        const loaded = itemsData || []
        setItems(loaded)
        setBankOrder(shuffle(loaded.map((it) => it.id)))
        setPlacement({})
        setSelectedChip(null)
        setSubmitted(false)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug, themeSlug, temarioSlug])

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Sinónimos y antónimos']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <EmptyState label="pares de sinónimos/antónimos" />
        </div>
      </div>
    )
  }

  const itemsById = Object.fromEntries(items.map((it) => [it.id, it]))
  const placedSourceIds = new Set(Object.values(placement).filter(Boolean))
  const bankChips = bankOrder.filter((id) => !placedSourceIds.has(id))
  const allPlaced = bankChips.length === 0
  const score = items.filter((it) => placement[it.id] === it.id).length

  const placeChip = (targetId, sourceId) => {
    setPlacement((p) => ({ ...p, [targetId]: sourceId }))
    setSelectedChip(null)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    placeChip(over.id, active.id)
  }

  const handleClickZone = (targetId) => {
    if (selectedChip) {
      placeChip(targetId, selectedChip)
    } else if (placement[targetId]) {
      setPlacement((p) => ({ ...p, [targetId]: null }))
    }
  }

  const retry = () => {
    setBankOrder(shuffle(items.map((it) => it.id)))
    setPlacement({})
    setSelectedChip(null)
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Sinónimos y antónimos']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Sinónimos y antónimos
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Sinónimos y antónimos</h1>
        <p className="text-ink/60 mb-8">
          Tocá una palabra de la lista y después la tarjeta a la que corresponde (o arrastrala directo).
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-6">
            {items.map((item) => (
              <DropZone
                key={item.id}
                id={item.id}
                item={item}
                chipText={placement[item.id] ? itemsById[placement[item.id]]?.match : null}
                c={c}
                submitted={submitted}
                correct={placement[item.id] === item.id}
                onClickZone={handleClickZone}
              />
            ))}
          </div>

          {!submitted && (
            <div className="mt-6 texture-card rounded-2xl p-5">
              <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">
                Coincidencias {bankChips.length === 0 ? '(todas ubicadas)' : `(${bankChips.length} sin ubicar)`}
              </p>
              <div className="flex flex-wrap gap-2">
                {bankChips.length === 0 && <p className="text-ink/40 text-sm">¡Listo! Apretá "Corregir".</p>}
                {bankChips.map((id) => (
                  <BankChip
                    key={id}
                    id={id}
                    text={itemsById[id].match}
                    selected={selectedChip === id}
                    onClick={(chipId) => setSelectedChip((s) => (s === chipId ? null : chipId))}
                    disabled={submitted}
                  />
                ))}
              </div>
            </div>
          )}
        </DndContext>

        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allPlaced}
            className={`mt-8 w-full bg-ink text-cream font-semibold py-3 rounded-lg ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Corregir
          </button>
        ) : (
          <div className="mt-8 texture-card rounded-2xl p-6 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              {score} / {items.length} correctas
            </p>
            <button onClick={retry} className={`mt-4 text-ink/60 ${c.hoverText} text-sm font-medium underline`}>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
