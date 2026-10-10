import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SUGGESTION_CATEGORIES, deleteSuggestion, fetchSuggestions, updateSuggestionStatus } from '../../lib/suggestions.js'

const STATUS = {
  new: { label: 'Nueva', cls: 'bg-brand text-cream' },
  read: { label: 'Leída', cls: 'bg-ink/10 text-ink/70' },
  done: { label: 'Resuelta', cls: 'bg-olive/15 text-olive' },
}

const SCOPE_LABEL = { adultos: 'Adultos', infancias: 'Infancias', general: 'General' }

export default function AdminSuggestionsPage() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('pending') // pending | all | done
  const [category, setCategory] = useState('todas')

  useEffect(() => {
    fetchSuggestions()
      .then((d) => {
        setItems(d)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const setItemStatus = async (id, next) => {
    await updateSuggestionStatus(id, next)
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, status: next } : it)))
  }
  const remove = async (id) => {
    if (!window.confirm('¿Borrar esta sugerencia? No se puede deshacer.')) return
    await deleteSuggestion(id)
    setItems((cur) => cur.filter((it) => it.id !== id))
  }

  const visible = items.filter((it) => {
    if (filter === 'pending' && it.status === 'done') return false
    if (filter === 'done' && it.status !== 'done') return false
    if (category !== 'todas' && it.category !== category) return false
    return true
  })
  const newCount = items.filter((it) => it.status === 'new').length

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/60 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Sugerencias</h1>
      <p className="text-ink/60 mb-6">
        Lo que mandan desde el formulario del pie de página. {newCount > 0 && <strong className="text-ink">{newCount} sin leer.</strong>}
      </p>

      <div className="flex gap-2 flex-wrap items-center mb-5">
        {[
          ['pending', 'Pendientes'],
          ['done', 'Resueltas'],
          ['all', 'Todas'],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${filter === k ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'}`}
          >
            {label}
          </button>
        ))}
        <span className="w-px h-5 bg-ink/15 mx-1" aria-hidden="true" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-1.5 rounded-lg border-2 border-ink/15 bg-paper text-xs" aria-label="Filtrar por tipo">
          <option value="todas">Todos los tipos</option>
          {Object.entries(SUGGESTION_CATEGORIES).map(([k, c]) => (
            <option key={k} value={k}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p className="text-ink/60 text-sm">Cargando…</p>}
      {status === 'error' && (
        <p className="text-stamp text-sm">
          No pudimos cargar las sugerencias. Si todavía no corriste <code className="font-mono text-xs">supabase/schema_phase11_suggestions.sql</code> en Supabase, es por eso.
        </p>
      )}
      {status === 'ready' && visible.length === 0 && <p className="text-ink/60 text-sm">No hay sugerencias para este filtro.</p>}

      <div className="flex flex-col gap-3">
        {visible.map((it) => {
          const cat = SUGGESTION_CATEGORIES[it.category] || SUGGESTION_CATEGORIES.idea
          const st = STATUS[it.status] || STATUS.new
          return (
            <article key={it.id} className={`texture-card rounded-xl p-4 ${it.status === 'done' ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`font-mono text-[10px] uppercase tracking-widest rounded-full px-2 py-0.5 ${st.cls}`}>{st.label}</span>
                <span className="text-sm">
                  {cat.emoji} <span className="text-ink/70">{cat.label}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50 ml-auto">
                  {SCOPE_LABEL[it.scope] || '—'} · {new Date(it.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-ink whitespace-pre-line">{it.message}</p>
              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-3 text-xs text-ink/60">
                <span>{it.name || 'Anónimo'}</span>
                {it.contact && <span className="font-medium text-ink/80">{it.contact}</span>}
                {it.page && (
                  <a href={it.page} target="_blank" rel="noopener noreferrer" className="font-mono hover:underline">
                    {it.page} ↗
                  </a>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs font-medium">
                {it.status !== 'read' && it.status !== 'done' && (
                  <button onClick={() => setItemStatus(it.id, 'read')} className="text-brand hover:underline">Marcar como leída</button>
                )}
                {it.status !== 'done' ? (
                  <button onClick={() => setItemStatus(it.id, 'done')} className="text-olive hover:underline">Marcar como resuelta</button>
                ) : (
                  <button onClick={() => setItemStatus(it.id, 'read')} className="text-ink/60 hover:underline">Volver a pendiente</button>
                )}
                <button onClick={() => remove(it.id)} className="text-stamp hover:underline ml-auto">Borrar</button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
