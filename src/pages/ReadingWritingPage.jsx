import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLevel } from '../data/levels.js'
import { getTheme, getTemario, THEME_COLORS } from '../data/themes.js'
import { getTemarioContent } from '../data/contentIndex.js'
import TicketHeader from '../components/TicketHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { BookOpen, PenLine } from 'lucide-react'

function ReadingItem({ item, c }) {
  return (
    <div className={`texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8`}>
      <div className="flex items-center gap-2 mb-4 text-ink/50">
        <BookOpen size={18} />
        <span className="font-mono text-xs uppercase tracking-wider">Reading</span>
      </div>
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">{item.title}</h2>
      <p className="whitespace-pre-line text-ink/85 leading-relaxed mb-6">{item.text}</p>

      <div className="flex flex-col gap-4">
        {item.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="font-mono text-xs text-ink/40 mb-1">Pregunta {qi + 1}</p>
            <p className="font-medium text-ink mb-2">{q.q}</p>
            <textarea
              rows={2}
              placeholder="Escribí tu respuesta acá..."
              className={`w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm ${c.focusBorder} outline-none transition-colors resize-none`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function WritingItem({ item, c }) {
  const [text, setText] = useState('')
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <div className={`texture-card rounded-2xl ${c.borderT4} p-6 sm:p-8 mb-8`}>
      <div className="flex items-center gap-2 mb-4 text-ink/50">
        <PenLine size={18} />
        <span className="font-mono text-xs uppercase tracking-wider">Writing</span>
      </div>
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-3">{item.title}</h2>
      <p className="text-ink/70 mb-4">{item.prompt}</p>
      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribí tu producción acá..."
        className={`w-full px-4 py-3 rounded-lg border-2 border-ink/15 bg-paper text-sm leading-relaxed ${c.focusBorder} outline-none transition-colors resize-y`}
      />
      <p className="text-right font-mono text-xs text-ink/40 mt-2">{words} palabras</p>
    </div>
  )
}

export default function ReadingWritingPage() {
  const { level: slug, theme: themeSlug, temario: temarioSlug } = useParams()
  const level = getLevel(slug)
  const theme = getTheme(themeSlug)
  const temario = getTemario(themeSlug, temarioSlug)
  const c = THEME_COLORS[theme.color]
  const { readingWriting } = getTemarioContent(slug, themeSlug, temarioSlug)

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={[level.code, theme.name, temario.name, 'Reading & Writing']} backTo={`/adultos/${slug}/${themeSlug}/${temarioSlug}`} />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${c.tag}`}>
          Reading & Writing
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Reading & Writing</h1>
        <p className="text-ink/60 mb-8">Leé, respondé y practicá tu producción escrita.</p>

        {readingWriting.length === 0 ? (
          <EmptyState label="ejercicios de reading/writing" />
        ) : (
          readingWriting.map((item) =>
            item.type === 'reading' ? (
              <ReadingItem key={item.id} item={item} c={c} />
            ) : (
              <WritingItem key={item.id} item={item} c={c} />
            )
          )
        )}
      </div>
    </div>
  )
}
