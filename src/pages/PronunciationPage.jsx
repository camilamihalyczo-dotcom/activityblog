import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { fetchTrack, fetchTemario } from '../lib/tracks.js'
import { THEME_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildAdultosScopeKey } from '../lib/content.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import NameField from '../components/NameField.jsx'
import QuestionHint from '../components/QuestionHint.jsx'

function shuffle(arr) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

// La primera palabra de cada grupo queda fija como consigna arriba; el
// resto son las que el alumno tiene que emparejar tocándolas desde el
// banco compartido de abajo (en vez de arrastrar para reordenar).
function buildGroupsData(rawGroups) {
  const groups = (rawGroups || [])
    .map((g) => ({ ...g, words: (g.words || []).map((w) => (w || '').trim()).filter(Boolean) }))
    .filter((g) => g.words.length >= 2)

  const chips = groups.flatMap((g) => g.words.slice(1).map((w, wi) => ({ id: `${g.id}-c${wi}`, text: w, groupId: g.id })))
  const slots = groups.flatMap((g) => g.words.slice(1).map((_, wi) => ({ id: `${g.id}-s${wi}`, groupId: g.id })))

  return { groups, chips, slots }
}

export default function PronunciationPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const [theme, setTheme] = useState(null)
  const [temario, setTemario] = useState(null)
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [groups, setGroups] = useState([])
  const [chips, setChips] = useState([])
  const [slots, setSlots] = useState([])
  const [bankOrder, setBankOrder] = useState([])
  const [placements, setPlacements] = useState({}) // slotId -> chipId
  const [selectedChipId, setSelectedChipId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([
      fetchTrack(themeSlug),
      fetchTemario(themeSlug, temarioSlug),
      fetchContent(buildAdultosScopeKey(slug, themeSlug, temarioSlug, 'pronunciation'), 'pronunciation'),
    ])
      .then(([trackData, temarioData, groupsData]) => {
        if (!active) return
        setTheme(trackData)
        setTemario(temarioData)
        const { groups: g, chips: c2, slots: s } = buildGroupsData(groupsData)
        setGroups(g)
        setChips(c2)
        setSlots(s)
        setBankOrder(shuffle(c2.map((c3) => c3.id)))
        setPlacements({})
        setSelectedChipId(null)
        setSubmitted(false)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [slug, themeSlug, temarioSlug])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
  }
  if (status === 'error' || !theme || !temario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stamp text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = THEME_COLORS[theme.color_key]

  if (groups.length === 0) {
    return (
      <div className="min-h-screen">
        <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Pronunciación']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <EmptyState label="grupos de pronunciación" />
        </div>
      </div>
    )
  }

  const chipsById = Object.fromEntries(chips.map((chip) => [chip.id, chip]))
  const placedChipIds = new Set(Object.values(placements))
  const bankChipIds = bankOrder.filter((id) => !placedChipIds.has(id))
  const allPlaced = Object.keys(placements).length === slots.length
  const score = slots.filter((s) => chipsById[placements[s.id]]?.groupId === s.groupId).length

  const handleChipClick = (chipId) => {
    if (submitted) return
    setSelectedChipId((cur) => (cur === chipId ? null : chipId))
  }

  const handleSlotClick = (slotId) => {
    if (submitted) return
    if (selectedChipId) {
      setPlacements((p) => {
        const next = {}
        for (const [sid, cid] of Object.entries(p)) {
          if (cid !== selectedChipId) next[sid] = cid
        }
        next[slotId] = selectedChipId
        return next
      })
      setSelectedChipId(null)
    } else if (placements[slotId]) {
      setPlacements((p) => {
        const next = { ...p }
        delete next[slotId]
        return next
      })
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    recordSubmission({
      scope: 'adultos',
      levelSlug: slug,
      trackSlug: themeSlug,
      temarioSlug,
      contentType: 'pronunciation',
      label: 'Pronunciación',
      studentName,
      score,
      total: slots.length,
      detail: groups.flatMap((g) =>
        g.words.slice(1).map((_, wi) => {
          const slotId = `${g.id}-s${wi}`
          const chip = chipsById[placements[slotId]]
          return {
            question: `${g.words[0]} — palabra ${wi + 1}`,
            given: chip?.text ?? null,
            is_correct: chip?.groupId === g.id,
            correct: g.words.slice(1).join(' / '),
          }
        })
      ),
    })
  }

  const retry = () => {
    setPlacements({})
    setSelectedChipId(null)
    setBankOrder(shuffle(chips.map((chip) => chip.id)))
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Pronunciación']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Pronunciación
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Pronunciación</h1>
        <p className="text-ink/60 mb-8">
          Tocá una palabra del banco de abajo y después tocá el casillero de la palabra con la que suena parecido.
        </p>

        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const groupSlots = slots.filter((s) => s.groupId === group.id)
            return (
              <div key={group.id} className={`texture-card rounded-2xl ${c.borderT4} p-5`}>
                <p className="font-display text-lg font-semibold text-ink mb-1">{group.words[0]}</p>
                <QuestionHint hint={group.hint} />
                <div className="flex flex-wrap gap-2 mt-1">
                  {groupSlots.map((slot) => {
                    const chip = chipsById[placements[slot.id]]
                    const correct = submitted && chip && chip.groupId === slot.groupId
                    const wrong = submitted && (!chip || chip.groupId !== slot.groupId)
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={submitted}
                        onClick={() => handleSlotClick(slot.id)}
                        className={`min-w-[96px] px-3 py-2 rounded-lg border-2 border-dashed text-sm font-medium transition-colors text-center
                          ${!chip ? 'border-ink/25 text-ink/60' : 'border-solid border-ink bg-ink/5 text-ink'}
                          ${correct ? 'border-solid border-olive bg-olive/10 text-ink' : ''}
                          ${wrong ? 'border-solid border-stamp bg-stamp/10 text-ink' : ''}
                        `}
                      >
                        {chip ? chip.text : '···'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="texture-card rounded-2xl p-5 mt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60 mb-3">Banco de palabras</p>
          <div className="flex flex-wrap gap-2">
            {bankChipIds.map((id) => {
              const chip = chipsById[id]
              const selected = selectedChipId === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleChipClick(id)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors
                    ${selected ? 'border-ink bg-ink text-cream' : 'border-ink/15 bg-paper text-ink hover:border-ink/40'}
                  `}
                >
                  {chip.text}
                </button>
              )
            })}
            {bankChipIds.length === 0 && <p className="text-ink/60 text-xs">Usaste todas las palabras.</p>}
          </div>
        </div>

        {!submitted ? (
          <div className="mt-8">
            <NameField value={studentName} onChange={setStudentName} c={c} />
            <button
              onClick={handleSubmit}
              disabled={!allPlaced || !studentName.trim()}
              className={`w-full bg-ink text-cream font-semibold py-3 rounded-lg ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Corregir
            </button>
          </div>
        ) : (
          <div className="mt-8 texture-card rounded-2xl p-6 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              {score} / {slots.length} correctas
            </p>
            <button onClick={retry} className={`mt-4 text-ink/60 ${c.hoverText} text-sm font-medium underline`}>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
