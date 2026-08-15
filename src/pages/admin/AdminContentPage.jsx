import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS } from '../../data/levels.js'
import { fetchTracks, fetchTemarios } from '../../lib/tracks.js'
import { fetchGroups } from '../../lib/groups.js'
import { fetchContent, saveContent, buildAdultosScopeKey, buildInfanciasScopeKey } from '../../lib/content.js'

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}

const CONTENT_TYPES = [
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'quiz', label: 'Cuestionario' },
  { key: 'listening', label: 'Listening' },
  { key: 'reading_writing', label: 'Reading & Writing' },
]

const inputCls = 'w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm'
const smallBtn = 'text-sm font-medium'

// ─── Flashcards ──────────────────────────────────────────────────────

function FlashcardsEditor({ data, onChange }) {
  const cards = data || []
  const update = (i, field, value) => {
    const next = [...cards]
    next[i] = { ...next[i], [field]: value }
    onChange(next)
  }
  const addCard = () => onChange([...cards, { front: '', back: '' }])
  const removeCard = (i) => onChange(cards.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-4">
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
          </div>
          <button onClick={() => removeCard(i)} className={`${smallBtn} text-stamp shrink-0`}>
            Borrar
          </button>
        </div>
      ))}
      <button onClick={addCard} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar tarjeta
      </button>
    </div>
  )
}

// ─── Preguntas de opción múltiple (usado por Quiz y Listening) ────────

function OptionsQuestionEditor({ question, onChange, onRemove }) {
  const updateOption = (oi, value) => {
    const options = [...question.options]
    options[oi] = value
    onChange({ ...question, options })
  }
  const addOption = () => onChange({ ...question, options: [...question.options, ''] })
  const removeOption = (oi) => {
    const options = question.options.filter((_, idx) => idx !== oi)
    const answer = question.answer >= options.length ? 0 : question.answer
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

function QuizEditor({ data, onChange }) {
  const quiz = data || { title: '', questions: [] }
  const setQuiz = (patch) => onChange({ ...quiz, ...patch })
  const updateQuestion = (qi, patch) => {
    const questions = [...quiz.questions]
    questions[qi] = patch
    setQuiz({ questions })
  }
  const addQuestion = () =>
    setQuiz({ questions: [...quiz.questions, { id: genId(), q: '', options: ['', ''], answer: 0 }] })
  const removeQuestion = (qi) => setQuiz({ questions: quiz.questions.filter((_, idx) => idx !== qi) })

  return (
    <div className="flex flex-col gap-4">
      <label>
        <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Título del cuestionario</span>
        <input
          value={quiz.title}
          onChange={(e) => setQuiz({ title: e.target.value })}
          placeholder="ej: Cuestionario — Foundations"
          className={inputCls}
        />
      </label>
      {quiz.questions.map((q, qi) => (
        <OptionsQuestionEditor
          key={q.id}
          question={q}
          onChange={(patch) => updateQuestion(qi, patch)}
          onRemove={() => removeQuestion(qi)}
        />
      ))}
      <button onClick={addQuestion} className="text-brand hover:underline text-sm font-medium self-start">
        + Agregar pregunta
      </button>
      {quiz.questions.length === 0 && (
        <p className="text-ink/50 text-xs">Sin preguntas, este cuestionario se guarda vacío (no aparece en el sitio).</p>
      )}
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
  const addItem = () => onChange([...items, { id: genId(), title: '', youtubeId: '', transcript: '', questions: [] }])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateQuestion = (i, qi, patch) => {
    const questions = [...items[i].questions]
    questions[qi] = patch
    updateItem(i, { questions })
  }
  const addQuestion = (i) =>
    updateItem(i, { questions: [...items[i].questions, { id: genId(), q: '', options: ['', ''], answer: 0 }] })
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
  const addReading = () => onChange([...items, { id: genId(), type: 'reading', title: '', text: '', questions: [] }])
  const addWriting = () => onChange([...items, { id: genId(), type: 'writing', title: '', prompt: '' }])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
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

// ─── Página principal ───────────────────────────────────────────────

export default function AdminContentPage() {
  const [scope, setScope] = useState('adultos') // adultos | infancias

  // Adultos
  const [selectedLevelSlug, setSelectedLevelSlug] = useState('')
  const [tracks, setTracks] = useState([])
  const [selectedTrackSlug, setSelectedTrackSlug] = useState('')
  const [temarios, setTemarios] = useState([])
  const [selectedTemarioSlug, setSelectedTemarioSlug] = useState('')

  // Infancias
  const [groups, setGroups] = useState([])
  const [selectedGroupSlug, setSelectedGroupSlug] = useState('')

  const [contentType, setContentType] = useState('flashcards')
  const [contentData, setContentData] = useState(null)
  const [contentStatus, setContentStatus] = useState('idle') // idle | loading | error | ready
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
    fetchTemarios(selectedTrackSlug).then((data) => {
      setTemarios(data)
      setSelectedTemarioSlug((prev) => (data.some((t) => t.slug === prev) ? prev : data[0]?.slug || ''))
    })
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

    // Un cuestionario sin preguntas se guarda como "sin cuestionario" para
    // que la página pública muestre el estado vacío en vez de un título
    // suelto sin nada debajo.
    let dataToSave = contentData
    if (contentType === 'quiz' && (!dataToSave || dataToSave.questions.length === 0)) {
      dataToSave = null
    }

    try {
      await saveContent({
        scopeKey,
        scope,
        levelSlug: scope === 'adultos' ? selectedLevelSlug : null,
        trackSlug: scope === 'adultos' ? selectedTrackSlug : null,
        temarioSlug: scope === 'adultos' ? selectedTemarioSlug : null,
        groupSlug: scope === 'infancias' ? selectedGroupSlug : null,
        contentType,
        data: dataToSave ?? (contentType === 'flashcards' || contentType === 'listening' || contentType === 'reading_writing' ? [] : null),
      })
      setSaveMessage('Guardado ✓')
    } catch (err) {
      setSaveMessage(err.message || 'No pudimos guardar.')
    } finally {
      setSaving(false)
    }
  }

  const editorReady = contentStatus === 'ready'

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

          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-ink text-cream font-semibold px-6 py-3 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar contenido'}
            </button>
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
