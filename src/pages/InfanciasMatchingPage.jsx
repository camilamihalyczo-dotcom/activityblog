import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import NameField from '../components/NameField.jsx'
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
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-playful text-sm font-medium bg-kidsCream transition-colors touch-none
        ${isDragging ? 'opacity-50' : ''}
        ${selected ? 'border-kidsInk bg-kidsInk/5' : 'border-kidsInk/12'}
        ${disabled ? 'opacity-40' : 'cursor-grab'}
      `}
      {...listeners}
      {...attributes}
    >
      <GripVertical size={14} className="text-kidsInk/30 shrink-0" />
      {text}
    </button>
  )
}

function DropZone({ id, item, chipText, c, submitted, correct, onClickZone }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-5 flex flex-col gap-3`}>
      {item.image_url && <img src={item.image_url} alt="" className="w-full max-h-40 object-cover rounded-xl" />}
      <div className="flex items-center gap-2">
        <span className={`font-playful font-semibold text-[10px] uppercase tracking-widest ${c.bgLight} text-kidsInk rounded-full px-2.5 py-0.5`}>
          {item.relation === 'antonym' ? 'Antónimo' : 'Sinónimo'}
        </span>
        <span className="font-playful font-bold text-kidsInk">{item.word}</span>
      </div>
      <button
        ref={setNodeRef}
        onClick={() => !submitted && onClickZone(id)}
        disabled={submitted}
        className={`min-h-[46px] rounded-xl border-2 border-dashed flex items-center justify-between gap-2 px-3 font-playful text-sm font-medium transition-colors
          ${isOver ? 'border-kidsInk bg-kidsInk/5' : 'border-kidsInk/20'}
          ${submitted ? (correct ? 'border-kidsGreenDeep bg-kidsGreen/15 border-solid' : chipText ? 'border-kidsRed bg-kidsRed/10 border-solid' : '') : ''}
        `}
      >
        <span>{chipText || (submitted ? '(sin responder)' : 'Tocá o soltá acá')}</span>
        {submitted && correct && <CheckCircle2 size={16} className="text-kidsGreenDeep shrink-0" />}
        {submitted && !correct && chipText && <XCircle size={16} className="text-kidsRed shrink-0" />}
      </button>
    </div>
  )
}

export default function InfanciasMatchingPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [bankOrder, setBankOrder] = useState([])
  const [placement, setPlacement] = useState({})
  const [selectedChip, setSelectedChip] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor))

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'synonyms_antonyms'), 'synonyms_antonyms')])
      .then(([groupData, itemsData]) => {
        if (!active) return
        setGroup(groupData)
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
  }, [slug])

  if (status === 'loading') {
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/50 font-playful text-sm">Cargando…</div>
  }
  if (status === 'error' || !group) {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = KIDS_GROUP_COLORS[group.color_key]

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-kidsCream">
        <KidsHeader crumbs={[group.name, 'Sinónimos y antónimos']} backTo={`/infancias/${slug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <KidsEmptyState label="pares de sinónimos/antónimos" />
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
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Sinónimos y antónimos']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Sinónimos y antónimos 🔄
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Sinónimos y antónimos</h1>
        <p className="font-playful text-kidsInk/65 mb-8">Tocá una palabra y después la tarjeta a la que corresponde.</p>

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
            <div className="mt-6 bg-white rounded-[22px] shadow-kids p-5">
              <p className="font-playful text-xs uppercase tracking-wide text-kidsInk/45 font-semibold mb-3">
                Palabras {bankChips.length === 0 ? '(todas ubicadas)' : `(${bankChips.length} sin ubicar)`}
              </p>
              <div className="flex flex-wrap gap-2">
                {bankChips.length === 0 && <p className="text-kidsInk/40 font-playful text-sm">¡Listo! Apretá "Corregir".</p>}
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
          <div className="mt-8">
            <NameField value={studentName} onChange={setStudentName} kids c={c} />
            <button
              onClick={() => {
                setSubmitted(true)
                recordSubmission({
                  scope: 'infancias',
                  groupSlug: slug,
                  contentType: 'synonyms_antonyms',
                  studentName,
                  score,
                  total: items.length,
                  detail: items.map((item) => ({
                    id: item.id,
                    word: item.word,
                    given: placement[item.id] ? itemsById[placement[item.id]]?.match ?? null : null,
                    correct: item.match,
                    is_correct: placement[item.id] === item.id,
                  })),
                })
              }}
              disabled={!allPlaced}
              className={`w-full bg-kidsInk text-white font-playful font-semibold py-3 rounded-full ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Corregir
            </button>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-[22px] shadow-kids p-6 text-center">
            <p className="font-body font-extrabold text-2xl text-kidsInk">
              {score} / {items.length} correctas
            </p>
            <button onClick={retry} className={`mt-4 text-kidsInk/60 ${c.hoverText} font-playful text-sm font-semibold underline`}>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
