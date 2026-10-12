import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS } from '../../data/levels.js'
import { fetchTracks } from '../../lib/tracks.js'
import { fetchGroups } from '../../lib/groups.js'
import { addGlossaryEntries, fetchAdultosGlossary, fetchInfanciasGlossary, saveGlossaryEntry } from '../../lib/glossary.js'

// Manda las palabras de los bloques de Vocabulario de una clase/glosario al
// glosario del Activity Blog (tabla `glossary_entries`) del nivel+track o
// grupo que se elija. Igual que el import de CSV: no duplica palabras que
// ya están en ese módulo (sin importar mayúsculas); opcionalmente las
// actualiza.

const plain = (t) => String(t || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim()
const lab = 'block text-[11px] font-mono uppercase tracking-wide text-ink/60 mb-1'
const selectCls = 'w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm'
const targetKey = (deckId) => `deck-glossary-target:${deckId}`

function readTarget(deckId) {
  try {
    return JSON.parse(localStorage.getItem(targetKey(deckId)) || 'null')
  } catch {
    return null
  }
}
function writeTarget(deckId, target) {
  try {
    localStorage.setItem(targetKey(deckId), JSON.stringify(target))
  } catch {
    /* sin storage: no pasa nada, solo no se recuerda */
  }
}

// Junta todas las palabras de todos los bloques de vocabulario del deck.
export function collectVocab(deck) {
  const seen = new Set()
  const out = []
  for (const slide of deck?.data?.slides || []) {
    for (const block of slide.blocks || []) {
      if (block.type !== 'vocab') continue
      for (const item of block.items || []) {
        const word = plain(item.word)
        if (!word) continue
        const key = word.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        out.push({
          key,
          word,
          translation: plain(item.translation) || plain(item.definition),
          example: plain(item.example),
        })
      }
    }
  }
  return out
}

export default function SendToGlossaryPanel({ deck }) {
  const words = useMemo(() => collectVocab(deck), [deck])
  const saved = readTarget(deck.id)
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState(saved?.scope || deck.scope || 'adultos')
  const [levelSlug, setLevelSlug] = useState(saved?.level_slug || LEVELS[0]?.slug || '')
  const [trackSlug, setTrackSlug] = useState(saved?.track_slug || '')
  const [groupSlug, setGroupSlug] = useState(saved?.group_slug || '')
  const [tracks, setTracks] = useState([])
  const [groups, setGroups] = useState([])
  const [existing, setExisting] = useState(null) // Map palabra → entrada | null mientras carga
  const [loadError, setLoadError] = useState('')
  const [unchecked, setUnchecked] = useState(() => new Set())
  const [updateExisting, setUpdateExisting] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    fetchTracks()
      .then((data) => {
        setTracks(data)
        setTrackSlug((prev) => prev || data[0]?.slug || '')
      })
      .catch(() => {})
    fetchGroups()
      .then((data) => {
        setGroups(data)
        setGroupSlug((prev) => prev || data[0]?.slug || '')
      })
      .catch(() => {})
  }, [open])

  const ready = scope === 'adultos' ? Boolean(levelSlug && trackSlug) : Boolean(groupSlug)

  // Palabras que ya hay en el glosario del destino elegido.
  useEffect(() => {
    if (!open || !ready) return undefined
    let active = true
    setExisting(null)
    setLoadError('')
    const load = scope === 'adultos' ? fetchAdultosGlossary(levelSlug, trackSlug) : fetchInfanciasGlossary(groupSlug)
    load
      .then((rows) => active && setExisting(new Map(rows.map((r) => [r.word.trim().toLowerCase(), r]))))
      .catch(() => {
        if (!active) return
        setExisting(new Map())
        setLoadError('No pudimos leer el glosario de ese módulo; si mandás igual, podrían duplicarse palabras.')
      })
    return () => {
      active = false
    }
  }, [open, ready, scope, levelSlug, trackSlug, groupSlug, result])

  const rows = words.map((w) => {
    const prev = existing?.get(w.key)
    const missing = !w.translation
    const changed = prev && (plain(prev.translation) !== w.translation || plain(prev.example) !== w.example)
    return { ...w, prev, missing, changed }
  })
  const toAdd = rows.filter((r) => !r.prev && !r.missing && !unchecked.has(r.key))
  const toUpdate = updateExisting ? rows.filter((r) => r.prev && r.changed && !r.missing && !unchecked.has(r.key)) : []
  const destName =
    scope === 'adultos'
      ? `${LEVELS.find((l) => l.slug === levelSlug)?.code || ''} · ${tracks.find((t) => t.slug === trackSlug)?.name || ''}`
      : groups.find((g) => g.slug === groupSlug)?.name || ''

  const toggle = (key) =>
    setUnchecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const handleSend = async () => {
    setSending(true)
    setError('')
    setResult(null)
    const target = { scope, level_slug: levelSlug, track_slug: trackSlug, group_slug: groupSlug }
    try {
      await addGlossaryEntries(toAdd.map((r) => ({ ...target, word: r.word, translation: r.translation, example: r.example })))
      for (const r of toUpdate) {
        await saveGlossaryEntry({ ...target, id: r.prev.id, word: r.prev.word, translation: r.translation, example: r.example })
      }
      writeTarget(deck.id, target)
      const skipped = rows.filter((r) => r.prev).length - toUpdate.length
      setResult({ added: toAdd.length, updated: toUpdate.length, skipped, dest: destName })
    } catch (err) {
      setError(err.message || 'No se pudieron mandar las palabras.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="texture-card rounded-2xl p-5 flex flex-col gap-3" data-testid="send-to-glossary">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">Glosario del Activity Blog</p>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-brand hover:underline text-sm font-medium">
          {open ? 'Cerrar' : 'Mandar palabras'}
        </button>
      </div>
      {!open && (
        <p className="text-ink/60 text-sm">
          {words.length
            ? `Las ${words.length} palabras de los bloques de vocabulario se pueden sumar al glosario de un track o grupo.`
            : 'Cuando agregues bloques de Vocabulario, vas a poder sumar esas palabras al glosario de un track o grupo.'}
        </p>
      )}

      {open && (
        <>
          <div className="flex gap-2">
            {['adultos', 'infancias'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setScope(s)
                  setResult(null)
                }}
                className={`px-3 py-1 rounded-full border-2 text-xs font-medium ${scope === s ? 'border-ink bg-ink text-cream' : 'border-ink/15 text-ink/80'}`}
              >
                {s === 'adultos' ? 'Adultos' : 'Infancias'}
              </button>
            ))}
          </div>
          {scope === 'adultos' ? (
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={lab}>Nivel</span>
                <select value={levelSlug} onChange={(e) => (setLevelSlug(e.target.value), setResult(null))} className={selectCls}>
                  {LEVELS.map((l) => (
                    <option key={l.slug} value={l.slug}>
                      {l.code} — {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={lab}>Track</span>
                <select value={trackSlug} onChange={(e) => (setTrackSlug(e.target.value), setResult(null))} className={selectCls}>
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
              <span className={lab}>Grupo</span>
              <select value={groupSlug} onChange={(e) => (setGroupSlug(e.target.value), setResult(null))} className={selectCls}>
                {groups.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {words.length === 0 ? (
            <p className="text-ink/60 text-sm">Esta {deck.kind === 'glossary' ? 'lista' : 'clase'} no tiene palabras en bloques de Vocabulario todavía.</p>
          ) : existing === null ? (
            <p className="text-ink/60 text-sm">Revisando qué palabras ya están…</p>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-ink/10 border-2 border-ink/10 rounded-xl max-h-72 overflow-auto">
                {rows.map((r) => {
                  const disabled = r.missing || (r.prev && !(updateExisting && r.changed))
                  return (
                    <li key={r.key} className={`flex items-start gap-2 px-3 py-2 text-sm ${disabled ? 'text-ink/45' : ''}`}>
                      <input
                        type="checkbox"
                        className="mt-1"
                        disabled={disabled}
                        checked={!disabled && !unchecked.has(r.key)}
                        onChange={() => toggle(r.key)}
                        aria-label={r.word}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="font-semibold">{r.word}</span>
                        {r.translation && <span> — {r.translation}</span>}
                        {r.example && <span className="block text-xs text-ink/55 italic truncate">{r.example}</span>}
                      </span>
                      {r.missing ? (
                        <span className="text-[10px] font-mono uppercase text-stamp shrink-0">sin traducción</span>
                      ) : r.prev ? (
                        <span className="text-[10px] font-mono uppercase text-ink/50 shrink-0">{r.changed ? 'ya está (distinta)' : 'ya está'}</span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-olive shrink-0">nueva</span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {rows.some((r) => r.prev && r.changed) && (
                <label className="flex items-center gap-2 text-sm text-ink/80">
                  <input type="checkbox" checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />
                  Actualizar traducción y ejemplo de las que ya están con otra versión
                </label>
              )}
              {rows.some((r) => r.missing) && (
                <p className="text-ink/55 text-xs">Las palabras sin traducción (ni definición) no se pueden mandar: el glosario la pide.</p>
              )}
              {loadError && <p className="text-stamp text-xs">{loadError}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !ready || toAdd.length + toUpdate.length === 0}
                  className="bg-ink text-cream font-semibold px-4 py-2 rounded-lg hover:bg-brand transition-colors disabled:opacity-40"
                >
                  {sending
                    ? 'Mandando…'
                    : toAdd.length + toUpdate.length === 0
                      ? 'Nada nuevo para mandar'
                      : `Mandar ${toAdd.length + toUpdate.length} a ${destName}`}
                </button>
                <Link to="/notas-profe/glosario" className="text-brand hover:underline text-sm">Ver glosario</Link>
              </div>
            </>
          )}
          {result && (
            <p className="text-olive text-sm font-medium" role="status">
              Listo: {result.added} agregadas{result.updated ? `, ${result.updated} actualizadas` : ''}
              {result.skipped ? `, ${result.skipped} ya estaban` : ''} en {result.dest}.
            </p>
          )}
          {error && <p className="text-stamp text-sm">{error}</p>}
        </>
      )}
    </section>
  )
}
