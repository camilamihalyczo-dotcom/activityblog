import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'

function shuffle(arr) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function buildChips(groups) {
  return groups.flatMap((g) => g.words.map((w, wi) => ({ id: `${g.id}-${wi}`, text: w, groupId: g.id })))
}

function isGroupContiguous(order, groupChipIds) {
  const positions = order.map((id, idx) => (groupChipIds.includes(id) ? idx : -1)).filter((idx) => idx !== -1)
  if (positions.length === 0) return false
  return Math.max(...positions) - Math.min(...positions) + 1 === groupChipIds.length
}

function SortableChip({ id, text, submitted, correct, onMoveLeft, onMoveRight, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: submitted })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 px-3 py-2 rounded-xl border-2 font-playful bg-kidsCream text-sm font-medium transition-colors
        ${isDragging ? 'opacity-50' : ''}
        ${submitted ? (correct ? 'border-kidsGreenDeep bg-kidsGreen/15' : 'border-kidsRed bg-kidsRed/10') : 'border-kidsInk/12'}
      `}
    >
      {!submitted && (
        <button onClick={onMoveLeft} disabled={isFirst} className="-m-1.5 p-1.5 text-kidsInk/30 hover:text-kidsInk disabled:opacity-20 disabled:hover:text-kidsInk/30" title="Mover a la izquierda">
          <ChevronLeft size={14} />
        </button>
      )}
      <button
        {...attributes}
        {...listeners}
        disabled={submitted}
        className="-m-1.5 p-1.5 text-kidsInk/30 cursor-grab touch-none disabled:cursor-default"
        title="Arrastrar"
      >
        <GripVertical size={14} />
      </button>
      <span>{text}</span>
      {!submitted && (
        <button onClick={onMoveRight} disabled={isLast} className="-m-1.5 p-1.5 text-kidsInk/30 hover:text-kidsInk disabled:opacity-20 disabled:hover:text-kidsInk/30" title="Mover a la derecha">
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

export default function InfanciasPronunciationPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [groups, setGroups] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [order, setOrder] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'pronunciation'), 'pronunciation')])
      .then(([groupData, groupsData]) => {
        if (!active) return
        setGroup(groupData)
        const loaded = groupsData || []
        setGroups(loaded)
        setOrder(shuffle(buildChips(loaded).map((c) => c.id)))
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

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-kidsCream">
        <KidsHeader crumbs={[group.name, 'Pronunciación']} backTo={`/infancias/${slug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <KidsEmptyState label="grupos de pronunciación" />
        </div>
      </div>
    )
  }

  const chips = buildChips(groups)
  const chipsById = Object.fromEntries(chips.map((c2) => [c2.id, c2]))
  const groupCorrectness = Object.fromEntries(
    groups.map((g) => [
      g.id,
      isGroupContiguous(
        order,
        chips.filter((c2) => c2.groupId === g.id).map((c2) => c2.id)
      ),
    ])
  )
  const score = groups.filter((g) => groupCorrectness[g.id]).length

  const moveChip = (from, to) => {
    if (to < 0 || to >= order.length) return
    setOrder((o) => arrayMove(o, from, to))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id)
    const newIndex = order.indexOf(over.id)
    setOrder((o) => arrayMove(o, oldIndex, newIndex))
  }

  const retry = () => {
    setOrder(shuffle(chips.map((c2) => c2.id)))
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Pronunciación']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Pronunciación 🔊
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Pronunciación</h1>
        <p className="font-playful text-kidsInk/65 mb-8">
          Reordená las palabras (arrastrando o con las flechitas) para dejar juntas las que suenan parecido.
        </p>

        <div className="bg-white rounded-[22px] shadow-kids p-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-2">
                {order.map((id, idx) => (
                  <SortableChip
                    key={id}
                    id={id}
                    text={chipsById[id].text}
                    submitted={submitted}
                    correct={groupCorrectness[chipsById[id].groupId]}
                    onMoveLeft={() => moveChip(idx, idx - 1)}
                    onMoveRight={() => moveChip(idx, idx + 1)}
                    isFirst={idx === 0}
                    isLast={idx === order.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            className={`mt-8 w-full bg-kidsInk text-white font-playful font-semibold py-3 rounded-full ${c.hoverBg} transition-colors`}
          >
            Corregir
          </button>
        ) : (
          <div className="mt-8 bg-white rounded-[22px] shadow-kids p-6 text-center">
            <p className="font-body font-extrabold text-2xl text-kidsInk">
              {score} / {groups.length} grupos bien agrupados
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
