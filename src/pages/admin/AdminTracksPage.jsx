import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchTracks,
  fetchTemarios,
  saveTrack,
  deleteTrack,
  saveTemario,
  deleteTemario,
} from '../../lib/tracks.js'
import { TRACK_COLOR_OPTIONS, THEME_COLORS } from '../../lib/colorMaps.js'

const EMPTY_TRACK_FORM = {
  id: null,
  slug: '',
  name: '',
  description: '',
  progression: '',
  color_key: TRACK_COLOR_OPTIONS[0],
  passcode: '',
  sort_order: 0,
}

const EMPTY_TEMARIO_FORM = { id: null, track_slug: '', slug: '', name: '', description: '', sort_order: 0 }

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [trackForm, setTrackForm] = useState(EMPTY_TRACK_FORM)
  const [savingTrack, setSavingTrack] = useState(false)
  const [trackError, setTrackError] = useState('')

  const [selectedTrackSlug, setSelectedTrackSlug] = useState(null)
  const [temarios, setTemarios] = useState([])
  const [temarioStatus, setTemarioStatus] = useState('idle') // idle | loading | error | ready
  const [temarioForm, setTemarioForm] = useState(EMPTY_TEMARIO_FORM)
  const [savingTemario, setSavingTemario] = useState(false)
  const [temarioError, setTemarioError] = useState('')

  const loadTracks = () => {
    setStatus('loading')
    fetchTracks()
      .then((data) => {
        setTracks(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(loadTracks, [])

  const loadTemarios = (trackSlug) => {
    setTemarioStatus('loading')
    fetchTemarios(trackSlug)
      .then((data) => {
        setTemarios(data)
        setTemarioStatus('ready')
      })
      .catch(() => setTemarioStatus('error'))
  }

  const selectTrack = (trackSlug) => {
    setSelectedTrackSlug(trackSlug)
    setTemarioForm({ ...EMPTY_TEMARIO_FORM, track_slug: trackSlug })
    setTemarioError('')
    loadTemarios(trackSlug)
  }

  // ─── Track form ────────────────────────────────────────────────────

  const startEditTrack = (track) => {
    setTrackForm(track)
    setTrackError('')
  }

  const startNewTrack = () => {
    setTrackForm(EMPTY_TRACK_FORM)
    setTrackError('')
  }

  const handleTrackSubmit = async (e) => {
    e.preventDefault()
    setSavingTrack(true)
    setTrackError('')
    try {
      await saveTrack(trackForm)
      setTrackForm(EMPTY_TRACK_FORM)
      loadTracks()
    } catch (err) {
      setTrackError(
        err.code === '23505' ? 'Ya existe un track con ese slug — usá otro.' : err.message || 'No pudimos guardar el track.'
      )
    } finally {
      setSavingTrack(false)
    }
  }

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(`¿Borrar el track "${track.name}"? Esto borra también sus temarios. No se puede deshacer.`)) return
    await deleteTrack(track.id)
    if (selectedTrackSlug === track.slug) {
      setSelectedTrackSlug(null)
      setTemarios([])
    }
    loadTracks()
  }

  // ─── Temario form ──────────────────────────────────────────────────

  const startEditTemario = (temario) => {
    setTemarioForm(temario)
    setTemarioError('')
  }

  const startNewTemario = () => {
    setTemarioForm({ ...EMPTY_TEMARIO_FORM, track_slug: selectedTrackSlug })
    setTemarioError('')
  }

  const handleTemarioSubmit = async (e) => {
    e.preventDefault()
    setSavingTemario(true)
    setTemarioError('')
    try {
      await saveTemario(temarioForm)
      setTemarioForm({ ...EMPTY_TEMARIO_FORM, track_slug: selectedTrackSlug })
      loadTemarios(selectedTrackSlug)
    } catch (err) {
      setTemarioError(
        err.code === '23505'
          ? 'Ya existe un temario con ese slug en este track — usá otro.'
          : err.message || 'No pudimos guardar el temario.'
      )
    } finally {
      setSavingTemario(false)
    }
  }

  const handleDeleteTemario = async (temario) => {
    if (!window.confirm(`¿Borrar el temario "${temario.name}"? No se puede deshacer.`)) return
    await deleteTemario(temario.id)
    loadTemarios(selectedTrackSlug)
  }

  const selectedTrack = tracks.find((t) => t.slug === selectedTrackSlug)

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/50 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Tracks y temarios</h1>
      <p className="text-ink/60 mb-8">
        Los tracks son las especializaciones de Adultos (Business English, English for Creatives, etc). Cada uno tiene sus
        propios temarios, que a su vez agrupan flashcards, cuestionario, listening y reading &amp; writing.
      </p>

      {/* ─── Tracks ─────────────────────────────────────────────────── */}

      <form onSubmit={handleTrackSubmit} className="texture-card rounded-2xl p-6 mb-8 flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          {trackForm.id ? 'Editar track' : 'Nuevo track'}
        </p>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
              Slug {trackForm.id && '(no editable)'}
            </span>
            <input
              required
              disabled={!!trackForm.id}
              value={trackForm.slug}
              onChange={(e) => setTrackForm({ ...trackForm, slug: e.target.value })}
              placeholder="ej: business-english"
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm disabled:opacity-50"
            />
          </label>
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Color</span>
            <select
              value={trackForm.color_key}
              onChange={(e) => setTrackForm({ ...trackForm, color_key: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            >
              {TRACK_COLOR_OPTIONS.map((key) => (
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
            value={trackForm.name}
            onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
            placeholder="ej: Business English"
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Progresión (texto corto, ej: "24 clases")
          </span>
          <input
            required
            value={trackForm.progression}
            onChange={(e) => setTrackForm({ ...trackForm, progression: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Descripción</span>
          <textarea
            required
            rows={2}
            value={trackForm.description}
            onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y"
          />
        </label>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Clave de acceso</span>
            <input
              required
              value={trackForm.passcode}
              onChange={(e) => setTrackForm({ ...trackForm, passcode: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
          <label className="w-32">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Orden</span>
            <input
              type="number"
              value={trackForm.sort_order}
              onChange={(e) => setTrackForm({ ...trackForm, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
        </div>

        {trackError && <p className="text-stamp text-sm">{trackError}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={savingTrack}
            className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
          >
            {savingTrack ? 'Guardando…' : trackForm.id ? 'Guardar cambios' : 'Crear track'}
          </button>
          {trackForm.id && (
            <button type="button" onClick={startNewTrack} className="text-ink/60 hover:text-ink text-sm font-medium underline">
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {status === 'loading' && <p className="text-ink/50 text-sm mb-6">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm mb-6">No pudimos cargar los tracks.</p>}

      <div className="flex flex-col gap-3 mb-12">
        {tracks.map((track) => {
          const c = THEME_COLORS[track.color_key]
          return (
            <div key={track.id} className={`texture-card rounded-xl p-4 flex items-center justify-between gap-4 ${c?.borderL8 || ''}`}>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">{track.slug}</p>
                <p className="font-display font-semibold text-ink truncate">{track.name}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => selectTrack(track.slug)}
                  className="text-ink/70 hover:underline text-sm font-medium"
                >
                  Temarios
                </button>
                <button onClick={() => startEditTrack(track)} className="text-brand hover:underline text-sm font-medium">
                  Editar
                </button>
                <button onClick={() => handleDeleteTrack(track)} className="text-stamp hover:underline text-sm font-medium">
                  Borrar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Temarios del track seleccionado ───────────────────────── */}

      {selectedTrackSlug && (
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">
            Temarios de {selectedTrack ? selectedTrack.name : selectedTrackSlug}
          </h2>
          <p className="text-ink/60 mb-6">
            Cada temario es donde viven las 4 actividades (flashcards, cuestionario, listening, reading &amp; writing) —
            esas se cargan desde la sección de Contenido.
          </p>

          <form onSubmit={handleTemarioSubmit} className="texture-card rounded-2xl p-6 mb-8 flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
              {temarioForm.id ? 'Editar temario' : 'Nuevo temario'}
            </p>

            <label>
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
                Slug {temarioForm.id && '(no editable)'}
              </span>
              <input
                required
                disabled={!!temarioForm.id}
                value={temarioForm.slug}
                onChange={(e) => setTemarioForm({ ...temarioForm, slug: e.target.value })}
                placeholder="ej: foundations"
                className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm disabled:opacity-50"
              />
            </label>

            <label>
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Nombre</span>
              <input
                required
                value={temarioForm.name}
                onChange={(e) => setTemarioForm({ ...temarioForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
              />
            </label>

            <label>
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Descripción</span>
              <textarea
                required
                rows={2}
                value={temarioForm.description}
                onChange={(e) => setTemarioForm({ ...temarioForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y"
              />
            </label>

            <label className="w-32">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Orden</span>
              <input
                type="number"
                value={temarioForm.sort_order}
                onChange={(e) => setTemarioForm({ ...temarioForm, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
              />
            </label>

            {temarioError && <p className="text-stamp text-sm">{temarioError}</p>}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={savingTemario}
                className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
              >
                {savingTemario ? 'Guardando…' : temarioForm.id ? 'Guardar cambios' : 'Crear temario'}
              </button>
              {temarioForm.id && (
                <button
                  type="button"
                  onClick={startNewTemario}
                  className="text-ink/60 hover:text-ink text-sm font-medium underline"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          {temarioStatus === 'loading' && <p className="text-ink/50 text-sm mb-6">Cargando…</p>}
          {temarioStatus === 'error' && <p className="text-stamp text-sm mb-6">No pudimos cargar los temarios.</p>}

          <div className="flex flex-col gap-3">
            {temarios.map((temario) => (
              <div key={temario.id} className="texture-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">{temario.slug}</p>
                  <p className="font-display font-semibold text-ink truncate">{temario.name}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => startEditTemario(temario)} className="text-brand hover:underline text-sm font-medium">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteTemario(temario)} className="text-stamp hover:underline text-sm font-medium">
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
