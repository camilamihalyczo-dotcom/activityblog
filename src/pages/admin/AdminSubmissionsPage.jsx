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
}

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000

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
          {entry.score != null && entry.total != null && (
            <p className="text-ink/60 text-sm mt-0.5">
              {entry.score} / {entry.total} correctas
            </p>
          )}
        </div>
        <span className="shrink-0 text-ink/60">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-ink/10 pt-4">
          {(entry.detail || []).map((d, i) => (
            <div key={i} className="text-sm">
              {d.question || d.sentence || d.word ? (
                <>
                  <p className="text-ink/80">{d.question || d.sentence || d.word}</p>
                  <p className="text-ink/70 flex items-center gap-2 flex-wrap mt-0.5">
                    {d.is_correct ? (
                      <CheckCircle2 size={14} className="text-olive shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-stamp shrink-0" />
                    )}
                    <span>{d.given ?? <span className="italic text-ink/60">(sin responder)</span>}</span>
                    {!d.is_correct && (
                      <span className="font-mono text-xs text-ink/60">→ {d.correct}</span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  {d.prompt && <p className="text-ink/60 italic mb-1">{d.prompt}</p>}
                  <p className="text-ink/85 whitespace-pre-line bg-paper rounded-lg p-3">
                    {d.answer || <span className="italic text-ink/60">(sin responder)</span>}
                  </p>
                </>
              )}
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
    await supabase.from('submissions').delete().eq('id', id)
    loadEntries()
  }

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
            {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
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
