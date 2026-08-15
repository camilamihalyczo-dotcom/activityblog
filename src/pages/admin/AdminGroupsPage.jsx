import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGroups, saveGroup, deleteGroup } from '../../lib/groups.js'
import { GROUP_COLOR_OPTIONS, KIDS_GROUP_COLORS } from '../../lib/colorMaps.js'

const ALL_TOPICS = [
  { slug: 'flashcards', label: 'Flashcards' },
  { slug: 'cuestionario', label: 'Cuestionario' },
  { slug: 'listening', label: 'Listening' },
  { slug: 'reading-writing', label: 'Reading & Writing' },
]

const EMPTY_FORM = {
  id: null,
  slug: '',
  name: '',
  age_range: '',
  description: '',
  color_key: GROUP_COLOR_OPTIONS[0],
  milestone: 1,
  passcode: '',
  topics: [],
  sort_order: 0,
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadGroups = () => {
    setStatus('loading')
    fetchGroups()
      .then((data) => {
        setGroups(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(loadGroups, [])

  const startEdit = (group) => {
    setForm(group)
    setError('')
  }

  const startNew = () => {
    setForm(EMPTY_FORM)
    setError('')
  }

  const toggleTopic = (topicSlug) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topicSlug) ? f.topics.filter((t) => t !== topicSlug) : [...f.topics, topicSlug],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveGroup(form)
      setForm(EMPTY_FORM)
      loadGroups()
    } catch (err) {
      setError(err.code === '23505' ? 'Ya existe un grupo con ese slug — usá otro.' : err.message || 'No pudimos guardar el grupo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (group) => {
    if (!window.confirm(`¿Borrar el grupo "${group.name}"? No se puede deshacer.`)) return
    await deleteGroup(group.id)
    loadGroups()
  }

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/50 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Grupos (Infancias)</h1>
      <p className="text-ink/60 mb-8">
        Cada grupo tiene su rango de edad, color y clave propios, y elige qué actividades tiene disponibles.
      </p>

      <form onSubmit={handleSubmit} className="texture-card rounded-2xl p-6 mb-8 flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">{form.id ? 'Editar grupo' : 'Nuevo grupo'}</p>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
              Slug {form.id && '(no editable)'}
            </span>
            <input
              required
              disabled={!!form.id}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="ej: primeros-pasos"
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm disabled:opacity-50"
            />
          </label>
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Color</span>
            <select
              value={form.color_key}
              onChange={(e) => setForm({ ...form, color_key: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            >
              {GROUP_COLOR_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Nombre</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ej: Primeros Pasos"
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Rango de edad</span>
            <input
              required
              value={form.age_range}
              onChange={(e) => setForm({ ...form, age_range: e.target.value })}
              placeholder="ej: 4 a 6 años"
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
          <label className="w-40">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Nivel (1 a 4)</span>
            <input
              type="number"
              min={1}
              max={4}
              value={form.milestone}
              onChange={(e) => setForm({ ...form, milestone: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
        </div>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Descripción</span>
          <textarea
            required
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y"
          />
        </label>

        <div>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-2">Actividades disponibles</span>
          <div className="flex gap-4 flex-wrap">
            {ALL_TOPICS.map((topic) => (
              <label key={topic.slug} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.topics.includes(topic.slug)}
                  onChange={() => toggleTopic(topic.slug)}
                  className="accent-brand"
                />
                {topic.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Clave de acceso</span>
            <input
              required
              value={form.passcode}
              onChange={(e) => setForm({ ...form, passcode: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
          <label className="w-32">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Orden</span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
        </div>

        {error && <p className="text-stamp text-sm">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear grupo'}
          </button>
          {form.id && (
            <button type="button" onClick={startNew} className="text-ink/60 hover:text-ink text-sm font-medium underline">
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {status === 'loading' && <p className="text-ink/50 text-sm">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm">No pudimos cargar los grupos.</p>}

      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const c = KIDS_GROUP_COLORS[group.color_key]
          return (
            <div key={group.id} className={`texture-card rounded-xl p-4 flex items-center justify-between gap-4 ${c?.borderT8 || ''}`}>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                  {group.slug} · nivel {group.milestone} · {group.age_range}
                </p>
                <p className="font-display font-semibold text-ink truncate">{group.name}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => startEdit(group)} className="text-brand hover:underline text-sm font-medium">
                  Editar
                </button>
                <button onClick={() => handleDelete(group)} className="text-stamp hover:underline text-sm font-medium">
                  Borrar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
