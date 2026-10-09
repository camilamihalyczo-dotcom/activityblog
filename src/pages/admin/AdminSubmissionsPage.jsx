import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

const CONTENT_TYPE_LABELS = {
  fill_blank: 'Completar oraciones',
  quiz: 'Cuestionario',
  synonyms_antonyms: 'Sinónimos y antónimos',
  listening: 'Listening',
  reading_writing: 'Reading & Writing',
  pronunciation: 'Pronunciación',
  sentence_builder: 'Sentence Builder',
  voice_lab: 'Voice Lab',
}

// Tipos que ya no están como actividad pero pueden tener entregas viejas
// guardadas: se siguen mostrando bien, pero no aparecen en el filtro si no
// hay ninguna.
const LEGACY_TYPES = ['synonyms_antonyms']

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000

// Algunos ejercicios guardan la respuesta como texto y otros como lista de
// bloques (Sentence Builder) — esto lo deja siempre como texto legible.
function toText(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return value.filter((v) => v != null && v !== '').join(' ')
  return String(value)
}

const Unanswered = () => <span className="italic text-ink/60">(sin responder)</span>

function ResultIcon({ ok }) {
  return ok ? (
    <CheckCircle2 size={14} className="text-olive shrink-0" aria-label="Correcta" />
  ) : (
    <XCircle size={14} className="text-stamp shrink-0" aria-label="Incorrecta" />
  )
}

function FreeTextAnswer({ title, prompt, answer }) {
  return (
    <>
      {title && <p className="text-ink/80">{title}</p>}
      {prompt && <p className="text-ink/60 italic mb-1 whitespace-pre-line">{prompt}</p>}
      <p className="text-ink/85 whitespace-pre-line bg-paper rounded-lg p-3 mt-1">{toText(answer) || <Unanswered />}</p>
    </>
  )
}

function VoiceLabDetail({ d }) {
  const spoken = new Set(d.spoken_keywords || [])
  return (
    <>
      <p className="text-ink/80">{d.sentence}</p>
      <p className="text-ink/70 mt-1">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/60">Dijo: </span>
        {d.transcript ? `“${d.transcript}”` : <Unanswered />}
      </p>
      {(d.keywords || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {d.keywords.map((k) => (
            <span
              key={k}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                spoken.has(k) ? 'border-olive bg-olive/10 text-ink' : 'border-stamp/40 bg-stamp/5 text-ink/70'
              }`}
            >
              <ResultIcon ok={spoken.has(k)} />
              {k}
            </span>
          ))}
        </div>
      )}
    </>
  )
}

function DetailItem({ d, index, contentType }) {
  if (contentType === 'voice_lab' || d.transcript !== undefined) return <VoiceLabDetail d={d} />

  // Respuestas abiertas (Reading abierto, Writing): no tienen ✓/✗.
  if (d.manual_review || (d.answer !== undefined && d.is_correct === undefined)) {
    return <FreeTextAnswer title={d.question} prompt={d.prompt} answer={d.answer} />
  }

  // Ejercicios autocorregidos (cuestionario, listening, completar,
  // pronunciación, sentence builder, multiple choice de reading).
  const title =
    d.question || d.sentence || d.word || (contentType === 'sentence_builder' ? `Oración ${index + 1}` : null)
  const given = toText(d.given)
  const correct = toText(d.correct)
  return (
    <>
      {title && <p className="text-ink/80">{title}</p>}
      <p className="text-ink/70 flex items-center gap-2 flex-wrap mt-0.5">
        <ResultIcon ok={Boolean(d.is_correct)} />
        <span>{given || <Unanswered />}</span>
        {!d.is_correct && correct && <span className="font-mono text-xs text-ink/60">→ {correct}</span>}
      </p>
    </>
  )
}

function SubmissionRow({ entry, onDelete }) {
  const [open, setOpen] = useState(false)
  const where = entry.scope === 'adultos' ? `${entry.track_slug || '—'} · ${entry.temario_slug || '—'}` : entry.group_slug || '—'

  return (
    <div className="texture-card rounded-xl p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-start justify-between gap-4 text-left">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
            {entry.scope === 'adultos' ? 'Adultos' : 'Infancias'} · {where}
            {entry.label ? ` · ${entry.label}` : ''} · {new Date(entry.created_at).toLocaleDateString('es-AR')}
          </p>
          <p className="font-display font-semibold text-ink">
            {CONTENT_TYPE_LABELS[entry.content_type] || entry.content_type}
            {entry.student_name ? ` — ${entry.student_name}` : ' — (sin nombre)'}
          </p>
          {entry.score != null && entry.total != null ? (
            <p className="text-ink/60 text-sm mt-0.5">
              {entry.content_type === 'voice_lab'
                ? `${entry.score} / ${entry.total} palabras clave detectadas`
                : `${entry.score} / ${entry.total} correctas`}
            </p>
          ) : (
            <p className="text-ink/60 text-sm mt-0.5">Para revisar</p>
          )}
        </div>
        <span className="shrink-0 text-ink/60">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-ink/10 pt-4">
          {(entry.detail || []).length === 0 && <p className="text-ink/60 text-sm italic">Esta entrega no tiene detalle guardado.</p>}
          {(entry.detail || []).map((d, i) => (
            <div key={d.id || i} className="text-sm">
              <DetailItem d={d} index={i} contentType={entry.content_type} />
            </div>
          ))}
          <button onClick={() => onDelete(entry.id)} className="text-stamp hover:underline text-xs font-medium self-start mt-1">
            Borrar esta entrega
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminSubmissionsPage() {
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [scopeFilter, setScopeFilter] = useState('todos')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [studentFilter, setStudentFilter] = useState('todos')
  const [onlyRecent, setOnlyRecent] = useState(false)

  const loadEntries = () => {
    setStatus('loading')
    supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) {
          setStatus('error')
          return
        }
        setEntries(data)
        setStatus('ready')
      })
  }

  useEffect(loadEntries, [])

  const students = useMemo(() => {
    const set = new Set(entries.map((e) => e.student_name).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [entries])

  const filtered = useMemo(() => {
    const cutoff = Date.now() - FOUR_WEEKS_MS
    return entries.filter((e) => {
      if (scopeFilter !== 'todos' && e.scope !== scopeFilter) return false
      if (typeFilter !== 'todos' && e.content_type !== typeFilter) return false
      if (studentFilter !== 'todos' && e.student_name !== studentFilter) return false
      if (onlyRecent && new Date(e.created_at).getTime() < cutoff) return false
      return true
    })
  }, [entries, scopeFilter, typeFilter, studentFilter, onlyRecent])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar esta entrega? No se puede deshacer.')) return
    const { error } = await supabase.from('submissions').delete().eq('id', id)
    if (error) {
      window.alert(`No se pudo borrar: ${error.message}`)
      return
    }
    // Se saca de la lista local en vez de recargar todo (más rápido y no
    // pierde los filtros ni las entregas abiertas).
    setEntries((current) => current.filter((e) => e.id !== id))
  }

  const typeOptions = useMemo(() => {
    const present = new Set(entries.map((e) => e.content_type))
    return Object.entries(CONTENT_TYPE_LABELS).filter(([key]) => !LEGACY_TYPES.includes(key) || present.has(key))
  }, [entries])

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/60 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Respuestas de los alumnos</h1>
      <p className="text-ink/60 mb-8">
        Cada vez que alguien corrige un ejercicio o guarda un Reading/Writing, queda acá. Todavía no hay login de
        alumno — el nombre es lo que cada uno escribió (opcional), así que agrupá por nombre con cuidado.
      </p>

      <div className="flex gap-4 flex-wrap items-end mb-6">
        <label className="min-w-[140px]">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">Adultos/Infancias</span>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          >
            <option value="todos">Todos</option>
            <option value="adultos">Adultos</option>
            <option value="infancias">Infancias</option>
          </select>
        </label>
        <label className="min-w-[180px]">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">Tipo de ejercicio</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          >
            <option value="todos">Todos</option>
            {typeOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[180px]">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">Alumno</span>
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          >
            <option value="todos">Todos</option>
            {students.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70 pb-2.5">
          <input type="checkbox" checked={onlyRecent} onChange={(e) => setOnlyRecent(e.target.checked)} />
          Solo últimas 4 semanas
        </label>
      </div>

      {status === 'loading' && <p className="text-ink/60 text-sm">Cargando…</p>}
      {status === 'error' && (
        <p className="text-stamp text-sm">
          No pudimos cargar las respuestas. Si todavía no corriste{' '}
          <code className="font-mono text-xs">supabase/schema_phase7.sql</code> en el SQL Editor de Supabase, es por
          eso — corrélo y volvé a entrar acá.
        </p>
      )}
      {status === 'ready' && filtered.length === 0 && (
        <p className="text-ink/60 text-sm">Todavía no hay respuestas guardadas para este filtro.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((entry) => (
          <SubmissionRow key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
