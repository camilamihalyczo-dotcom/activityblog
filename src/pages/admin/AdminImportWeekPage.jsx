import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Download, FileJson, Upload, XCircle } from 'lucide-react'
import { fetchTracks } from '../../lib/tracks.js'
import { WEEK_TEMPLATE, buildWeekPlan, importWeek, inspectExisting, parseWeek } from '../../lib/weekImport.js'
import { clearCache } from '../../lib/cache.js'

// Importar una semana completa de un curso desde un JSON (ver
// src/lib/weekImport.js para el formato). Flujo: pegar o subir el archivo →
// vista previa con errores → si la semana ya tiene contenido, elegir si se
// pisa o se suma → importar.

const box = 'texture-card rounded-2xl p-5 sm:p-6'
const mono = 'font-mono text-[11px] uppercase tracking-widest text-ink/60'

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function itemSummary(a) {
  const n = a.items.length
  switch (a.key) {
    case 'flashcards':
      return `${n} tarjeta${n === 1 ? '' : 's'}`
    case 'quiz':
      return a.items.map((q) => plural(q.questions.length, 'pregunta')).join(' + ')
    case 'sentenceBuilder':
    case 'fillBlanks':
      return `${plural(a.items[0].sentences.length, 'oración', 'oraciones')}${a.key === 'fillBlanks' && a.items[0].wordBank ? ' · con banco de palabras' : ''}`
    case 'listening':
      return a.items
        .map((l) => `${plural(l.questions.length, 'pregunta')} · ${l.audioUrl ? 'audio' : l.youtubeId || l.videoUrl ? 'video' : 'guion con voz'}`)
        .join(' / ')
    case 'readingWriting':
      return a.items.map((it) => (it.type === 'reading' ? `Reading (${plural(it.questions.length, 'pregunta')})` : 'Writing')).join(' + ')
    case 'pronunciation':
      return plural(a.items[0].pairs.length, 'pareja')
    case 'voiceLab':
      return `${n} oracion${n === 1 ? '' : 'es'}`
    default:
      return `${n}`
  }
}

export default function AdminImportWeekPage() {
  const [tracks, setTracks] = useState([])
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [result, setResult] = useState(null) // { errors, warnings, plan }
  const [existing, setExisting] = useState(null)
  const [mode, setMode] = useState('replace')
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(null)
  const [importError, setImportError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    clearCache()
    fetchTracks().then(setTracks).catch(() => {})
  }, [])

  const analyze = async (raw) => {
    setDone(null)
    setImportError('')
    setExisting(null)
    setResult(null)
    const parsed = parseWeek(raw)
    if (parsed.error) {
      setParseError(parsed.error)
      return
    }
    setParseError('')
    const r = buildWeekPlan(parsed.data, { tracks })
    setResult(r)
    if (!r.errors.length) {
      try {
        const ex = await inspectExisting(r.plan)
        setExisting(ex)
        setMode(ex.hasContent ? '' : 'replace')
      } catch {
        setExisting({ temario: null, filled: {}, hasContent: false, failed: true })
      }
    }
  }

  const onFile = async (file) => {
    if (!file) return
    const raw = await file.text()
    setFileName(file.name)
    setText(raw)
    analyze(raw)
  }

  const doImport = async () => {
    setImporting(true)
    setImportError('')
    try {
      const res = await importWeek(result.plan, mode)
      setDone(res)
    } catch (err) {
      setImportError(err.message || 'No se pudo importar.')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(WEEK_TEMPLATE, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'semana-ejemplo.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const plan = result?.plan
  const canImport = result && !result.errors.length && existing && mode && !importing && !done

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <Link to="/notas-profe" className="text-brand hover:underline text-sm">← Panel</Link>
        <h1 className="font-display text-3xl font-semibold text-ink mt-2">Importar semana (JSON)</h1>
        <p className="text-ink/70 mt-1">
          Subí el archivo de una semana y se cargan todas sus actividades juntas en el temario de esa semana, con el código de
          clase y ejercicio para lxs alumnxs.
        </p>
      </div>

      <section className={box}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 bg-ink text-cream font-semibold px-4 py-2 rounded-lg hover:bg-brand transition-colors"
          >
            <Upload size={16} /> Subir archivo .json
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => {
            onFile(e.target.files?.[0])
            // Para poder volver a elegir el mismo archivo (ej. después de corregirlo).
            e.target.value = ''
          }} />
          {fileName && <span className="inline-flex items-center gap-1 text-sm text-ink/70"><FileJson size={16} /> {fileName}</span>}
          <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-1 text-brand hover:underline text-sm ml-auto">
            <Download size={15} /> Descargar ejemplo
          </button>
        </div>
        <label className="block">
          <span className={`${mono} block mb-1`}>O pegá el JSON acá</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setFileName('')
            }}
            rows={8}
            spellCheck={false}
            placeholder='{ "course": "english-for-developers", "level": "b1-b2", "week": 1, ... }'
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper font-mono text-xs"
          />
        </label>
        <button
          type="button"
          onClick={() => analyze(text)}
          disabled={!text.trim()}
          className="mt-3 bg-brand text-cream font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
        >
          Revisar
        </button>
        {parseError && <p className="text-stamp text-sm mt-3">{parseError}</p>}
      </section>

      {result && (
        <section className={box} data-testid="import-preview">
          <p className={mono}>Vista previa</p>
          <h2 className="font-display text-2xl font-semibold text-ink mt-1">{plan.temarioName}</h2>
          {plan.description && <p className="text-ink/80 mt-1">{plan.description}</p>}
          <p className="text-ink/70 text-sm mt-1">
            {plan.trackName} · Nivel {plan.levelName} · Clase {Number.isInteger(plan.classNum) ? plan.classNum : '?'}
            {existing && (existing.temario ? ' · el temario ya existe' : ' · se crea un temario nuevo')}
          </p>

          {result.errors.length > 0 && (
            <div className="mt-4 rounded-xl border-2 border-stamp/30 bg-stamp/5 p-4">
              <p className="flex items-center gap-2 font-semibold text-stamp">
                <XCircle size={18} /> {result.errors.length} error{result.errors.length === 1 ? '' : 'es'} — corregilos en el JSON y volvé a revisar
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-ink/80 flex flex-col gap-1">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div className="mt-4 rounded-xl border-2 border-gold/40 bg-gold/10 p-4">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <AlertTriangle size={18} /> Avisos (no impiden importar)
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-ink/80 flex flex-col gap-1">
                {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <ul className="mt-5 divide-y-2 divide-dashed divide-ink/10 border-y-2 border-dashed border-ink/10">
            {plan.activities.map((a) => (
              <li key={a.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                <span className="font-mono text-xs text-brand w-28 shrink-0">
                  {a.key === 'flashcards' || a.items.length === 1 ? a.items[0].code : `${a.items[0].code.replace(/[a-z]$/, '')}a–${String.fromCharCode(96 + a.items.length)}`}
                </span>
                <span className="font-semibold text-ink">{a.label}</span>
                <span className="text-ink/60 text-sm">{itemSummary(a)}</span>
                {existing?.filled?.[a.contentType] && (
                  <span className="text-[11px] font-mono uppercase text-stamp ml-auto">ya tiene contenido</span>
                )}
              </li>
            ))}
            {plan.glossary.length > 0 && (
              <li className="flex flex-wrap items-baseline gap-x-3 py-3">
                <span className="font-mono text-xs text-ink/50 w-28 shrink-0">Glosario</span>
                <span className="font-semibold text-ink">Glosario del track</span>
                <span className="text-ink/60 text-sm">{plan.glossary.length} palabras (no se duplican las que ya están)</span>
              </li>
            )}
          </ul>

          {!result.errors.length && !existing && <p className="text-ink/60 text-sm mt-4">Revisando qué hay cargado…</p>}

          {!result.errors.length && existing?.hasContent && !done && (
            <fieldset className="mt-5 rounded-xl border-2 border-ink/15 p-4">
              <legend className="px-2 font-semibold text-ink">Esta semana ya tiene contenido. ¿Qué hago?</legend>
              <label className="flex items-start gap-2 text-sm py-1">
                <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mt-1" />
                <span>
                  <strong>Reemplazar</strong> — las actividades que trae el archivo pisan lo que hay en esa semana (las que no trae, quedan
                  como están).
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm py-1">
                <input type="radio" name="mode" checked={mode === 'append'} onChange={() => setMode('append')} className="mt-1" />
                <span>
                  <strong>Sumar</strong> — se agregan después de lo que ya hay.
                </span>
              </label>
            </fieldset>
          )}
          {existing?.failed && <p className="text-stamp text-sm mt-3">No pude revisar si la semana ya tenía contenido; si importás, se reemplaza.</p>}

          {!done && (
            <button
              type="button"
              onClick={doImport}
              disabled={!canImport}
              className="mt-5 w-full sm:w-auto bg-ink text-cream font-semibold px-6 py-3 rounded-lg hover:bg-brand transition-colors disabled:opacity-40"
            >
              {importing ? 'Importando…' : result.errors.length ? 'Corregí los errores para importar' : existing?.hasContent && !mode ? 'Elegí reemplazar o sumar' : 'Importar semana'}
            </button>
          )}
          {importError && <p className="text-stamp text-sm mt-3">{importError}</p>}

          {done && (
            <div className="mt-5 rounded-xl border-2 border-olive/30 bg-olive/10 p-4" role="status">
              <p className="flex items-center gap-2 font-semibold text-olive">
                <CheckCircle2 size={18} /> ¡Semana importada!
              </p>
              <ul className="mt-2 text-sm text-ink/80 list-disc pl-5">
                {done.createdTemario && <li>Se creó el temario “{plan.temarioName}”.</li>}
                {done.written.map((w) => (
                  <li key={w.label}>
                    {w.label}: {w.count} {w.count === 1 ? 'ítem' : 'ítems'} {mode === 'append' ? 'sumado' : 'cargado'}{w.count === 1 ? '' : 's'}
                  </li>
                ))}
                {plan.glossary.length > 0 && (
                  <li>
                    Glosario: {plural(done.glossaryAdded, 'palabra nueva', 'palabras nuevas')}{done.glossaryUpdated ? `, ${plural(done.glossaryUpdated, 'actualizada', 'actualizadas')}` : ''}
                  </li>
                )}
              </ul>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <a href={`/adultos/${plan.level}/${plan.course}/${plan.temarioSlug}`} target="_blank" rel="noreferrer" className="text-brand hover:underline font-medium">
                  Ver la semana como alumnx →
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setText('')
                    setFileName('')
                    setResult(null)
                    setDone(null)
                  }}
                  className="text-brand hover:underline"
                >
                  Importar otra semana
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
