import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchGroup } from '../lib/groups.js'
import { KIDS_GROUP_COLORS } from '../lib/colorMaps.js'
import { fetchContent, buildInfanciasScopeKey } from '../lib/content.js'
import { recordSubmission, useStudentName } from '../lib/submissions.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsEmptyState from '../components/KidsEmptyState.jsx'
import NameField from '../components/NameField.jsx'
import { BookOpen, PenLine } from 'lucide-react'

function ReadingItem({ item, c, answers, onChange, disabled }) {
  return (
    <div className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6 sm:p-8 mb-8`}>
      <div className="flex items-center gap-2 mb-4 text-kidsInk/50">
        <BookOpen size={18} />
        <span className="font-playful text-xs uppercase tracking-wider font-semibold">Reading</span>
      </div>
      <h2 className="font-body font-extrabold uppercase tracking-wide text-xl sm:text-2xl text-kidsInk mb-4">{item.title}</h2>
      {item.image_url && (
        <img src={item.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl mb-4" />
      )}
      <p className="font-playful whitespace-pre-line text-kidsInk/85 leading-relaxed mb-6">{item.text}</p>

      <div className="flex flex-col gap-4">
        {item.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-playful text-xs text-kidsInk/45 mb-1 font-semibold">Pregunta {qi + 1}</p>
            <p className="font-playful font-medium text-kidsInk mb-2">{q.q}</p>
            <textarea
              rows={2}
              value={answers[q.id] || ''}
              onChange={(e) => onChange(q.id, e.target.value)}
              disabled={disabled}
              placeholder="Escribí tu respuesta acá..."
              className={`w-full px-3 py-2 rounded-xl border-2 border-kidsInk/12 bg-kidsCream font-playful text-sm focus:outline focus:outline-3 ${c.outline} outline-none transition-colors resize-none disabled:opacity-60`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function WritingItem({ item, c, text, onChange, disabled }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <div className={`bg-white rounded-[22px] shadow-kids ${c.borderT8} p-6 sm:p-8 mb-8`}>
      <div className="flex items-center gap-2 mb-4 text-kidsInk/50">
        <PenLine size={18} />
        <span className="font-playful text-xs uppercase tracking-wider font-semibold">Writing</span>
      </div>
      <h2 className="font-body font-extrabold uppercase tracking-wide text-xl sm:text-2xl text-kidsInk mb-3">{item.title}</h2>
      {item.image_url && (
        <img src={item.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl mb-4" />
      )}
      <p className="font-playful text-kidsInk/70 mb-4">{item.prompt}</p>
      <textarea
        rows={8}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Escribí tu producción acá..."
        className={`w-full px-4 py-3 rounded-xl border-2 border-kidsInk/12 bg-kidsCream font-playful text-sm leading-relaxed focus:outline focus:outline-3 ${c.outline} outline-none transition-colors resize-y disabled:opacity-60`}
      />
      <p className="text-right font-playful text-xs text-kidsInk/45 mt-2 font-semibold">{words} palabras</p>
    </div>
  )
}

export default function InfanciasReadingWritingPage() {
  const { group: slug } = useParams()
  const [group, setGroup] = useState(null)
  const [readingWriting, setReadingWriting] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [readingAnswers, setReadingAnswers] = useState({}) // { [itemId]: { [questionId]: text } }
  const [writingAnswers, setWritingAnswers] = useState({}) // { [itemId]: text }
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentName, setStudentName] = useStudentName()

  useEffect(() => {
    let active = true
    setStatus('loading')
    Promise.all([fetchGroup(slug), fetchContent(buildInfanciasScopeKey(slug, 'reading_writing'), 'reading_writing')])
      .then(([groupData, readingWritingData]) => {
        if (!active) return
        setGroup(groupData)
        setReadingWriting(readingWritingData || [])
        setReadingAnswers({})
        setWritingAnswers({})
        setSaved(false)
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
    return <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsInk/50 font-playful text-sm">Cargando…</div>
  }
  if (status === 'error' || !group) {
    return (
      <div className="min-h-screen bg-kidsCream flex items-center justify-center text-kidsRed font-playful text-sm px-5 text-center">
        No pudimos cargar este contenido ahora mismo. Probá de nuevo en un rato.
      </div>
    )
  }

  const c = KIDS_GROUP_COLORS[group.color_key]

  const hasAnyAnswer =
    Object.values(readingAnswers).some((qs) => Object.values(qs || {}).some((v) => v && v.trim() !== '')) ||
    Object.values(writingAnswers).some((v) => v && v.trim() !== '')

  const handleSave = async () => {
    setSaving(true)
    await Promise.all(
      readingWriting.map((item) => {
        const common = {
          scope: 'infancias',
          groupSlug: slug,
          contentType: 'reading_writing',
          studentName,
        }
        if (item.type === 'reading') {
          const answers = readingAnswers[item.id] || {}
          return recordSubmission({
            ...common,
            label: `Reading — ${item.title}`,
            detail: item.questions.map((q) => ({ id: q.id, question: q.q, answer: answers[q.id] || '' })),
          })
        }
        return recordSubmission({
          ...common,
          label: `Writing — ${item.title}`,
          detail: [{ prompt: item.prompt, answer: writingAnswers[item.id] || '' }],
        })
      })
    )
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={[group.name, 'Reading & Writing']} backTo={`/infancias/${slug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk ${c.bgLight} px-4 py-1.5 rounded-full mb-3`}>
          Reading & Writing 📚
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2">Reading & Writing</h1>
        <p className="font-playful text-kidsInk/65 mb-8">Leé, respondé y practicá tu producción escrita.</p>

        {readingWriting.length === 0 ? (
          <KidsEmptyState label="ejercicios de reading/writing" />
        ) : (
          <>
            {readingWriting.map((item) =>
              item.type === 'reading' ? (
                <ReadingItem
                  key={item.id}
                  item={item}
                  c={c}
                  answers={readingAnswers[item.id] || {}}
                  disabled={saved}
                  onChange={(qId, value) =>
                    setReadingAnswers((a) => ({ ...a, [item.id]: { ...a[item.id], [qId]: value } }))
                  }
                />
              ) : (
                <WritingItem
                  key={item.id}
                  item={item}
                  c={c}
                  text={writingAnswers[item.id] || ''}
                  disabled={saved}
                  onChange={(value) => setWritingAnswers((a) => ({ ...a, [item.id]: value }))}
                />
              )
            )}

            {!saved ? (
              <div className="mt-2">
                <NameField value={studentName} onChange={setStudentName} kids c={c} />
                <button
                  onClick={handleSave}
                  disabled={!hasAnyAnswer || saving || !studentName.trim()}
                  className={`w-full bg-kidsInk text-white font-playful font-semibold py-3 rounded-full ${c.hoverBg} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {saving ? 'Guardando…' : 'Guardar mis respuestas'}
                </button>
                <p className="font-playful text-kidsInk/40 text-xs mt-2">
                  Esto no se corrige solo — tu profe lo lee directamente.
                </p>
              </div>
            ) : (
              <div className="mt-2 bg-white rounded-[22px] shadow-kids p-6 text-center">
                <p className="font-body font-extrabold text-xl text-kidsInk">¡Guardado! Tu profe ya lo puede ver.</p>
                <button
                  onClick={() => setSaved(false)}
                  className={`mt-4 text-kidsInk/60 ${c.hoverText} font-playful text-sm font-semibold underline`}
                >
                  Seguir editando
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
