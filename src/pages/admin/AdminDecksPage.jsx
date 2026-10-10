import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createDeck, deckPublicUrl, deleteDeck, duplicateDeck, fetchDecks } from '../../lib/decks.js'
import { CLASS_TEMPLATES, buildDeckData, templateLabel } from '../../lib/deckTemplates.js'
import { STYLE_LABELS, colorsFor, resolveColor } from '../../lib/deckThemes.js'
import { ScaledDeck } from '../../components/deck/DeckRenderer.jsx'

const inputCls = 'w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm'
const stepLabel = 'block text-xs font-mono uppercase tracking-wide text-ink/60 mb-2'

// Asistente de creación: plantilla → tramo (estilo) → color → datos.
function NewDeckWizard({ kind, onCancel, onCreated }) {
  const [template, setTemplate] = useState(kind === 'glossary' ? 'glossary' : 'standard')
  const [scope, setScope] = useState('adultos')
  const [colorKey, setColorKey] = useState(colorsFor('adultos')[0].key)
  const [title, setTitle] = useState('')
  const [student, setStudent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const changeScope = (next) => {
    setScope(next)
    setColorKey(colorsFor(next)[0].key)
  }

  // Vista previa en vivo de la portada con lo elegido.
  const preview = useMemo(
    () => ({ kind, scope, template, color_key: colorKey, title: title || 'Título de la clase', student, data: buildDeckData(kind, template, scope) }),
    [kind, scope, template, colorKey, title, student]
  )
  if (title) preview.data.slides[0] = { ...preview.data.slides[0], title }

  const create = async () => {
    setSaving(true)
    setError('')
    try {
      const data = buildDeckData(kind, template, scope)
      if (title) data.slides[0] = { ...data.slides[0], title }
      const id = await createDeck({ kind, scope, template, color_key: colorKey, title, student, data })
      onCreated(id)
    } catch (err) {
      setError(err.message || 'No se pudo crear.')
      setSaving(false)
    }
  }

  return (
    <div className="texture-card rounded-2xl p-6 mb-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-xl font-semibold text-ink">{kind === 'glossary' ? 'Nuevo glosario' : 'Nueva clase'}</p>
        <button onClick={onCancel} className="text-ink/60 hover:text-ink text-sm font-medium">
          Cancelar
        </button>
      </div>

      {kind === 'class' && (
        <div>
          <span className={stepLabel}>1 · Clase modelo</span>
          <div className="grid sm:grid-cols-2 gap-3">
            {CLASS_TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTemplate(t.key)}
                aria-pressed={template === t.key}
                className={`text-left rounded-xl border-2 p-4 transition-colors ${template === t.key ? 'border-ink bg-ink/5' : 'border-ink/15 hover:border-ink/40'}`}
              >
                <p className="font-display font-semibold text-ink">
                  <span className="font-mono text-xs text-ink/50 mr-2">{t.number}</span>
                  {t.label}
                </p>
                <p className="text-ink/60 text-xs mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <div>
            <span className={stepLabel}>{kind === 'class' ? '2' : '1'} · Tramo y estilo</span>
            <div className="flex gap-2 flex-wrap">
              {['adultos', 'infancias'].map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => changeScope(sc)}
                  aria-pressed={scope === sc}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${scope === sc ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'}`}
                >
                  {sc === 'adultos' ? 'Adultos' : 'Infancias'} · {STYLE_LABELS[sc]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={stepLabel}>{kind === 'class' ? '3' : '2'} · Color</span>
            <div className="flex gap-2 flex-wrap">
              {colorsFor(scope).map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColorKey(c.key)}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={colorKey === c.key}
                  className={`w-9 h-9 rounded-full border-4 transition-transform ${colorKey === c.key ? 'border-ink scale-110' : 'border-transparent'}`}
                  style={{ background: c.light || c.accent }}
                />
              ))}
            </div>
            <p className="text-ink/60 text-xs mt-2">{resolveColor(scope, colorKey).label}</p>
          </div>
          <label>
            <span className={stepLabel}>{kind === 'class' ? '4' : '3'} · Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === 'glossary' ? 'ej: Class 05: *Glossary*' : 'ej: Class 05: Professional *Emails* II'}
              className={inputCls}
            />
            <span className="block text-ink/50 text-xs mt-1">Poné una palabra entre *asteriscos* para destacarla.</span>
          </label>
          <label>
            <span className={stepLabel}>Alumno/a o grupo (opcional)</span>
            <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="ej: Bruno Olgiatti" className={inputCls} />
          </label>
          {error && <p className="text-stamp text-sm">{error}</p>}
          <button
            onClick={create}
            disabled={saving}
            className="bg-ink text-cream font-semibold px-6 py-3 rounded-lg hover:bg-brand transition-colors disabled:opacity-50 self-start"
          >
            {saving ? 'Creando…' : kind === 'glossary' ? 'Crear glosario' : 'Crear clase'}
          </button>
        </div>
        <div>
          <span className={stepLabel}>Vista previa</span>
          <div className="rounded-lg overflow-hidden border-2 border-ink/10">
            <ScaledDeck deck={preview} only={0} />
          </div>
          <p className="text-ink/50 text-xs mt-2">
            La plantilla trae {preview.data.slides.length} {kind === 'glossary' ? 'páginas' : 'slides'} con contenido de ejemplo para reemplazar.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDecksPage() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState([])
  const [status, setStatus] = useState('loading')
  const [wizard, setWizard] = useState(null) // null | 'class' | 'glossary'
  const [filter, setFilter] = useState('todos')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(null)

  const load = () => {
    setStatus('loading')
    fetchDecks()
      .then((d) => {
        setDecks(d)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }
  useEffect(load, [])

  const filtered = decks.filter((d) => {
    if (filter === 'class' || filter === 'glossary') {
      if (d.kind !== filter) return false
    } else if (filter !== 'todos' && d.scope !== filter) return false
    const q = query.trim().toLowerCase()
    return !q || `${d.title} ${d.student || ''}`.toLowerCase().includes(q)
  })

  const copyLink = async (d) => {
    try {
      await navigator.clipboard.writeText(deckPublicUrl(d.share_token))
      setCopied(d.id)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      window.prompt('Copiá el link:', deckPublicUrl(d.share_token))
    }
  }
  const handleDuplicate = async (d) => {
    const id = await duplicateDeck(d.id)
    navigate(`/notas-profe/clases/${id}`)
  }
  const handleDelete = async (d) => {
    if (!window.confirm(`¿Borrar "${d.title || 'Sin título'}"? El link deja de funcionar y no se puede deshacer.`)) return
    await deleteDeck(d.id)
    setDecks((cur) => cur.filter((x) => x.id !== d.id))
  }

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/60 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Clases y glosarios</h1>
      <p className="text-ink/60 mb-6">
        Elegí una clase modelo, el tramo y el color, y completá el contenido. Cada una tiene un link privado para mandar por
        mail, que se ve online y se guarda como PDF.
      </p>

      {wizard ? (
        <NewDeckWizard kind={wizard} onCancel={() => setWizard(null)} onCreated={(id) => navigate(`/notas-profe/clases/${id}`)} />
      ) : (
        <div className="flex gap-3 flex-wrap mb-8">
          <button onClick={() => setWizard('class')} className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors">
            + Nueva clase
          </button>
          <button onClick={() => setWizard('glossary')} className="border-2 border-ink text-ink font-semibold px-5 py-2.5 rounded-lg hover:bg-ink/5 transition-colors">
            + Nuevo glosario
          </button>
        </div>
      )}

      <div className="flex gap-3 flex-wrap items-center mb-4">
        {[
          ['todos', 'Todos'],
          ['adultos', 'Adultos'],
          ['infancias', 'Infancias'],
          ['class', 'Clases'],
          ['glossary', 'Glosarios'],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${filter === k ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'}`}
          >
            {label}
          </button>
        ))}
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título o alumno…" className={`${inputCls} max-w-xs ml-auto`} />
      </div>

      {status === 'loading' && <p className="text-ink/60 text-sm">Cargando…</p>}
      {status === 'error' && (
        <p className="text-stamp text-sm">
          No pudimos cargar las clases. Si todavía no corriste <code className="font-mono text-xs">supabase/schema_phase10_class_decks.sql</code> en Supabase, es por eso.
        </p>
      )}
      {status === 'ready' && filtered.length === 0 && <p className="text-ink/60 text-sm">Todavía no hay nada acá.</p>}

      <div className="flex flex-col gap-3">
        {filtered.map((d) => {
          const color = resolveColor(d.scope, d.color_key)
          return (
            <div key={d.id} className="texture-card rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <span className="w-3 self-stretch rounded-full shrink-0" style={{ background: color.light || color.accent }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                  {d.kind === 'glossary' ? 'Glosario' : templateLabel(d.kind, d.template)} · {d.scope === 'adultos' ? 'Adultos' : 'Infancias'} ·{' '}
                  {new Date(d.updated_at).toLocaleDateString('es-AR')}
                </p>
                <Link to={`/notas-profe/clases/${d.id}`} className="font-display font-semibold text-ink hover:underline">
                  {(d.title || 'Sin título').replace(/\*/g, '')}
                </Link>
                {d.student && <p className="text-ink/60 text-sm">{d.student}</p>}
              </div>
              <div className="flex items-center gap-3 text-sm font-medium flex-wrap">
                <Link to={`/notas-profe/clases/${d.id}`} className="text-brand hover:underline">Editar</Link>
                <a href={`/clase/${d.share_token}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Ver ↗</a>
                <button onClick={() => copyLink(d)} className="text-brand hover:underline">{copied === d.id ? '¡Copiado!' : 'Copiar link'}</button>
                <button onClick={() => handleDuplicate(d)} className="text-ink/70 hover:underline">Duplicar</button>
                <button onClick={() => handleDelete(d)} className="text-stamp hover:underline">Borrar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
