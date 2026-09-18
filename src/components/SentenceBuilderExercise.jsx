import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { CheckCircle2, GripVertical, XCircle } from 'lucide-react'
import NameField from './NameField.jsx'
import CollapsibleExercise from './CollapsibleExercise.jsx'
import { recordSubmission, useStudentName } from '../lib/submissions.js'

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function Block({ id, text, selected, disabled, onClick, kids }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled })
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 } : undefined}
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      {...listeners}
      {...attributes}
      className={`${kids ? 'rounded-xl font-playful' : 'rounded-lg'} flex items-center gap-1.5 border-2 px-3 py-2 text-sm font-medium transition-colors touch-none
        ${selected ? (kids ? 'border-kidsPurpleDeep bg-kidsPurpleDeep text-white' : 'border-ink bg-ink text-cream') : (kids ? 'border-kidsInk/15 bg-kidsCream text-kidsInk' : 'border-ink/15 bg-paper text-ink')}
        ${isDragging ? 'opacity-50' : ''} ${disabled ? 'opacity-50' : 'cursor-grab'}`}
    >
      <GripVertical size={14} aria-hidden="true" />
      {text}
    </button>
  )
}

function Sentence({ sentence, c, kids, onResult }) {
  const [order, setOrder] = useState([])
  const [blockOrder] = useState(() => shuffle(sentence.blocks.map((_, index) => index)))
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor))
  const correct = order.every((index, position) => index === position)
  const blocks = sentence.blocks.map((text, index) => ({ id: `${sentence.id}-${index}`, text, index }))
  const available = order.map((index) => blocks[index])

  const place = (targetIndex, sourceId) => {
    const sourceIndex = Number(sourceId.split('-').pop())
    setOrder((current) => {
      const next = current.filter((index) => index !== sourceIndex)
      next.splice(targetIndex, 0, sourceIndex)
      return next
    })
    setSelected(null)
  }

  const handleDrop = ({ active, over }) => {
    if (!over || submitted) return
    place(Number(over.id.split('-').pop()), active.id)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDrop}>
      <div className={`${kids ? 'bg-white rounded-[22px] shadow-kids p-5' : 'texture-card rounded-2xl p-5'} ${c.border} mb-4`}>
        <p className={`${kids ? 'font-playful text-kidsInk/70' : 'font-mono text-ink/60'} text-xs mb-3`}>Construí la oración</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {sentence.blocks.map((_, position) => (
            (available[position] ? (
            <Slot
              key={`${sentence.id}-${position}`}
              id={`${sentence.id}-${position}`}
              block={available[position]}
              submitted={submitted}
              correct={correct}
              onClick={() => selected && place(position, selected)}
              kids={kids}
            />
            ) : (
              <Slot
                key={`${sentence.id}-${position}`}
                id={`${sentence.id}-${position}`}
                submitted={submitted}
                correct={false}
                onClick={() => selected && place(position, selected)}
                kids={kids}
              />
            ))
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {blockOrder.map((index) => blocks[index]).filter((block) => !order.includes(block.index)).map((block) => (
            <Block key={block.id} {...block} selected={selected === block.id} disabled={submitted} onClick={setSelected} kids={kids} />
          ))}
          {order.length === blocks.length && <p className={kids ? 'font-playful text-kidsInk/60 text-xs' : 'text-ink/60 text-xs'}>Todos los bloques están colocados.</p>}
        </div>
        {submitted && (correct ? <CheckCircle2 className="text-olive mt-3" size={18} /> : <XCircle className="text-stamp mt-3" size={18} />)}
        {!submitted && (
          <button type="button" onClick={() => { setSubmitted(true); onResult({ order: order.map((index) => blocks[index].text), correct }) }} className={`${kids ? 'bg-kidsInk rounded-full font-playful' : 'bg-ink rounded-lg'} mt-4 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40`} disabled={order.length !== blocks.length}>
            Comprobar
          </button>
        )}
      </div>
    </DndContext>
  )
}

function Slot({ id, block, submitted, correct, onClick, kids }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <button ref={setNodeRef} type="button" onClick={onClick} disabled={submitted} className={`${kids ? 'rounded-xl font-playful' : 'rounded-lg'} min-h-10 border-2 border-dashed px-3 py-2 text-sm font-medium ${isOver ? 'border-brand bg-brand/10' : 'border-ink/25'} ${submitted && (correct ? 'border-olive bg-olive/10' : 'border-stamp bg-stamp/10')}`}>
      {block?.text || 'Soltá un bloque acá'}
    </button>
  )
}

export default function SentenceBuilderExercise({ exercise, c, kids = false, scope, levelSlug, groupSlug, trackSlug, temarioSlug }) {
  const [studentName, setStudentName] = useStudentName()
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState({})
  if (!exercise.sentences?.length) return null
  return (
    <CollapsibleExercise title={exercise.title || 'Sentence Builder'} label="Actividad" className={`${c.card} mb-8`}>
      <div>
        {exercise.sentences.map((sentence) => <Sentence key={sentence.id} sentence={sentence} c={c} kids={kids} onResult={(result) => setResults((current) => ({ ...current, [sentence.id]: result }))} />)}
        {!submitted ? (
          <div className="mt-6">
            <NameField value={studentName} onChange={setStudentName} kids={kids} c={c} />
            <button
              type="button"
              disabled={!studentName.trim() || Object.keys(results).length !== exercise.sentences.length}
              onClick={() => {
                setSubmitted(true)
                recordSubmission({ scope, levelSlug, groupSlug, trackSlug, temarioSlug, contentType: 'sentence_builder', label: exercise.title, studentName, score: Object.values(results).filter((result) => result.correct).length, total: exercise.sentences.length, detail: exercise.sentences.map((sentence) => ({ id: sentence.id, given: results[sentence.id]?.order || [], correct: sentence.blocks, is_correct: results[sentence.id]?.correct || false })) })
              }}
              className={`${kids ? 'bg-kidsInk rounded-full font-playful' : 'bg-ink rounded-lg'} w-full py-3 font-semibold text-white disabled:opacity-40`}
            >
              Guardar respuestas
            </button>
          </div>
        ) : <p className={`${kids ? 'font-playful text-kidsInk' : 'text-ink'} mt-6 text-center font-semibold`}>¡Respuestas guardadas!</p>}
      </div>
    </CollapsibleExercise>
  )
}
