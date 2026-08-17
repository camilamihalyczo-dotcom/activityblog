import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

const EMPTY_FORM = {
  id: null,
  student: '',
  category: '',
  note_date: new Date().toISOString().slice(0, 10),
  example: '',
  correction: '',
  notes: '',
}

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000

export default function AdminErrorLogPage() {
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [studentFilter, setStudentFilter] = useState('todos')
  const [onlyRecent, setOnlyRecent] = useState(false)

  const loadEntries = () => {
    setStatus('loading')
    supabase
      .from('error_notes')
      .select('*')
      .order('note_date', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) {
          setStatus('error')
          return
        }
        setEntries(data)
        setStatus('ready')
      })
  }

  useEffect(loadEntries, [])

  const students = useMemo(() => {
    const set = new Set(entries.map((e) => e.student))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [entries])

  const filtered = useMemo(() => {
    const cutoff = Date.now() - FOUR_WEEKS_MS
    return entries.filter((e) => {
      if (studentFilter !== 'todos' && e.student !== studentFilter) return false
      if (onlyRecent && new Date(e.note_date).getTime() < cutoff) return false
      return true
    })
  }, [entries, studentFilter, onlyRecent])

  const categoryCounts = useMemo(() => {
    const counts = new Map()
    for (const e of filtered) {
      counts.set(e.category, (counts.get(e.category) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [filtered])

  const startEdit = (entry) => {
    setForm(entry)
    setError('')
  }

  const startNew = () => {
    setForm({ ...EMPTY_FORM, student: studentFilter !== 'todos' ? studentFilter : '' })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      student: form.student.trim(),
      category: form.category.trim(),
      note_date: form.note_date,
      example: form.example.trim() || null,
      correction: form.correction.trim() || null,
      notes: form.notes.trim() || null,
    }

    const { error: saveError } = form.id
      ? await supabase.from('error_notes').update(payload).eq('id', form.id)
      : await supabase.from('error_notes').insert(payload)

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    setForm(EMPTY_FORM)
    loadEntries()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar esta nota? No se puede deshacer.')) return
    await supabase.from('error_notes').delete().eq('id', id)
    loadEntries()
  }

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/50 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Registro de errores</h1>
      <p className="text-ink/60 mb-8">
        Notas privadas tuyas — no las ve ningún alumno. Cargá cada error apenas lo notás; cada tanto revisá qué
        categoría se repite más para dedicarle un ejercicio puntual.
      </p>

      <form onSubmit={handleSubmit} className="texture-card rounded-2xl p-6 mb-10 flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          {form.id ? 'Editar nota' : 'Nueva nota'}
        </p>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
              Alumno / grupo
            </span>
            <input
              required
              list="error-log-students"
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              placeholder="ej: Juan (Developers B1)"
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
            <datalist id="error-log-students">
              {students.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Fecha</span>
            <input
              type="date"
              required
              value={form.note_date}
              onChange={(e) => setForm({ ...form, note_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
        </div>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Categoría (ej: Present Perfect, preposiciones, pronunciación /th/)
          </span>
          <input
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Ejemplo textual del error (opcional)
          </span>
          <input
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
            placeholder='ej: "I have went to the office yesterday"'
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Corrección (opcional)
          </span>
          <input
            value={form.correction}
            onChange={(e) => setForm({ ...form, correction: e.target.value })}
            placeholder='ej: "I went to the office yesterday"'
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Notas adicionales (opcional)
          </span>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y"
          />
        </label>

        {error && <p className="text-stamp text-sm">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Agregar'}
          </button>
          {form.id && (
            <button type="button" onClick={startNew} className="text-ink/60 hover:text-ink text-sm font-medium underline">
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="flex gap-4 flex-wrap items-end mb-6">
        <label className="min-w-[180px]">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Filtrar por alumno</span>
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

      {categoryCounts.length > 0 && (
        <div className="texture-card rounded-2xl p-6 mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-3">
            Categorías más repetidas {studentFilter !== 'todos' ? `— ${studentFilter}` : ''}
          </p>
          <div className="flex flex-col gap-2">
            {categoryCounts.map(({ category, count }) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-sm text-ink flex-1">{category}</span>
                <span className="font-mono text-xs text-ink/50">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'loading' && <p className="text-ink/50 text-sm">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm">No pudimos cargar las notas.</p>}
      {status === 'ready' && filtered.length === 0 && (
        <p className="text-ink/50 text-sm">Todavía no hay notas cargadas para este filtro.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((entry) => (
          <div key={entry.id} className="texture-card rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                {entry.student} · {entry.note_date}
              </p>
              <p className="font-display font-semibold text-ink">{entry.category}</p>
              {entry.example && (
                <p className="text-ink/70 text-sm mt-1">
                  <span className="text-stamp">✗</span> {entry.example}
                  {entry.correction && (
                    <>
                      {' '}
                      <span className="text-olive">✓</span> {entry.correction}
                    </>
                  )}
                </p>
              )}
              {entry.notes && <p className="text-ink/50 text-sm mt-1">{entry.notes}</p>}
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => startEdit(entry)} className="text-brand hover:underline text-sm font-medium">
                Editar
              </button>
              <button onClick={() => handleDelete(entry.id)} className="text-stamp hover:underline text-sm font-medium">
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
