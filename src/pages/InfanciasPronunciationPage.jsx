import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
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

export default function InfanciasPronunciationPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
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
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'pronunciation'), 'pronunciation')])
      .then(([groupData, groupsData]) => {
        if (!active) return
        setGroup(groupData)
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
  }, [slug])

  if (status === 'loading') {
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/70 font-playful text-sm">Cargando…</div>
  }
  if (status === 'error' || !group) {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = KIDS_GROUP_COLORS[group.color_key]

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-kidsCream">
        <KidsHeader crumbs={[group.name, 'Pronunciación']} backTo={`/infancias/${slug}`} />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <KidsEmptyState label="grupos de pronunciación" />
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
      scope: 'infancias',
      groupSlug: slug,
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
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Pronunciación']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Pronunciación 🔊
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Pronunciación</h1>
        <p className="font-playful text-kidsInk/70 mb-8">
          Tocá una palabra del banco de abajo y después tocá el casillero de la palabra con la que suena parecido.
        </p>

        <div className="flex flex-col gap-4">
          {groups.map((group2) => {
            const groupSlots = slots.filter((s) => s.groupId === group2.id)
            return (
              <div key={group2.id} className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-5`}>
                <p className="font-body font-extrabold text-lg text-kidsInk mb-1">{group2.words[0]}</p>
                <QuestionHint hint={group2.hint} kids />
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
                        className={`min-w-[96px] px-3 py-2 rounded-xl border-2 border-dashed font-playful text-sm font-medium transition-colors text-center
                          ${!chip ? 'border-kidsInk/25 text-kidsInk/70' : 'border-solid border-kidsInk bg-kidsInk/5 text-kidsInk'}
                          ${correct ? 'border-solid border-kidsGreenDeep bg-kidsGreen/15 text-kidsInk' : ''}
                          ${wrong ? 'border-solid border-kidsRed bg-kidsRed/10 text-kidsInk' : ''}
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

        <div className="bg-white rounded-[22px] shadow-kids p-5 mt-4">
          <p className="font-playful text-[10px] uppercase tracking-widest font-semibold text-kidsInk/70 mb-3">Banco de palabras</p>
          <div className="flex flex-wrap gap-2">
            {bankChipIds.map((id) => {
              const chip = chipsById[id]
              const selected = selectedChipId === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleChipClick(id)}
                  className={`px-3 py-2 rounded-xl border-2 font-playful text-sm font-medium transition-colors
                    ${selected ? 'border-kidsInk bg-kidsInk text-white' : 'border-kidsInk/15 bg-kidsCream text-kidsInk hover:border-kidsInk/40'}
                  `}
                >
                  {chip.text}
                </button>
              )
            })}
            {bankChipIds.length === 0 && <p className="font-playful text-kidsInk/70 text-xs">Usaste todas las palabras.</p>}
          </div>
        </div>

        {!submitted ? (
          <div className="mt-8">
            <NameField value={studentName} onChange={setStudentName} kids c={c} />
            <button
              onClick={handleSubmit}
              disabled={!allPlaced || !studentName.trim()}
              className={`w-full bg-kidsInk text-white font-playful font-semibold py-3 rounded-full ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Corregir
            </button>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-[22px] shadow-kids p-6 text-center">
            <p className="font-body font-extrabold text-2xl text-kidsInk">
              {score} / {slots.length} correctas
            </p>
            <button
              onClick={retry}
              className={`mt-4 text-kidsInk/70 ${c.hoverText} font-playful text-sm font-semibold underline`}
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
