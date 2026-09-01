import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { LEVELS } from '../../data/levels.js'
import { fetchTracks, fetchTemarios } from '../../lib/tracks.js'
import { fetchGroups } from '../../lib/groups.js'
import { fetchAllContentStatus, buildAdultosScopeKey, buildInfanciasScopeKey } from '../../lib/content.js'

const CONTENT_TYPES = [
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'quiz', label: 'Cuestionario' },
  { key: 'listening', label: 'Listening' },
  { key: 'reading_writing', label: 'Reading & Writing' },
  { key: 'fill_blank', label: 'Completar oraciones' },
  { key: 'synonyms_antonyms', label: 'Sinónimos y antónimos' },
  { key: 'pronunciation', label: 'Pronunciación' },
]

function StatusCell({ ok, to }) {
  return (
    <Link
      to={to}
      title={ok ? 'Cargado — click para editar' : 'Sin cargar — click para cargar'}
      className="inline-flex items-center justify-center w-full py-1"
    >
      {ok ? (
        <CheckCircle2 size={18} className="text-olive" />
      ) : (
        <XCircle size={18} className="text-stamp" />
      )}
    </Link>
  )
}

export default function AdminContentStatusPage() {
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [onlyMissing, setOnlyMissing] = useState(true)
  const [adultosRows, setAdultosRows] = useState([])
  const [infanciasRows, setInfanciasRows] = useState([])

  useEffect(() => {
    let active = true
    setStatus('loading')
    ;(async () => {
      try {
        const [tracks, groups, filled] = await Promise.all([fetchTracks(), fetchGroups(), fetchAllContentStatus()])
        const temariosByTrack = await Promise.all(tracks.map((t) => fetchTemarios(t.slug)))
        if (!active) return

        const aRows = []
        tracks.forEach((track, ti) => {
          temariosByTrack[ti].forEach((temario) => {
            LEVELS.forEach((level) => {
              const statuses = CONTENT_TYPES.map((ct) => ({
                key: ct.key,
                label: ct.label,
                ok: filled.has(buildAdultosScopeKey(level.slug, track.slug, temario.slug, ct.key)),
              }))
              aRows.push({ level, track, temario, statuses })
            })
          })
        })

        const iRows = groups.map((group) => ({
          group,
          statuses: CONTENT_TYPES.map((ct) => ({
            key: ct.key,
            label: ct.label,
            ok: filled.has(buildInfanciasScopeKey(group.slug, ct.key)),
          })),
        }))

        setAdultosRows(aRows)
        setInfanciasRows(iRows)
        setStatus('ready')
      } catch {
        if (active) setStatus('error')
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const visibleAdultos = onlyMissing ? adultosRows.filter((r) => r.statuses.some((s) => !s.ok)) : adultosRows
  const visibleInfancias = onlyMissing ? infanciasRows.filter((r) => r.statuses.some((s) => !s.ok)) : infanciasRows

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/60 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Qué falta</h1>
      <p className="text-ink/60 mb-6">
        De un vistazo, qué combinaciones de nivel/track/temario (Adultos) o grupo (Infancias) todavía no tienen
        contenido cargado. Click en cualquier ✕ para ir directo a cargarlo.
      </p>

      <label className="flex items-center gap-2 mb-8 text-sm text-ink/70 font-medium">
        <input
          type="checkbox"
          checked={onlyMissing}
          onChange={(e) => setOnlyMissing(e.target.checked)}
          className="accent-brand"
        />
        Mostrar solo lo incompleto
      </label>

      {status === 'loading' && <p className="text-ink/60 text-sm">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm">No pudimos cargar este panel.</p>}

      {status === 'ready' && (
        <>
          <h2 className="font-display text-xl font-semibold text-ink mb-3">Adultos</h2>
          {visibleAdultos.length === 0 ? (
            <p className="text-ink/60 text-sm mb-10">
              {onlyMissing ? 'Todo cargado ✓ (o todavía no hay tracks/temarios creados).' : 'Sin tracks/temarios creados.'}
            </p>
          ) : (
            <div className="texture-card rounded-2xl overflow-hidden mb-10 overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b-2 border-ink/10 text-left text-ink/60 font-mono text-xs uppercase tracking-wide">
                    <th className="px-4 py-3">Nivel</th>
                    <th className="px-4 py-3">Track</th>
                    <th className="px-4 py-3">Temario</th>
                    {CONTENT_TYPES.map((ct) => (
                      <th key={ct.key} className="px-2 py-3 text-center">
                        {ct.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleAdultos.map((row) => (
                    <tr key={`${row.level.slug}-${row.track.slug}-${row.temario.slug}`} className="border-b border-ink/5 last:border-0">
                      <td className="px-4 py-2.5 text-ink/70">{row.level.code}</td>
                      <td className="px-4 py-2.5 text-ink font-medium">{row.track.name}</td>
                      <td className="px-4 py-2.5 text-ink/70">{row.temario.name}</td>
                      {row.statuses.map((s) => (
                        <td key={s.key} className="px-2 py-2.5">
                          <StatusCell
                            ok={s.ok}
                            to={`/notas-profe/content?scope=adultos&level=${row.level.slug}&track=${row.track.slug}&temario=${row.temario.slug}&type=${s.key}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="font-display text-xl font-semibold text-ink mb-3">Infancias</h2>
          {visibleInfancias.length === 0 ? (
            <p className="text-ink/60 text-sm">
              {onlyMissing ? 'Todo cargado ✓ (o todavía no hay grupos creados).' : 'Sin grupos creados.'}
            </p>
          ) : (
            <div className="texture-card rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b-2 border-ink/10 text-left text-ink/60 font-mono text-xs uppercase tracking-wide">
                    <th className="px-4 py-3">Grupo</th>
                    {CONTENT_TYPES.map((ct) => (
                      <th key={ct.key} className="px-2 py-3 text-center">
                        {ct.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleInfancias.map((row) => (
                    <tr key={row.group.slug} className="border-b border-ink/5 last:border-0">
                      <td className="px-4 py-2.5 text-ink font-medium">{row.group.name}</td>
                      {row.statuses.map((s) => (
                        <td key={s.key} className="px-2 py-2.5">
                          <StatusCell
                            ok={s.ok}
                            to={`/notas-profe/content?scope=infancias&group=${row.group.slug}&type=${s.key}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
