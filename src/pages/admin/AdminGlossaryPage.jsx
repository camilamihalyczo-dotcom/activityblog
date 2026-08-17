import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS } from '../../data/levels.js'
import { fetchTracks } from '../../lib/tracks.js'
import { fetchGroups } from '../../lib/groups.js'
import { fetchGlossaryEntries, saveGlossaryEntry, deleteGlossaryEntry } from '../../lib/glossary.js'

const EMPTY_FORM = { id: null, word: '', translation: '', example: '' }

export default function AdminGlossaryPage() {
  const [scope, setScope] = useState('adultos')

  // Adultos
  const [selectedLevelSlug, setSelectedLevelSlug] = useState(LEVELS[0]?.slug || '')
  const [tracks, setTracks] = useState([])
  const [selectedTrackSlug, setSelectedTrackSlug] = useState('')

  // Infancias
  const [groups, setGroups] = useState([])
  const [selectedGroupSlug, setSelectedGroupSlug] = useState('')

  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTracks()
      .then((data) => {
        setTracks(data)
        setSelectedTrackSlug((prev) => prev || data[0]?.slug || '')
      })
      .catch(() => {})
    fetchGroups()
      .then((data) => {
        setGroups(data)
        setSelectedGroupSlug((prev) => prev || data[0]?.slug || '')
      })
      .catch(() => {})
  }, [])

  const loadEntries = () => {
    setStatus('loading')
    fetchGlossaryEntries()
      .then((data) => {
        setEntries(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(loadEntries, [])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (e.scope !== scope) return false
      if (scope === 'adultos') return e.level_slug === selectedLevelSlug && e.track_slug === selectedTrackSlug
      return e.group_slug === selectedGroupSlug
    })
  }, [entries, scope, selectedLevelSlug, selectedTrackSlug, selectedGroupSlug])

  const startEdit = (entry) => {
    setForm(entry)
    setError('')
  }

  const startNew = () => {
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveGlossaryEntry({
        id: form.id,
        scope,
        level_slug: selectedLevelSlug,
        track_slug: selectedTrackSlug,
        group_slug: selectedGroupSlug,
        word: form.word,
        translation: form.translation,
        example: form.example,
      })
      setForm(EMPTY_FORM)
      loadEntries()
    } catch (err) {
      setError(err.message || 'No pudimos guardar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar esta palabra del glosario? No se puede deshacer.')) return
    await deleteGlossaryEntry(id)
    loadEntries()
  }

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/50 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Glosario</h1>
      <p className="text-ink/60 mb-8">
        El glosario que ven tus alumnos ya se arma solo con las palabras de las flashcards de cada track o grupo.
        Acá solo sumás palabras sueltas que todavía no tienen su flashcard.
      </p>

      <div className="texture-card rounded-2xl p-6 mb-8 flex flex-col gap-4">
        <div className="flex gap-2">
          {['adultos', 'infancias'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                scope === s ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'
              }`}
            >
              {s === 'adultos' ? 'Adultos' : 'Infancias'}
            </button>
          ))}
        </div>

        {scope === 'adultos' ? (
          <div className="flex gap-4 flex-wrap">
            <label className="flex-1 min-w-[160px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Nivel</span>
              <select
                value={selectedLevelSlug}
                onChange={(e) => setSelectedLevelSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.code} — {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 min-w-[160px]">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Track</span>
              <select
                value={selectedTrackSlug}
                onChange={(e) => setSelectedTrackSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
              >
                {tracks.map((t) => (
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
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            >
              {groups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <form onSubmit={handleSubmit} className="texture-card rounded-2xl p-6 mb-10 flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          {form.id ? 'Editar palabra' : 'Nueva palabra'}
        </p>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Palabra</span>
            <input
              required
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              placeholder="ej: to wrap up"
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Traducción</span>
            <input
              required
              value={form.translation}
              onChange={(e) => setForm({ ...form, translation: e.target.value })}
              placeholder="ej: terminar, concluir"
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
        </div>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Ejemplo (opcional)</span>
          <input
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
            placeholder="ej: Let's wrap up the meeting."
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        {error && <p className="text-stamp text-sm">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || (scope === 'adultos' ? !selectedTrackSlug : !selectedGroupSlug)}
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

      {status === 'loading' && <p className="text-ink/50 text-sm">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm">No pudimos cargar el glosario.</p>}
      {status === 'ready' && filtered.length === 0 && (
        <p className="text-ink/50 text-sm">Todavía no cargaste palabras sueltas para esta selección.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((entry) => (
          <div key={entry.id} className="texture-card rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display font-semibold text-ink">
                {entry.word} <span className="text-ink/40 font-normal">→</span> {entry.translation}
              </p>
              {entry.example && <p className="text-ink/50 text-sm mt-0.5 italic">{entry.example}</p>}
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
