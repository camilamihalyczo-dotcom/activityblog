import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deckPublicUrl, fetchDeck, saveDeck } from '../../lib/decks.js'
import { SLIDE_PRESETS, templateLabel } from '../../lib/deckTemplates.js'
import { BLOCK_TYPES, BRAND_FOOTER, STYLE_LABELS, blockLabel, colorsFor, genId, makeBlock, resolveColor } from '../../lib/deckThemes.js'
import { ScaledDeck } from '../../components/deck/DeckRenderer.jsx'
import { BlockEditor, inputCls } from '../../components/deck/BlockEditors.jsx'

const lab = 'block text-[11px] font-mono uppercase tracking-wide text-ink/60 mb-1'
const iconBtn = 'px-1.5 text-xs text-ink/60 hover:text-ink disabled:opacity-30'

const plain = (t) => String(t || '').replace(/\*/g, '')

function move(list, i, d) {
  const next = [...list]
  const j = i + d
  if (j < 0 || j >= next.length) return list
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

// Duplica una slide con ids nuevos (para que React y el editor no confundan
// los bloques de la copia con los del original).
const cloneSlide = (slide) => ({
  ...JSON.parse(JSON.stringify(slide)),
  id: genId(),
  blocks: (slide.blocks || []).map((b) => ({ ...JSON.parse(JSON.stringify(b)), id: genId() })),
})

export default function AdminDeckEditorPage() {
  const { id } = useParams()
  const [deck, setDeck] = useState(null)
  const [status, setStatus] = useState('loading')
  const [selected, setSelected] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const editorTopRef = useRef(null)

  useEffect(() => {
    let active = true
    fetchDeck(id)
      .then((d) => {
        if (!active) return
        if (!d) return setStatus('missing')
        setDeck({ ...d, data: { footer: "", slides: [], ...d.data } })
        setStatus('ready')
      })
      .catch(() => active && setStatus('error'))
    return () => {
      active = false
    }
  }, [id])

  const update = (patch) => {
    setDeck((d) => ({ ...d, ...patch }))
    setDirty(true)
    setMessage('')
  }
  const updateData = (patch) => update({ data: { ...deck.data, ...patch } })
  const slides = deck?.data.slides || []
  const setSlides = (next) => updateData({ slides: next })
  const slide = slides[selected]
  const updateSlide = (patch) => setSlides(slides.map((s, i) => (i === selected ? { ...s, ...patch } : s)))
  const setBlocks = (blocks) => updateSlide({ blocks })

  const handleSave = async () => {
    if (!deck) return
    setSaving(true)
    try {
      await saveDeck(deck)
      setDirty(false)
      setMessage('Guardado ✓')
    } catch (err) {
      setMessage(err.message || 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  // Ctrl+S y aviso al cerrar con cambios sin guardar.
  const saveRef = useRef(handleSave)
  saveRef.current = handleSave
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!dirty) return undefined
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  if (status === 'loading') return <p className="text-ink/60 text-sm">Cargando…</p>
  if (status === 'missing') return <p className="text-stamp text-sm">Esta clase no existe (¿se borró?). <Link to="/notas-profe/clases" className="underline">Volver</Link></p>
  if (status === 'error') return <p className="text-stamp text-sm">No pudimos cargar la clase.</p>

  const kids = deck.scope === 'infancias'
  const isGlossary = deck.kind === 'glossary'
  const unit = isGlossary ? 'página' : 'slide'
  const url = deckPublicUrl(deck.share_token)
  const selectSlide = (i) => {
    setSelected(i)
    setShowAll(false)
    editorTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const addSlide = (presetKey) => {
    const preset = SLIDE_PRESETS.find((p) => p.key === presetKey)
    if (!preset) return
    const next = [...slides]
    next.splice(selected + 1, 0, preset.make(kids))
    setSlides(next)
    setSelected(selected + 1)
  }
  const removeSlide = (i) => {
    if (!window.confirm(`¿Borrar la ${unit} ${i + 1}?`)) return
    setSlides(slides.filter((_, j) => j !== i))
    setSelected(Math.max(0, Math.min(selected, slides.length - 2)))
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copiá el link:', url)
    }
  }
  const mailto = `mailto:?subject=${encodeURIComponent(plain(deck.title) || 'Material de la clase')}&body=${encodeURIComponent(
    `¡Hola${deck.student ? ` ${deck.student.split(' ')[0]}` : ''}! Te dejo el material de la clase:\n${url}\n\nDesde ese link lo podés ver online o guardarlo en PDF.`
  )}`

  return (
    <div>
      <Link to="/notas-profe/clases" className="text-ink/60 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Clases y glosarios
      </Link>
      <div className="flex items-baseline gap-3 flex-wrap mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">{plain(deck.title) || 'Sin título'}</h1>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
          {templateLabel(deck.kind, deck.template)} · {STYLE_LABELS[deck.scope]}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-8 items-start">
        {/* ── Columna de edición ── */}
        <div className="flex flex-col gap-6 min-w-0">
          <section className="texture-card rounded-2xl p-5 flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/60">Datos generales</p>
            <label>
              <span className={lab}>Título</span>
              <input value={deck.title || ''} onChange={(e) => update({ title: e.target.value })} className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={lab}>Alumno/a o grupo</span>
                <input value={deck.student || ''} onChange={(e) => update({ student: e.target.value })} placeholder="Opcional" className={inputCls} />
              </label>
              <label>
                <span className={lab}>Pie de página</span>
                <input
                  value={deck.data.footer || ''}
                  onChange={(e) => updateData({ footer: e.target.value })}
                  placeholder={`${BRAND_FOOTER[deck.scope]} // ${plain(deck.title)}`}
                  className={inputCls}
                />
              </label>
            </div>
            <div>
              <span className={lab}>Color</span>
              <div className="flex gap-2 flex-wrap">
                {colorsFor(deck.scope).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => update({ color_key: c.key })}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={deck.color_key === c.key}
                    className={`w-7 h-7 rounded-full border-4 ${deck.color_key === c.key ? 'border-ink' : 'border-transparent'}`}
                    style={{ background: c.light || c.accent }}
                  />
                ))}
                <span className="text-ink/60 text-xs self-center">{resolveColor(deck.scope, deck.color_key).label}</span>
              </div>
            </div>
          </section>

          <section className="texture-card rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
                {slides.length} {isGlossary ? 'páginas' : 'slides'}
              </p>
              <select value="" onChange={(e) => addSlide(e.target.value)} className="text-sm border-2 border-ink/15 rounded-lg px-2 py-1 bg-paper" aria-label={`Agregar ${unit}`}>
                <option value="">+ Agregar {unit}…</option>
                {SLIDE_PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
            <ol className="flex flex-col gap-1">
              {slides.map((s, i) => (
                <li key={s.id || i} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${i === selected ? 'bg-ink text-cream' : 'hover:bg-ink/5'}`}>
                  <button type="button" onClick={() => selectSlide(i)} className="flex-1 min-w-0 text-left flex items-baseline gap-2">
                    <span className={`font-mono text-[11px] ${i === selected ? 'text-cream/70' : 'text-ink/50'}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="truncate text-sm font-medium">{plain(s.title) || '(sin título)'}</span>
                    {s.layout === 'cover' && <span className="text-[10px] font-mono uppercase opacity-60">portada</span>}
                  </button>
                  <span className={`flex shrink-0 ${i === selected ? '[&>button]:text-cream/80' : ''}`}>
                    <button type="button" className={iconBtn} disabled={i === 0} onClick={() => { setSlides(move(slides, i, -1)); setSelected(i - 1) }} aria-label="Subir">↑</button>
                    <button type="button" className={iconBtn} disabled={i === slides.length - 1} onClick={() => { setSlides(move(slides, i, 1)); setSelected(i + 1) }} aria-label="Bajar">↓</button>
                    <button type="button" className={iconBtn} title="Duplicar" onClick={() => { const n = [...slides]; n.splice(i + 1, 0, cloneSlide(s)); setSlides(n); setSelected(i + 1) }} aria-label="Duplicar">⧉</button>
                    <button type="button" className={iconBtn} title="Borrar" disabled={slides.length <= 1} onClick={() => removeSlide(i)} aria-label="Borrar">✕</button>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {slide && (
            <section ref={editorTopRef} className="texture-card rounded-2xl p-5 flex flex-col gap-4 scroll-mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
                  Editando {unit} {selected + 1}
                </p>
                {!isGlossary && (
                  <label className="flex items-center gap-2 text-xs text-ink/70">
                    <input type="checkbox" checked={slide.layout === 'cover'} onChange={(e) => updateSlide({ layout: e.target.checked ? 'cover' : 'content' })} />
                    Portada
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className={lab}>Antetítulo</span>
                  <input value={slide.kicker || ''} onChange={(e) => updateSlide({ kicker: e.target.value })} placeholder="ej: Step 01 // Warm-up" className={inputCls} />
                </label>
                <label>
                  <span className={lab}>{slide.layout === 'cover' ? 'Etiquetas (separadas con coma)' : 'Etiqueta'}</span>
                  <input value={slide.tag || ''} onChange={(e) => updateSlide({ tag: e.target.value })} placeholder={slide.layout === 'cover' ? 'Focus: Modals, Sprint 3' : 'ej: Roadmap'} className={inputCls} />
                </label>
              </div>
              <label>
                <span className={lab}>Título</span>
                <input value={slide.title || ''} onChange={(e) => updateSlide({ title: e.target.value })} className={inputCls} />
                <span className="block text-ink/50 text-[11px] mt-1">Poné una palabra entre *asteriscos* para destacarla.</span>
              </label>
              {slide.layout === 'cover' && (
                <label>
                  <span className={lab}>Bajada</span>
                  <textarea rows={2} value={slide.subtitle || ''} onChange={(e) => updateSlide({ subtitle: e.target.value })} className={`${inputCls} resize-y`} />
                </label>
              )}

              <div className="flex flex-col gap-3">
                <p className={lab}>Contenido</p>
                {(slide.blocks || []).map((block, bi) => (
                  <div key={block.id} className="border-2 border-ink/10 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wide text-ink/70">{blockLabel(block.type)}</span>
                      <span className="flex">
                        <button type="button" className={iconBtn} disabled={bi === 0} onClick={() => setBlocks(move(slide.blocks, bi, -1))} aria-label="Subir bloque">↑</button>
                        <button type="button" className={iconBtn} disabled={bi === slide.blocks.length - 1} onClick={() => setBlocks(move(slide.blocks, bi, 1))} aria-label="Bajar bloque">↓</button>
                        <button type="button" className={`${iconBtn} text-stamp`} onClick={() => setBlocks(slide.blocks.filter((_, j) => j !== bi))} aria-label="Quitar bloque">✕</button>
                      </span>
                    </div>
                    <BlockEditor block={block} onChange={(next) => setBlocks(slide.blocks.map((b, j) => (j === bi ? next : b)))} />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  {BLOCK_TYPES.map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setBlocks([...(slide.blocks || []), makeBlock(t.type)])}
                      className="px-2.5 py-1 rounded-full border-2 border-ink/15 text-xs text-ink/80 hover:border-ink/40"
                    >
                      + {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── Vista previa ── */}
        <div className="lg:sticky lg:top-4 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
              Vista previa {showAll ? '· todas' : `· ${unit} ${selected + 1}`}
            </p>
            <button type="button" onClick={() => setShowAll((v) => !v)} className="text-brand hover:underline text-xs font-medium">
              {showAll ? `Ver solo la ${unit} actual` : 'Ver todas'}
            </button>
          </div>
          <div className={`rounded-lg overflow-auto border-2 border-ink/10 bg-[#E9E4D8] p-2 ${showAll ? 'max-h-[80vh]' : ''}`}>
            <ScaledDeck deck={deck} only={showAll ? null : selected} showOverflow />
          </div>
          <p className="text-ink/50 text-xs mt-2">Es exactamente lo que se ve en el link y lo que sale en el PDF (A4 {isGlossary ? 'vertical' : 'horizontal'}).</p>
        </div>
      </div>

      {/* Barra fija: guardar y compartir siempre a mano. */}
      <div className="sticky bottom-3 z-20 mt-8">
        <div className="texture-card rounded-xl shadow-lg border-2 border-ink/10 px-4 py-3 flex items-center gap-x-4 gap-y-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            title="También con Ctrl+S"
            className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          {dirty && !saving && <p className="text-sm font-medium text-gold">Cambios sin guardar</p>}
          {message && <p className={`text-sm font-medium ${message === 'Guardado ✓' ? 'text-olive' : 'text-stamp'}`}>{message}</p>}
          <div className="flex items-center gap-4 ml-auto text-sm font-medium flex-wrap">
            <a href={`/clase/${deck.share_token}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline" title={dirty ? 'Guardá primero para ver los últimos cambios' : ''}>
              Abrir link ↗
            </a>
            <button onClick={copyLink} className="text-brand hover:underline">{copied ? '¡Link copiado!' : 'Copiar link'}</button>
            <a href={mailto} className="text-brand hover:underline">Enviar por mail</a>
          </div>
        </div>
      </div>
    </div>
  )
}
