import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LEVELS } from '../../data/levels.js'
import { fetchTracks, fetchTemarios } from '../../lib/tracks.js'
import { fetchGroups } from '../../lib/groups.js'
import { fetchContent, saveContent, buildAdultosScopeKey, buildInfanciasScopeKey } from '../../lib/content.js'
import { uploadImage, deleteImage } from '../../lib/media.js'
import { parseCSVRows } from '../../lib/csv.js'

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}

const CONTENT_TYPES = [
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'quiz', label: 'Cuestionario' },
  { key: 'listening', label: 'Listening' },
  { key: 'reading_writing', label: 'Reading & Writing' },
  { key: 'fill_blank', label: 'Completar oraciones' },
  { key: 'synonyms_antonyms', label: 'Sinónimos y antónimos' },
  { key: 'pronunciation', label: 'Pronunciación' },
]

// Mapea el content_type interno al segmento de URL de la página pública
// (ver App.jsx: /adultos/:level/:theme/:temario/<segmento> e
// /infancias/:group/<segmento>).
const CONTENT_TYPE_PATHS = {
  flashcards: 'flashcards',
  quiz: 'cuestionario',
  listening: 'listening',
  reading_writing: 'reading-writing',
  fill_blank: 'completar',
  synonyms_antonyms: 'sinonimos-antonimos',
  pronunciation: 'pronunciacion',
}

// Tipos de contenido cuyo `data` es un array (se guarda [] cuando está
// vacío). Un temario/grupo puede tener más de un cuestionario — por eso
// `quiz` es un array de cuestionarios, cada uno con su propio título y
// preguntas, igual que Listening o Reading & Writing.
const ARRAY_CONTENT_TYPES = [
  'flashcards',
  'quiz',
  'listening',
  'reading_writing',
  'fill_blank',
  'synonyms_antonyms',
  'pronunciation',
]

const inputCls = 'w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm'
const smallBtn = 'text-sm font-medium'

// ─── Imagen opcional (reutilizado en todos los tipos de contenido) ────

function ImageField({ url, folder, onUpload, onRemove, label = 'Imagen (opcional)' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const newUrl = await uploadImage(file, folder)
      onUpload(newUrl)
    } catch (err) {
      setError(err.message || 'No pudimos subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">{label}</span>
      {url ? (
        <div className="flex items-center gap-3">
          <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-ink/15" />
          <button type="button" onClick={onRemove} className="text-stamp text-xs font-medium">
            Quitar imagen
          </button>
        </div>
      ) : (
        <div className="text-xs text-ink/50">
          <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} className="text-xs" />
          {uploading && <span className="ml-2">Subiendo…</span>}
        </div>
      )}
      {error && <p className="text-stamp text-xs mt-1">{error}</p>}
    </div>
  )
}

// ─── Flashcards ──────────────────────────────────────────────────────

// Separador entre palabra y traducción: guion/raya rodeado de espacios, o
// un tab. Evita cortar en medio de palabras con guion (ej: "well-known").
const BULK_PASTE_SEP = /\s+[-–—]\s+|\t/

function parseLinesFlashcards(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(BULK_PASTE_SEP)
      if (parts.length >= 2) {
        return { front: parts[0].trim(), back: parts.slice(1).join(' - ').trim(), image_url: null }
      }
      return { front: line, back: '', image_url: null }
    })
}

// CSV de 2 columnas sin encabezado (front, back) — el formato en el que
// NotebookLM y la mayoría de las planillas exportan pares pregunta/respuesta
// o término/definición. Si hay más de 2 columnas, el resto se pega al dorso.
function parseCsvFlashcards(text) {
  return parseCSVRows(text)
    .map((cols) => cols.map((c) => c.trim()))
    .filter((cols) => cols.some((c) => c.length > 0))
    .map((cols) => ({
      front: cols[0] || '',
      back: cols.length > 2 ? cols.slice(1).join(' — ') : cols[1] || '',
      image_url: null,
    }))
}

function FlashcardsEditor({ data, onChange }) {
  const cards = data || []
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkFormat, setBulkFormat] = useState('lines') // lines | csv
  const [bulkText, setBulkText] = useState('')
  const [csvFileName, setCsvFileName] = useState('')
  const csvInputRef = useRef(null)

  const update = (i, field, value) => {
    const next = [...cards]
    next[i] = { ...next[i], [field]: value }
    onChange(next)
  }
  const addCard = () => onChange([...cards, { front: '', back: '', image_url: null }])
  const removeCard = (i) => {
    deleteImage(cards[i]?.image_url)
    onChange(cards.filter((_, idx) => idx !== i))
  }

  const openBulk = (format) => {
    setBulkFormat(format)
    setBulkText('')
    setCsvFileName('')
    setBulkMode(true)
  }
  const closeBulk = () => {
    setBulkMode(false)
    setBulkText('')
    setCsvFileName('')
  }

  const handleCsvFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setBulkFormat('csv')
      setBulkText(String(reader.result || ''))
      setCsvFileName(file.name)
      setBulkMode(true)
    }
    reader.readAsText(file)
  }

  const parsedPreview = bulkMode ? (bulkFormat === 'csv' ? parseCsvFlashcards(bulkText) : parseLinesFlashcards(bulkText)) : []
  const generateCards = () => {
    if (parsedPreview.length === 0) return
    onChange([...cards, ...parsedPreview])
    closeBulk()
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept=".csv,text/csv" ref={csvInputRef} onChange={handleCsvFile} className="hidden" />
      {bulkMode && (
        <div className="texture-card rounded-xl p-4 flex flex-col gap-2">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50">
            {bulkFormat === 'csv'
              ? `CSV importado${csvFileName ? ` (${csvFileName})` : ''} — 2 columnas sin encabezado: pregunta/término y respuesta/traducción. Revisá abajo y confirmá.`
              : 'Pegá una lista, una tarjeta por línea: "palabra - traducción"'}
          </span>
          <textarea
            rows={bulkFormat === 'csv' ? 8 : 6}
            autoFocus
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={bulkFormat === 'csv' ? undefined : 'house - casa\ndog - perro\nrun - correr'}
            className={`${inputCls} font-mono resize-y`}
          />
          {parsedPreview.length > 0 && (
            <div className="max-h-40 overflow-y-auto border-2 border-ink/10 rounded-lg p-2 flex flex-col gap-1 bg-paper">
              {parsedPreview.slice(0, 50).map((c, i) => (
                <p key={i} className="text-xs text-ink/70 truncate">
                  <span className="font-medium text-ink">{c.front || '(vacío)'}</span> → {c.back || '(vacío)'}
                </p>
              ))}
              {parsedPreview.length > 50 && (
                <p className="text-xs text-ink/40">…y {parsedPreview.length - 50} más</p>
              )}
            </div>
          )}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={generateCards}
              disabled={parsedPreview.length === 0}
              className="bg-ink text-cream font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brand transition-colors disabled:opacity-40"
            >
              Generar {parsedPreview.length > 0 ? `${parsedPreview.length} tarjeta${parsedPreview.length === 1 ? '' : 's'}` : 'tarjetas'}
            </button>
            <button type="button" onClick={closeBulk} className="text-ink/60 hover:text-ink text-sm font-medium underline">
              Cancelar
            </button>
          </div>
        </div>
      )}
      {cards.map((card, i) => (
        <div key={i} className="texture-card rounded-xl p-4 flex gap-3 items-start">
          <div className="flex-1 flex flex-col gap-2">
            <input
              value={card.front}
              onChange={(e) => update(i, 'front', e.target.value)}
              placeholder="Frente (inglés)"
              className={inputCls}
            />
            <input
              value={card.back}
              onChange={(e) => update(i, 'back', e.target.value)}
              placeholder="Dorso (traducción)"
              className={inputCls}
            />
            <ImageField
              url={card.image_url}
              folder="flashcards"
              onUpload={(url) => update(i, 'image_url', url)}
              onRemove={() => {
                deleteImage(card.image_url)
                update(i, 'image_url', null)
              }}
            />
          </div>
          <button onClick={() => removeCard(i)} className={`${smallBtn} text-stamp shrink-0`}>
            Borrar
          </button>
        </div>
      ))}
      <div className="flex gap-4 flex-wrap">
        <button onClick={addCard} className="text-brand hover:underline text-sm font-medium">
          + Agregar tarjeta
        </button>
        {!bulkMode && (
          <>
            <button onClick={() => openBulk('lines')} className="text-brand hover:underline text-sm font-medium">
              Pegar una lista
            </button>
            <button onClick={() => csvInputRef.current?.click()} className="text-brand hover:underline text-sm font-medium">
              Importar CSV
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Preguntas de opción múltiple (usado por Quiz y Listening) ────────
// `withHint` solo lo pasa QuizEditor — Listening comparte el mismo
// componente pero, por ahora, sin la opción de pista.

function OptionsQuestionEditor({ question, onChange, onRemove, withHint = false }) {
  const updateOption = (oi, value) => {
    const options = [...question.options]
    options[oi] = value
    onChange({ ...question, options })
  }
  const addOption = () => onChange({ ...question, options: [...question.options, ''] })
  const removeOption = (oi) => {
    const options = question.options.filter((_, idx) => idx !== oi)
    // `answer` es el índice de la opción correcta. Si se borra una opción
    // ANTES de la correcta, todos los índices de ahí en más se corren uno
    // hacia atrás — hay que correr `answer` con ellos, si no queda apuntando
    // a otra opción distinta (marcada como "correcta" sin que nadie lo haya
    // elegido así). Si se borra justo la opción correcta, no hay forma de
    // saber cuál debería serlo ahora, así que se resetea a la primera.
    let answer = question.answer
    if (oi === question.answer) answer = 0
    else if (oi < question.answer) answer -= 1
    if (answer >= options.length) answer = 0
    onChange({ ...question, options, answer })
  }

  return (
    <div className="border-2 border-ink/10 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        <input
          value={question.q}
          onChange={(e) => onChange({ ...question, q: e.target.value })}
          placeholder="Texto de la pregunta"
          className={`${inputCls} flex-1`}
        />
        <button onClick={onRemove} className={`${smallBtn} text-stamp shrink-0`}>
          Borrar pregunta
        </button>
      </div>
      <ImageField
        url={question.image_url}
        folder="content"
        onUpload={(url) => onChange({ ...question, image_url: url })}
        onRemove={() => {
          deleteImage(question.image_url)
          onChange({ ...question, image_url: null })
        }}
        label="Imagen de contexto (opcional)"
      />
      {withHint && (
        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Pista (opcional — dejala vacía si no querés que esta pregunta tenga)
          </span>
          <input
            value={question.hint || ''}
            onChange={(e) => onChange({ ...question, hint: e.target.value })}
            placeholder="ej: Pensá en qué momento pasa la acción"
            className={inputCls}
          />
        </label>
      )}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono uppercase tracking-wide text-ink/50">
          Opciones (marcá la correcta)
        </span>
        {question.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <input
              type="radio"
              name={`answer-${question.id}`}
              checked={question.answer === oi}
              onChange={() => onChange({ ...question, answer: oi })}
              className="accent-olive shrink-0"
            />
            <input
              value={opt}
              onChange={(e) => updateOption(oi, e.target.value)}
              className={`${inputCls} flex-1`}
              placeholder={`Opción ${oi + 1}`}
            />
            {question.options.length > 2 && (
              <button onClick={() => removeOption(oi)} className="text-stamp text-xs font-medium shrink-0">
                Quitar
              </button>
            )}
          </div>
        ))}
        <button onClick={addOption} className="text-brand hover:underline text-xs font-medium self-start">
          + Agregar opción
        </button>
      </div>
    </div>
  )
}

// ─── Quiz ───────────────────────────────────────────────────────────
// Un temario/grupo puede tener más de un cuestionario (por ejemplo, uno
// por unidad dentro del mismo temario) — cada uno con su propio título y
// preguntas, igual que Listening o Reading & Writing.

function QuizEditor({ data, onChange }) {
  const quizzes = data || []
  const updateQuiz = (qi, patch) => {
    const next = [...quizzes]
    next[qi] = { ...next[qi], ...patch }
    onChange(next)
  }
  const addQuiz = () => onChange([...quizzes, { id: genId(), title: '', questions: [] }])
  const removeQuiz = (qi) => onChange(quizzes.filter((_, idx) => idx !== qi))
  const updateQuestion = (qi, qqi, patch) => {
    const questions = [...quizzes[qi].questions]
    questions[qqi] = patch
    updateQuiz(qi, { questions })
  }
  const addQuestion = (qi) =>
    updateQuiz(qi, {
      questions: [
        ...quizzes[qi].questions,
        { id: genId(), q: '', options: ['', ''], answer: 0, image_url: null, hint: '' },
      ],
    })
  const removeQuestion = (qi, qqi) => updateQuiz(qi, { questions: quizzes[qi].questions.filter((_, idx) => idx !== qqi) })

  return (
    <div className="flex flex-col gap-6">
      {quizzes.map((quiz, qi) => (
        <div key={quiz.id} className="texture-card rounded-xl p-5 flex flex-col gap-4">
          <div className="flex gap-3 items-start">
            <label className="flex-1">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Título del cuestionario</span>
              <input
                value={quiz.title}
                onChange={(e) => updateQuiz(qi, { title: e.target.value })}
                placeholder="ej: Cuestionario — Foundations"
                className={inputCls}
              />
            </label>
            <button onClick={() => removeQuiz(qi)} className={`${smallBtn} text-stamp shrink-0 mt-6`}>
              Borrar cuestionario
            </button>
          </div>
          {quiz.questions.map((q, qqi) => (
            <OptionsQuestionEditor
              key={q.id}
              question={q}
              onChange={(patch) => updateQuestion(qi, qqi, patch)}
              onRemove={() => removeQuestion(qi, qqi)}
              withHint
            />
          ))}
          <button onClick={() => addQuestion(qi)} className="text-brand hover:underline text-sm font-medium self-start">
            + Agregar pregunta
          </button>
          {quiz.questions.length === 0 && (
            <p className="text-ink/50 text-xs">Sin preguntas, este cuestionario no aparece en el sitio.</p>
          )}
        </div>
      ))}
      <button onClick={addQuiz} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar cuestionario
      </button>
      {quizzes.length === 0 && <p className="text-ink/50 text-xs">Sin cuestionarios todavía.</p>}
    </div>
  )
}

// ─── Listening ──────────────────────────────────────────────────────

function ListeningEditor({ data, onChange }) {
  const items = data || []
  const updateItem = (i, patch) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  const addItem = () =>
    onChange([...items, { id: genId(), title: '', youtubeId: '', transcript: '', image_url: null, questions: [] }])
  const removeItem = (i) => {
    deleteImage(items[i]?.image_url)
    onChange(items.filter((_, idx) => idx !== i))
  }
  const updateQuestion = (i, qi, patch) => {
    const questions = [...items[i].questions]
    questions[qi] = patch
    updateItem(i, { questions })
  }
  const addQuestion = (i) =>
    updateItem(i, {
      questions: [...items[i].questions, { id: genId(), q: '', options: ['', ''], answer: 0, image_url: null }],
    })
  const removeQuestion = (i, qi) => updateItem(i, { questions: items[i].questions.filter((_, idx) => idx !== qi) })

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, i) => (
        <div key={item.id} className="texture-card rounded-xl p-5 flex flex-col gap-3">
          <div className="flex gap-3 items-start">
            <input
              value={item.title}
              onChange={(e) => updateItem(i, { title: e.target.value })}
              placeholder="Título"
              className={`${inputCls} flex-1`}
            />
            <button onClick={() => removeItem(i)} className={`${smallBtn} text-stamp shrink-0`}>
              Borrar video
            </button>
          </div>
          <label>
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
              ID de YouTube (lo que va después de "v=" en la URL)
            </span>
            <input
              value={item.youtubeId}
              onChange={(e) => updateItem(i, { youtubeId: e.target.value })}
              placeholder="ej: dQw4w9WgXcQ"
              className={inputCls}
            />
          </label>
          <label>
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Transcripción</span>
            <textarea
              rows={4}
              value={item.transcript}
              onChange={(e) => updateItem(i, { transcript: e.target.value })}
              className={`${inputCls} resize-y`}
            />
          </label>
          <ImageField
            url={item.image_url}
            folder="content"
            onUpload={(url) => updateItem(i, { image_url: url })}
            onRemove={() => {
              deleteImage(item.image_url)
              updateItem(i, { image_url: null })
            }}
            label="Imagen de contexto (opcional, además del video)"
          />
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-wide text-ink/50">Preguntas</span>
            {item.questions.map((q, qi) => (
              <OptionsQuestionEditor
                key={q.id}
                question={q}
                onChange={(patch) => updateQuestion(i, qi, patch)}
                onRemove={() => removeQuestion(i, qi)}
              />
            ))}
            <button onClick={() => addQuestion(i)} className="text-brand hover:underline text-xs font-medium self-start">
              + Agregar pregunta
            </button>
          </div>
        </div>
      ))}
      <button onClick={addItem} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar video
      </button>
    </div>
  )
}

// ─── Reading & Writing ──────────────────────────────────────────────

function ReadingWritingEditor({ data, onChange }) {
  const items = data || []
  const updateItem = (i, patch) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  const addReading = () =>
    onChange([...items, { id: genId(), type: 'reading', title: '', text: '', image_url: null, questions: [] }])
  const addWriting = () => onChange([...items, { id: genId(), type: 'writing', title: '', prompt: '', image_url: null }])
  const removeItem = (i) => {
    deleteImage(items[i]?.image_url)
    onChange(items.filter((_, idx) => idx !== i))
  }
  const updateQuestion = (i, qi, value) => {
    const questions = [...items[i].questions]
    questions[qi] = { ...questions[qi], q: value }
    updateItem(i, { questions })
  }
  const addQuestion = (i) => updateItem(i, { questions: [...items[i].questions, { id: genId(), q: '' }] })
  const removeQuestion = (i, qi) => updateItem(i, { questions: items[i].questions.filter((_, idx) => idx !== qi) })

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, i) => (
        <div key={item.id} className="texture-card rounded-xl p-5 flex flex-col gap-3">
          <div className="flex gap-3 items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {item.type === 'reading' ? 'Reading' : 'Writing'}
            </span>
            <button onClick={() => removeItem(i)} className={`${smallBtn} text-stamp shrink-0`}>
              Borrar
            </button>
          </div>
          <input
            value={item.title}
            onChange={(e) => updateItem(i, { title: e.target.value })}
            placeholder="Título"
            className={inputCls}
          />
          <ImageField
            url={item.image_url}
            folder="content"
            onUpload={(url) => updateItem(i, { image_url: url })}
            onRemove={() => {
              deleteImage(item.image_url)
              updateItem(i, { image_url: null })
            }}
            label="Imagen de contexto (opcional)"
          />
          {item.type === 'reading' ? (
            <>
              <label>
                <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Texto de lectura</span>
                <textarea
                  rows={6}
                  value={item.text}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  className={`${inputCls} resize-y`}
                />
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-wide text-ink/50">
                  Preguntas (el alumno responde en texto libre, sin corrección automática)
                </span>
                {item.questions.map((q, qi) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <input
                      value={q.q}
                      onChange={(e) => updateQuestion(i, qi, e.target.value)}
                      className={`${inputCls} flex-1`}
                      placeholder={`Pregunta ${qi + 1}`}
                    />
                    <button onClick={() => removeQuestion(i, qi)} className="text-stamp text-xs font-medium shrink-0">
                      Quitar
                    </button>
                  </div>
                ))}
                <button onClick={() => addQuestion(i)} className="text-brand hover:underline text-xs font-medium self-start">
                  + Agregar pregunta
                </button>
              </div>
            </>
          ) : (
            <label>
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Consigna de escritura</span>
              <textarea
                rows={3}
                value={item.prompt}
                onChange={(e) => updateItem(i, { prompt: e.target.value })}
                className={`${inputCls} resize-y`}
              />
            </label>
          )}
        </div>
      ))}
      <div className="flex gap-4">
        <button onClick={addReading} className="text-brand hover:underline text-sm font-medium">
          + Agregar reading
        </button>
        <button onClick={addWriting} className="text-brand hover:underline text-sm font-medium">
          + Agregar writing
        </button>
      </div>
    </div>
  )
}

// ─── Completar oraciones ────────────────────────────────────────────
// Cada ítem es una oración con un espacio marcado con "___" (tres guiones
// bajos). Sin opciones, el alumno escribe la respuesta (se corrige solo,
// ignorando mayúsculas y tildes; se pueden separar varias respuestas
// válidas con "/"). Con opciones, el alumno elige entre palabras dadas.

function FillBlankItemEditor({ item, onChange, onRemove }) {
  const hasOptions = (item.options || []).length > 0

  const toggleOptions = () => {
    onChange(hasOptions ? { ...item, options: [] } : { ...item, options: ['', ''] })
  }
  const updateOption = (oi, value) => {
    const wasCorrect = item.answer === item.options[oi] && item.options[oi] !== ''
    const options = [...item.options]
    options[oi] = value
    onChange({ ...item, options, answer: wasCorrect ? value : item.answer })
  }
  const addOption = () => onChange({ ...item, options: [...item.options, ''] })
  const removeOption = (oi) => {
    // Si se borra justo la opción marcada como correcta, `answer` quedaría
    // apuntando a un texto que ya no existe entre las opciones — nadie
    // podría acertar nunca ese ítem. Se limpia para que el profe tenga que
    // volver a marcar cuál es la correcta.
    const wasCorrect = item.answer === item.options[oi]
    onChange({ ...item, options: item.options.filter((_, idx) => idx !== oi), answer: wasCorrect ? '' : item.answer })
  }

  return (
    <div className="texture-card rounded-xl p-5 flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        <label className="flex-1">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Oración (marcá el espacio con ___, tres guiones bajos)
          </span>
          <input
            value={item.sentence}
            onChange={(e) => onChange({ ...item, sentence: e.target.value })}
            placeholder="Every day, our team ___ (have) a standup."
            className={inputCls}
          />
        </label>
        <button onClick={onRemove} className={`${smallBtn} text-stamp shrink-0 mt-6`}>
          Borrar
        </button>
      </div>

      <ImageField
        url={item.image_url}
        folder="content"
        onUpload={(url) => onChange({ ...item, image_url: url })}
        onRemove={() => {
          deleteImage(item.image_url)
          onChange({ ...item, image_url: null })
        }}
        label="Imagen de contexto (opcional)"
      />

      <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-ink/50">
        <input type="checkbox" checked={hasOptions} onChange={toggleOptions} className="accent-brand" />
        Con opciones (multiple choice) en vez de texto libre
      </label>

      {hasOptions ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase tracking-wide text-ink/50">
            Opciones (marcá la correcta)
          </span>
          {item.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`fillblank-answer-${item.id}`}
                checked={opt !== '' && item.answer === opt}
                onChange={() => onChange({ ...item, answer: opt })}
                className="accent-olive shrink-0"
              />
              <input
                value={opt}
                onChange={(e) => updateOption(oi, e.target.value)}
                className={`${inputCls} flex-1`}
                placeholder={`Opción ${oi + 1}`}
              />
              {item.options.length > 2 && (
                <button onClick={() => removeOption(oi)} className="text-stamp text-xs font-medium shrink-0">
                  Quitar
                </button>
              )}
            </div>
          ))}
          <button onClick={addOption} className="text-brand hover:underline text-xs font-medium self-start">
            + Agregar opción
          </button>
        </div>
      ) : (
        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Respuesta correcta (si hay más de una válida, separalas con /)
          </span>
          <input
            value={item.answer}
            onChange={(e) => onChange({ ...item, answer: e.target.value })}
            placeholder="has / is having"
            className={inputCls}
          />
        </label>
      )}
    </div>
  )
}

function FillBlankEditor({ data, onChange }) {
  const items = data || []
  const updateItem = (i, patch) => {
    const next = [...items]
    next[i] = patch
    onChange(next)
  }
  const addItem = () => onChange([...items, { id: genId(), sentence: '', options: [], answer: '', image_url: null }])
  const removeItem = (i) => {
    deleteImage(items[i]?.image_url)
    onChange(items.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <FillBlankItemEditor key={item.id} item={item} onChange={(patch) => updateItem(i, patch)} onRemove={() => removeItem(i)} />
      ))}
      <button onClick={addItem} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar oración
      </button>
      {items.length === 0 && <p className="text-ink/50 text-xs">Sin oraciones todavía.</p>}
    </div>
  )
}

// ─── Sinónimos y antónimos ──────────────────────────────────────────
// Cada ítem es un par palabra ↔ coincidencia. En la página pública, el
// alumno arrastra (o toca) la coincidencia correcta hasta la palabra.

function SynonymsAntonymsEditor({ data, onChange }) {
  const items = data || []
  const updateItem = (i, patch) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  const addItem = () =>
    onChange([...items, { id: genId(), word: '', relation: 'synonym', match: '', image_url: null }])
  const removeItem = (i) => {
    deleteImage(items[i]?.image_url)
    onChange(items.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={item.id} className="texture-card rounded-xl p-4 flex flex-col gap-3">
          <div className="flex gap-3 items-start flex-wrap">
            <label className="flex-1 min-w-[160px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Palabra</span>
              <input
                value={item.word}
                onChange={(e) => updateItem(i, { word: e.target.value })}
                placeholder="ej: happy"
                className={inputCls}
              />
            </label>
            <label className="min-w-[140px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Relación</span>
              <select
                value={item.relation}
                onChange={(e) => updateItem(i, { relation: e.target.value })}
                className={inputCls}
              >
                <option value="synonym">Sinónimo</option>
                <option value="antonym">Antónimo</option>
              </select>
            </label>
            <label className="flex-1 min-w-[160px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
                {item.relation === 'antonym' ? 'Antónimo correcto' : 'Sinónimo correcto'}
              </span>
              <input
                value={item.match}
                onChange={(e) => updateItem(i, { match: e.target.value })}
                placeholder={item.relation === 'antonym' ? 'ej: sad' : 'ej: glad'}
                className={inputCls}
              />
            </label>
            <button onClick={() => removeItem(i)} className={`${smallBtn} text-stamp shrink-0 mt-6`}>
              Borrar
            </button>
          </div>
          <ImageField
            url={item.image_url}
            folder="content"
            onUpload={(url) => updateItem(i, { image_url: url })}
            onRemove={() => {
              deleteImage(item.image_url)
              updateItem(i, { image_url: null })
            }}
            label="Imagen de contexto (opcional)"
          />
        </div>
      ))}
      <button onClick={addItem} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar par
      </button>
      {items.length === 0 && <p className="text-ink/50 text-xs">Sin pares todavía.</p>}
    </div>
  )
}

// ─── Pronunciación ───────────────────────────────────────────────────
// Cada grupo son 2+ palabras que suenan parecido. La primera palabra queda
// fija arriba (es la que se muestra como consigna); el resto son las
// palabras que el alumno tiene que emparejar, tocándolas desde un banco
// compartido debajo. Cada grupo puede tener una pista opcional.

function PronunciationEditor({ data, onChange }) {
  const groups = data || []
  const updateGroup = (gi, patch) => {
    const next = [...groups]
    next[gi] = { ...next[gi], ...patch }
    onChange(next)
  }
  const addGroup = () => onChange([...groups, { id: genId(), words: ['', ''], hint: '' }])
  const removeGroup = (gi) => onChange(groups.filter((_, idx) => idx !== gi))
  const updateWord = (gi, wi, value) => {
    const words = [...groups[gi].words]
    words[wi] = value
    updateGroup(gi, { words })
  }
  const addWord = (gi) => updateGroup(gi, { words: [...groups[gi].words, ''] })
  const removeWord = (gi, wi) => updateGroup(gi, { words: groups[gi].words.filter((_, idx) => idx !== wi) })

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, gi) => (
        <div key={group.id} className="texture-card rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wide text-ink/50">
              Grupo {gi + 1} (palabras que suenan parecido)
            </span>
            <button onClick={() => removeGroup(gi)} className={`${smallBtn} text-stamp`}>
              Borrar grupo
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {group.words.map((w, wi) => (
              <div key={wi} className="flex items-center gap-2">
                <input
                  value={w}
                  onChange={(e) => updateWord(gi, wi, e.target.value)}
                  className={`${inputCls} flex-1`}
                  placeholder={wi === 0 ? 'Palabra fija (aparece arriba)' : `Palabra para emparejar ${wi}`}
                />
                {group.words.length > 2 && (
                  <button onClick={() => removeWord(gi, wi)} className="text-stamp text-xs font-medium shrink-0">
                    Quitar
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addWord(gi)} className="text-brand hover:underline text-xs font-medium self-start">
              + Agregar palabra
            </button>
          </div>
          <input
            value={group.hint || ''}
            onChange={(e) => updateGroup(gi, { hint: e.target.value })}
            className={`${inputCls} mt-1`}
            placeholder="Pista (opcional)"
          />
        </div>
      ))}
      <button onClick={addGroup} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar grupo
      </button>
      {groups.length === 0 && (
        <p className="text-ink/50 text-xs">
          Sin grupos todavía. Cada grupo son 2 o más palabras que suenan parecido (ej: ship / sheep). La primera
          palabra que cargues queda fija como consigna; el resto son las que el alumno tiene que emparejar.
        </p>
      )}
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────────

export default function AdminContentPage() {
  // Soporta llegar con la selección precargada por query string (ej: desde
  // el panel de "qué falta"), sin depender de nada más que estos valores
  // iniciales — el resto del componente sigue funcionando igual.
  const [searchParams] = useSearchParams()
  const [scope, setScope] = useState(searchParams.get('scope') === 'infancias' ? 'infancias' : 'adultos')

  // Adultos
  const [selectedLevelSlug, setSelectedLevelSlug] = useState(searchParams.get('level') || '')
  const [tracks, setTracks] = useState([])
  const [selectedTrackSlug, setSelectedTrackSlug] = useState(searchParams.get('track') || '')
  const [temarios, setTemarios] = useState([])
  const [selectedTemarioSlug, setSelectedTemarioSlug] = useState(searchParams.get('temario') || '')

  // Infancias
  const [groups, setGroups] = useState([])
  const [selectedGroupSlug, setSelectedGroupSlug] = useState(searchParams.get('group') || '')

  const [contentType, setContentType] = useState(
    CONTENT_TYPES.some((t) => t.key === searchParams.get('type')) ? searchParams.get('type') : 'flashcards'
  )
  const [contentData, setContentData] = useState(null)
  const [contentStatus, setContentStatus] = useState('idle') // idle | loading | error | ready
  // Recuerda para qué scopeKey es válido el contentData actual. Sin esto,
  // al cambiar de pestaña (ej: Flashcards → Cuestionario) React ya re-renderiza
  // con el contentType nuevo pero el contentData viejo (el efecto que lo
  // vuelve a cargar corre recién después) — y un editor intenta leer datos
  // con la forma de otro tipo de contenido, lo que rompe la página.
  const [loadedScopeKey, setLoadedScopeKey] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchTracks().then(setTracks).catch(() => {})
    fetchGroups().then(setGroups).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedTrackSlug) {
      setTemarios([])
      setSelectedTemarioSlug('')
      return
    }
    let active = true
    fetchTemarios(selectedTrackSlug).then((data) => {
      // Si el profe cambió de track de nuevo antes de que esta respuesta
      // llegue, descartarla — si no, `temarios`/`selectedTemarioSlug`
      // quedarían mostrando el track viejo mientras `selectedTrackSlug` ya
      // es el nuevo, generando un scope_key con una combinación track/temario
      // que no existe (mismo tipo de bug que el de las pestañas de contenido).
      if (!active) return
      setTemarios(data)
      setSelectedTemarioSlug((prev) => (data.some((t) => t.slug === prev) ? prev : data[0]?.slug || ''))
    })
    return () => {
      active = false
    }
  }, [selectedTrackSlug])

  const scopeKey =
    scope === 'adultos'
      ? selectedLevelSlug && selectedTrackSlug && selectedTemarioSlug
        ? buildAdultosScopeKey(selectedLevelSlug, selectedTrackSlug, selectedTemarioSlug, contentType)
        : null
      : selectedGroupSlug
      ? buildInfanciasScopeKey(selectedGroupSlug, contentType)
      : null

  useEffect(() => {
    if (!scopeKey) {
      setContentData(null)
      setContentStatus('idle')
      return
    }
    let active = true
    setContentStatus('loading')
    setSaveMessage('')
    fetchContent(scopeKey, contentType)
      .then((data) => {
        if (!active) return
        setContentData(data)
        setLoadedScopeKey(scopeKey)
        setContentStatus('ready')
      })
      .catch(() => {
        if (active) setContentStatus('error')
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey, contentType])

  const handleSave = async () => {
    if (!scopeKey) return
    setSaving(true)
    setSaveMessage('')

    const dataToSave = contentData

    try {
      await saveContent({
        scopeKey,
        scope,
        levelSlug: scope === 'adultos' ? selectedLevelSlug : null,
        trackSlug: scope === 'adultos' ? selectedTrackSlug : null,
        temarioSlug: scope === 'adultos' ? selectedTemarioSlug : null,
        groupSlug: scope === 'infancias' ? selectedGroupSlug : null,
        contentType,
        data:
          dataToSave ??
          (ARRAY_CONTENT_TYPES.includes(contentType) ? [] : null),
      })
      setSaveMessage('Guardado ✓')
    } catch (err) {
      setSaveMessage(err.message || 'No pudimos guardar.')
    } finally {
      setSaving(false)
    }
  }

  const editorReady = contentStatus === 'ready' && loadedScopeKey === scopeKey

  // Link a la página pública tal como la va a ver el alumno, para chequear
  // el resultado sin salir del panel.
  const publicUrl =
    scope === 'adultos'
      ? selectedLevelSlug && selectedTrackSlug && selectedTemarioSlug
        ? `/adultos/${selectedLevelSlug}/${selectedTrackSlug}/${selectedTemarioSlug}/${CONTENT_TYPE_PATHS[contentType]}`
        : null
      : selectedGroupSlug
      ? `/infancias/${selectedGroupSlug}/${CONTENT_TYPE_PATHS[contentType]}`
      : null

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/50 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Contenido</h1>
      <p className="text-ink/60 mb-8">
        Elegí primero dónde vive el contenido (track y temario, o grupo) y después qué actividad querés cargar.
      </p>

      <div className="texture-card rounded-2xl p-6 mb-8 flex flex-col gap-4">
        <div className="flex gap-2">
          {['adultos', 'infancias'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setScope(s)
                setSaveMessage('')
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                scope === s ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'
              }`}
            >
              {s === 'adultos' ? 'Adultos' : 'Infancias'}
            </button>
          ))}
        </div>

        {scope === 'adultos' ? (
          <div className="flex gap-4 flex-wrap">
            <label className="flex-1 min-w-[200px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Nivel</span>
              <select
                value={selectedLevelSlug}
                onChange={(e) => setSelectedLevelSlug(e.target.value)}
                className={inputCls}
              >
                <option value="">Elegí un nivel…</option>
                {LEVELS.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 min-w-[200px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Track</span>
              <select
                value={selectedTrackSlug}
                onChange={(e) => setSelectedTrackSlug(e.target.value)}
                className={inputCls}
              >
                <option value="">Elegí un track…</option>
                {tracks.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 min-w-[200px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Temario</span>
              <select
                value={selectedTemarioSlug}
                onChange={(e) => setSelectedTemarioSlug(e.target.value)}
                disabled={!selectedTrackSlug}
                className={`${inputCls} disabled:opacity-50`}
              >
                <option value="">Elegí un temario…</option>
                {temarios.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <label>
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Grupo</span>
            <select
              value={selectedGroupSlug}
              onChange={(e) => setSelectedGroupSlug(e.target.value)}
              className={inputCls}
            >
              <option value="">Elegí un grupo…</option>
              {groups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setContentType(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                contentType === t.key ? 'bg-brand text-cream border-brand' : 'border-ink/15 text-ink/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!scopeKey && <p className="text-ink/50 text-sm">Elegí dónde vive el contenido para empezar a editar.</p>}
      {scopeKey && contentStatus === 'loading' && <p className="text-ink/50 text-sm">Cargando…</p>}
      {scopeKey && contentStatus === 'error' && <p className="text-stamp text-sm">No pudimos cargar este contenido.</p>}

      {scopeKey && editorReady && (
        <div>
          {contentType === 'flashcards' && <FlashcardsEditor data={contentData} onChange={setContentData} />}
          {contentType === 'quiz' && <QuizEditor data={contentData} onChange={setContentData} />}
          {contentType === 'listening' && <ListeningEditor data={contentData} onChange={setContentData} />}
          {contentType === 'reading_writing' && <ReadingWritingEditor data={contentData} onChange={setContentData} />}
          {contentType === 'fill_blank' && <FillBlankEditor data={contentData} onChange={setContentData} />}
          {contentType === 'synonyms_antonyms' && <SynonymsAntonymsEditor data={contentData} onChange={setContentData} />}
          {contentType === 'pronunciation' && <PronunciationEditor data={contentData} onChange={setContentData} />}

          <div className="flex items-center gap-4 mt-8 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-ink text-cream font-semibold px-6 py-3 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar contenido'}
            </button>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline text-sm font-medium"
              >
                Ver como alumno ↗
              </a>
            )}
            {saveMessage && (
              <p className={`text-sm font-medium ${saveMessage === 'Guardado ✓' ? 'text-olive' : 'text-stamp'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
