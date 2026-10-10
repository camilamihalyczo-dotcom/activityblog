import { useState } from 'react'
import { uploadImage, deleteImage } from '../../lib/media.js'
import { parseYouTubeId } from '../../lib/youtube.js'

// Editores de cada tipo de bloque del creador de presentaciones.
export const inputCls = 'w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm'
const lab = 'block text-[11px] font-mono uppercase tracking-wide text-ink/60 mb-1'
const tiny = 'text-xs font-medium'

function Field({ label, children, hint }) {
  return (
    <label className="block">
      {label && <span className={lab}>{label}</span>}
      {children}
      {hint && <span className="block text-ink/50 text-[11px] mt-1">{hint}</span>}
    </label>
  )
}

const FORMAT_HINT = '**negrita**, *destacado*, "- " al inicio de línea para viñetas.'

// Lista de ítems genérica (tarjetas, roadmap, vocabulario).
function ItemList({ items, onChange, make, render, addLabel, max = 12 }) {
  const list = items || []
  const set = (i, patch) => onChange(list.map((it, j) => (j === i ? { ...it, ...patch } : it)))
  const move = (i, d) => {
    const next = [...list]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-2">
      {list.map((it, i) => (
        <div key={i} className="border border-ink/10 rounded-lg p-3 bg-paper/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink/50">#{i + 1}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={`${tiny} text-ink/60 disabled:opacity-30`} aria-label="Subir">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className={`${tiny} text-ink/60 disabled:opacity-30`} aria-label="Bajar">↓</button>
              <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className={`${tiny} text-stamp`}>Quitar</button>
            </div>
          </div>
          {render(it, (patch) => set(i, patch))}
        </div>
      ))}
      {list.length < max && (
        <button type="button" onClick={() => onChange([...list, make()])} className="text-brand hover:underline text-xs font-medium self-start">
          {addLabel}
        </button>
      )}
    </div>
  )
}

function VocabBulk({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const parsed = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [word, phonetic, translation, definition, example] = l.split(/\s*\|\s*|\t/)
      return { word: word || '', phonetic: phonetic || '', translation: translation || '', definition: definition || '', example: example || '' }
    })
    .filter((w) => w.word)
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-brand hover:underline text-xs font-medium self-start">
        Pegar una lista de palabras
      </button>
    )
  return (
    <div className="border-2 border-ink/10 rounded-lg p-3 flex flex-col gap-2">
      <span className={lab}>Una palabra por línea: palabra | fonética | traducción | definición | ejemplo</span>
      <textarea
        rows={5}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'outage | AU-tij | caída del servicio | Período sin servicio. | A 40-minute outage.\nrollback | ROUL-bak | reversión'}
        className={`${inputCls} font-mono text-xs`}
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!parsed.length}
          onClick={() => {
            onAdd(parsed)
            setText('')
            setOpen(false)
          }}
          className="bg-ink text-cream text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
        >
          Agregar {parsed.length || ''} palabra{parsed.length === 1 ? '' : 's'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-ink/60 text-xs underline">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// Subir / cambiar / quitar una imagen (se guarda en Supabase Storage).
function ImagePicker({ url, onUrl, compact = false }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const next = await uploadImage(file, 'decks')
      if (url) deleteImage(url)
      onUrl(next)
    } catch (err) {
      setError(err.message || 'No se pudo subir.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex flex-col gap-2">
      {url && <img src={url} alt="" className={`${compact ? 'max-h-20' : 'max-h-28'} rounded-lg object-contain self-start border border-ink/10`} />}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-brand hover:underline text-xs font-medium cursor-pointer">
          {busy ? 'Subiendo…' : url ? 'Cambiar imagen' : 'Subir imagen'}
          <input type="file" accept="image/*" onChange={upload} className="hidden" disabled={busy} />
        </label>
        {url && (
          <button type="button" onClick={() => onUrl('')} className={`${tiny} text-stamp`}>
            Quitar
          </button>
        )}
      </div>
      {error && <p className="text-stamp text-xs">{error}</p>}
    </div>
  )
}

function ImageUpload({ block, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <ImagePicker url={block.url} onUrl={(url) => onChange({ url })} />
      <div className="grid grid-cols-3 gap-2">
        <Field label="Pie de imagen (opcional)">
          <input value={block.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} className={inputCls} />
        </Field>
        <span className="col-span-2" />
      </div>
      <div className="flex items-center gap-2">
        <span className={lab} style={{ marginBottom: 0 }}>Tamaño</span>
        {[
          ['s', 'Chica'],
          ['m', 'Mediana'],
          ['l', 'Grande'],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange({ size: k })}
            className={`px-2.5 py-1 rounded-full text-xs border-2 ${(block.size || 'm') === k ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChartRowsHint({ text }) {
  const rows = String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const bad = rows.filter((l) => !/\|\s*-?[\d.,]+/.test(l))
  if (!rows.length) return null
  return bad.length ? (
    <span className="text-stamp text-[11px]">⚠ {bad.length} fila(s) sin número después de "|": {bad.slice(0, 2).join(' · ')}</span>
  ) : (
    <span className="text-olive text-[11px]">✓ {rows.length} barras</span>
  )
}

export function BlockEditor({ block, onChange }) {
  const set = (patch) => onChange({ ...block, ...patch })
  switch (block.type) {
    case 'heading':
      return <input value={block.text || ''} onChange={(e) => set({ text: e.target.value })} placeholder="Section 1: …" className={inputCls} />
    case 'text':
      return (
        <Field hint={FORMAT_HINT}>
          <textarea rows={4} value={block.text || ''} onChange={(e) => set({ text: e.target.value })} className={`${inputCls} resize-y`} />
        </Field>
      )
    case 'callout':
      return (
        <div className="flex flex-col gap-2">
          <Field label="Etiqueta">
            <input value={block.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="Prompt / Scenario / Tip" className={inputCls} />
          </Field>
          <Field label="Texto" hint={FORMAT_HINT}>
            <textarea rows={3} value={block.text || ''} onChange={(e) => set({ text: e.target.value })} className={`${inputCls} resize-y`} />
          </Field>
        </div>
      )
    case 'cards':
      return (
        <ItemList
          items={block.items}
          onChange={(items) => set({ items })}
          make={() => ({ label: '', title: '', text: '' })}
          addLabel="+ Agregar tarjeta"
          max={8}
          render={(it, up) => (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input value={it.label || ''} onChange={(e) => up({ label: e.target.value })} placeholder="Etiqueta" className={inputCls} />
                <input value={it.title || ''} onChange={(e) => up({ title: e.target.value })} placeholder="Título" className={`${inputCls} col-span-2`} />
              </div>
              <textarea rows={2} value={it.text || ''} onChange={(e) => up({ text: e.target.value })} placeholder="Texto (admite viñetas con - )" className={`${inputCls} resize-y`} />
            </>
          )}
        />
      )
    case 'roadmap':
      return (
        <ItemList
          items={block.items}
          onChange={(items) => set({ items })}
          make={() => ({ title: '', text: '', tag: '' })}
          addLabel="+ Agregar paso"
          render={(it, up) => (
            <div className="grid grid-cols-3 gap-2">
              <input value={it.title || ''} onChange={(e) => up({ title: e.target.value })} placeholder="Título" className={`${inputCls} col-span-2`} />
              <input value={it.tag || ''} onChange={(e) => up({ tag: e.target.value })} placeholder="Etiqueta (ej: 10 min)" className={inputCls} />
              <input value={it.text || ''} onChange={(e) => up({ text: e.target.value })} placeholder="Descripción" className={`${inputCls} col-span-3`} />
            </div>
          )}
        />
      )
    case 'compare':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 border-l-4 border-stamp pl-3">
            <input value={block.wrongLabel || ''} onChange={(e) => set({ wrongLabel: e.target.value })} placeholder="Etiqueta ❌" className={inputCls} />
            <textarea rows={2} value={block.wrong || ''} onChange={(e) => set({ wrong: e.target.value })} placeholder="Frase incorrecta / literal" className={`${inputCls} resize-y`} />
            <textarea rows={2} value={block.wrongNote || ''} onChange={(e) => set({ wrongNote: e.target.value })} placeholder="Nota (opcional)" className={`${inputCls} resize-y`} />
          </div>
          <div className="flex flex-col gap-2 border-l-4 border-olive pl-3">
            <input value={block.rightLabel || ''} onChange={(e) => set({ rightLabel: e.target.value })} placeholder="Etiqueta ✅" className={inputCls} />
            <textarea rows={2} value={block.right || ''} onChange={(e) => set({ right: e.target.value })} placeholder="Frase correcta / profesional" className={`${inputCls} resize-y`} />
            <textarea rows={2} value={block.rightNote || ''} onChange={(e) => set({ rightNote: e.target.value })} placeholder="Nota (opcional)" className={`${inputCls} resize-y`} />
          </div>
        </div>
      )
    case 'vocab':
      return (
        <div className="flex flex-col gap-2">
          <ItemList
            items={block.items}
            onChange={(items) => set({ items })}
            make={() => ({ word: '', phonetic: '', translation: '', definition: '', example: '' })}
            addLabel="+ Agregar palabra"
            max={30}
            render={(it, up) => (
              <div className="grid grid-cols-3 gap-2">
                <input value={it.word || ''} onChange={(e) => up({ word: e.target.value })} placeholder="Palabra" className={inputCls} />
                <input value={it.phonetic || ''} onChange={(e) => up({ phonetic: e.target.value })} placeholder="Fonética (ej: AU-tij)" className={inputCls} />
                <input value={it.translation || ''} onChange={(e) => up({ translation: e.target.value })} placeholder="Traducción" className={inputCls} />
                <input value={it.definition || ''} onChange={(e) => up({ definition: e.target.value })} placeholder="Definición / nota" className={`${inputCls} col-span-3`} />
                <input value={it.example || ''} onChange={(e) => up({ example: e.target.value })} placeholder="Ejemplo" className={`${inputCls} col-span-3`} />
              </div>
            )}
          />
          <VocabBulk onAdd={(words) => set({ items: [...(block.items || []).filter((w) => w.word), ...words] })} />
        </div>
      )
    case 'table':
      return (
        <Field hint='Una fila por línea, columnas separadas con "|". La primera fila es el encabezado.'>
          <textarea rows={5} value={block.text || ''} onChange={(e) => set({ text: e.target.value })} className={`${inputCls} font-mono text-xs resize-y`} />
        </Field>
      )
    case 'image':
      return <ImageUpload block={block} onChange={set} />
    case 'video': {
      const id = parseYouTubeId(block.url)
      return (
        <div className="flex flex-col gap-2">
          <Field label="Link de YouTube">
            <input value={block.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" className={inputCls} />
          </Field>
          {block.url && (
            <span className={`text-xs ${id ? 'text-olive' : 'text-stamp'}`}>{id ? `✓ Video reconocido (${id}) — en el PDF sale la miniatura con el link` : '⚠ No reconozco ese link de YouTube'}</span>
          )}
          <Field label="Pie (opcional)">
            <input value={block.caption || ''} onChange={(e) => set({ caption: e.target.value })} className={inputCls} />
          </Field>
        </div>
      )
    }
    case 'errorRule': {
      const say = block.mode === 'saythis'
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            {[
              ['rule', 'Error vs. Rule'],
              ['saythis', "Say this, don't say that"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => set({ mode: k })}
                className={`px-2.5 py-1 rounded-full text-xs border-2 ${(block.mode || 'rule') === k ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <ItemList
            items={block.items}
            onChange={(items) => set({ items })}
            make={() => ({ rule: '', badge: say ? '' : 'Regla nativa', correct: '', error: '', note: '' })}
            addLabel={say ? '+ Agregar frase' : '+ Agregar regla'}
            max={6}
            render={(it, up) => (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={it.rule || ''}
                    onChange={(e) => up({ rule: e.target.value })}
                    placeholder={say ? 'Etiqueta (ej: Conector formal)' : 'Regla (ej: INSTEAD OF + [VERB-ING])'}
                    className={`${inputCls} ${say ? 'col-span-3' : 'col-span-2'}`}
                  />
                  {!say && <input value={it.badge || ''} onChange={(e) => up({ badge: e.target.value })} placeholder="Etiqueta" className={inputCls} />}
                </div>
                <input value={it.correct || ''} onChange={(e) => up({ correct: e.target.value })} placeholder="✅ Frase correcta (podés usar **negrita**)" className={inputCls} />
                <div className="grid grid-cols-3 gap-2">
                  <input value={it.error || ''} onChange={(e) => up({ error: e.target.value })} placeholder="❌ Error típico" className={`${inputCls} col-span-2`} />
                  <input value={it.note || ''} onChange={(e) => up({ note: e.target.value })} placeholder="Aclaración (opcional)" className={inputCls} />
                </div>
              </>
            )}
          />
        </div>
      )
    }
    case 'imageText':
      return (
        <div className="flex flex-col gap-2">
          <ImagePicker url={block.url} onUrl={(url) => set({ url })} />
          <div className="flex items-center gap-2">
            <span className={lab} style={{ marginBottom: 0 }}>Imagen a la</span>
            {[
              ['left', 'izquierda'],
              ['right', 'derecha'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => set({ side: k })}
                className={`px-2.5 py-1 rounded-full text-xs border-2 ${(block.side || 'left') === k ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <Field label="Texto" hint={FORMAT_HINT}>
            <textarea rows={4} value={block.text || ''} onChange={(e) => set({ text: e.target.value })} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Pie de imagen (opcional)">
            <input value={block.caption || ''} onChange={(e) => set({ caption: e.target.value })} className={inputCls} />
          </Field>
        </div>
      )
    case 'gallery':
      return (
        <ItemList
          items={block.items}
          onChange={(items) => set({ items })}
          make={() => ({ url: '', caption: '' })}
          addLabel="+ Agregar imagen"
          max={4}
          render={(it, up) => (
            <div className="grid grid-cols-2 gap-2 items-start">
              <ImagePicker url={it.url} onUrl={(url) => up({ url })} compact />
              <input value={it.caption || ''} onChange={(e) => up({ caption: e.target.value })} placeholder="Pie (ej: the word)" className={inputCls} />
            </div>
          )}
        />
      )
    case 'chart':
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            <Field label="Título del gráfico">
              <input value={block.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="ej: Where we use English at work" className={inputCls} />
            </Field>
            <span />
            <Field label="Unidad">
              <input value={block.unit || ''} onChange={(e) => set({ unit: e.target.value })} placeholder="%, min, hs…" className={inputCls} />
            </Field>
          </div>
          <Field label='Datos: una barra por línea, "nombre | número"'>
            <textarea rows={5} value={block.text || ''} onChange={(e) => set({ text: e.target.value })} className={`${inputCls} font-mono text-xs resize-y`} />
          </Field>
          <ChartRowsHint text={block.text} />
        </div>
      )
    case 'process':
      return (
        <ItemList
          items={block.items}
          onChange={(items) => set({ items })}
          make={() => ({ title: '', text: '' })}
          addLabel="+ Agregar paso"
          max={5}
          render={(it, up) => (
            <div className="grid grid-cols-3 gap-2">
              <input value={it.title || ''} onChange={(e) => up({ title: e.target.value })} placeholder="Paso" className={inputCls} />
              <input value={it.text || ''} onChange={(e) => up({ text: e.target.value })} placeholder="Descripción" className={`${inputCls} col-span-2`} />
            </div>
          )}
        />
      )
    default:
      return <p className="text-ink/60 text-xs">Tipo de bloque desconocido.</p>
  }
}
