import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DECK_CSS, DECK_FONTS_URL } from './deckCss.js'
import { BRAND_FOOTER, resolveColor } from '../../lib/deckThemes.js'
import { parseYouTubeId } from '../../lib/youtube.js'

// Dibuja una presentación (o un glosario) con el estilo del tramo:
// Adultos → Track English Studio, Infancias → English Kids Club.
// Se usa igual en la vista previa del panel y en el link del alumno.

// Carga las tipografías de las presentaciones una sola vez.
export function useDeckFonts() {
  useEffect(() => {
    if (document.getElementById('dk-fonts')) return
    const link = document.createElement('link')
    link.id = 'dk-fonts'
    link.rel = 'stylesheet'
    link.href = DECK_FONTS_URL
    document.head.appendChild(link)
  }, [])
}

// ─── Texto con formato mínimo ─────────────────────────────────────────
// **negrita**, *cursiva* (en los títulos, la cursiva es la palabra
// destacada: Playfair en Adultos, resaltador en Infancias), "- " para
// viñetas y línea en blanco para separar párrafos.
function inline(text) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>
    return p.split('\n').map((line, j, arr) => (
      <Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </Fragment>
    ))
  })
}

function RichText({ text }) {
  const paragraphs = String(text || '').trim().split(/\n\s*\n/)
  return (
    <div className="dk-rt">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n')
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{inline(para)}</p>
      })}
    </div>
  )
}

const cols = (n, max = 3) => `c${Math.max(1, Math.min(max, n))}`

// ─── Bloques ──────────────────────────────────────────────────────────

function Block({ block, portrait }) {
  switch (block.type) {
    case 'heading':
      return <p className="dk-h">{block.text}</p>
    case 'text':
      return block.text?.trim() ? <RichText text={block.text} /> : null
    case 'cards': {
      const items = (block.items || []).filter((c) => c.title || c.text || c.label)
      if (!items.length) return null
      return (
        <div className={`dk-grid ${cols(items.length, portrait ? 2 : 4)}`}>
          {items.map((c, i) => (
            <div key={i} className="dk-card">
              {c.label && <span className="dk-pill">{c.label}</span>}
              {c.title && <p className="dk-card-title">{inline(c.title)}</p>}
              {c.text && <RichText text={c.text} />}
            </div>
          ))}
        </div>
      )
    }
    case 'roadmap': {
      const items = (block.items || []).filter((r) => r.title || r.text)
      if (!items.length) return null
      return (
        <div className="dk-road">
          {items.map((r, i) => (
            <div key={i} className="dk-road-row">
              <span className="dk-road-n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="dk-road-t">{inline(r.title)}</p>
                {r.text && <p className="dk-road-d">{inline(r.text)}</p>}
              </div>
              {r.tag ? <span className="dk-pill" style={{ marginBottom: 0 }}>{r.tag}</span> : <span />}
            </div>
          ))}
        </div>
      )
    }
    case 'compare':
      if (!block.wrong && !block.right) return null
      return (
        <div className="dk-cmp">
          <div className="dk-cmp-box bad">
            <p className="dk-cmp-label">❌ {block.wrongLabel || 'Versión literal'}</p>
            <p className="dk-cmp-quote">{inline(block.wrong)}</p>
            {block.wrongNote && <div className="dk-cmp-note"><RichText text={block.wrongNote} /></div>}
          </div>
          <div className="dk-cmp-box good">
            <p className="dk-cmp-label">✅ {block.rightLabel || 'Versión profesional'}</p>
            <p className="dk-cmp-quote">{inline(block.right)}</p>
            {block.rightNote && <div className="dk-cmp-note"><RichText text={block.rightNote} /></div>}
          </div>
        </div>
      )
    case 'callout':
      if (!block.text?.trim()) return null
      return (
        <div className="dk-call">
          {block.label && <p className="dk-call-label">{block.label}</p>}
          <RichText text={block.text} />
        </div>
      )
    case 'vocab': {
      const items = (block.items || []).filter((w) => w.word)
      if (!items.length) return null
      const n = portrait ? (items.length >= 3 ? 3 : items.length) : items.length >= 3 ? 3 : items.length
      return (
        <div className={`dk-vocab ${cols(n)}`}>
          {items.map((w, i) => (
            <div key={i} className="dk-card">
              <div className="dk-word-top">
                <span className="dk-word">{w.word}</span>
                {w.phonetic && <span className="dk-phon">[{w.phonetic.replace(/^\[|\]$/g, '')}]</span>}
              </div>
              {w.translation && <p className="dk-trans">{w.translation}</p>}
              {w.definition && <p className="dk-def">{inline(w.definition)}</p>}
              {w.example && <p className="dk-ex">“{w.example.replace(/^["“]|["”]$/g, '')}”</p>}
            </div>
          ))}
        </div>
      )
    }
    case 'table': {
      const rows = String(block.text || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split('|').map((c) => c.trim()))
      if (rows.length === 0) return null
      const [head, ...body] = rows
      return (
        <table className="dk-table">
          <thead>
            <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, i) => (
              <tr key={i}>{head.map((_, j) => <td key={j}>{inline(r[j] || '')}</td>)}</tr>
            ))}
          </tbody>
        </table>
      )
    }
    case 'image':
      if (!block.url) return <div className="dk-empty dk-noprint">Imagen sin cargar</div>
      return (
        <figure className={`dk-media dk-img-${block.size || 'm'}`} style={{ margin: 0 }}>
          <img src={block.url} alt={block.caption || ''} />
          {block.caption && <figcaption className="dk-cap">{block.caption}</figcaption>}
        </figure>
      )
    case 'video': {
      const id = parseYouTubeId(block.url)
      if (!id) return <div className="dk-empty dk-noprint">Video sin cargar (pegá un link de YouTube)</div>
      const watch = `https://youtu.be/${id}`
      return (
        <figure className="dk-media" style={{ margin: 0 }}>
          <div className="dk-video">
            <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title={block.caption || 'Video'} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            {/* En el PDF un video no se puede reproducir: va la miniatura con el link. */}
            <a className="dk-video-print" href={watch}>
              <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" />
              <span>▶ {watch}</span>
            </a>
          </div>
          {block.caption && <figcaption className="dk-cap">{block.caption}</figcaption>}
        </figure>
      )
    }
    case 'errorRule': {
      const items = (block.items || []).filter((r) => r.correct || r.rule)
      if (!items.length) return null
      const say = block.mode === 'saythis'
      // Como en tus clases: cada regla con su propio color (acento, verde,
      // ámbar) para separarlas a simple vista.
      const tones = ['var(--mark)', '#1E8449', '#B9770E']
      return (
        <div className={`dk-er ${say ? 'dk-er--say' : ''}`}>
          {items.map((r, i) => (
            <div key={i} className="dk-er-row" style={say ? undefined : { '--er-c': tones[i % tones.length] }}>
              <div className="dk-er-top">
                <span className="dk-er-rule">{say ? `${r.rule || 'Formulación profesional'} ✅` : r.rule}</span>
                {!say && r.badge && <span className="dk-pill" style={{ marginBottom: 0 }}>{r.badge}</span>}
              </div>
              {r.correct && <p className="dk-er-ok">“{inline(r.correct)}”</p>}
              {r.error && (
                <p className="dk-er-bad">
                  ❌ {say ? 'No decir:' : r.errorLabel || 'Error común de transferencia:'} <i>“{r.error}”</i>
                  {r.note ? ` ${r.note}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )
    }
    case 'imageText':
      if (!block.url && !block.text?.trim()) return null
      return (
        <div className={`dk-it ${block.side === 'right' ? 'right' : ''}`}>
          <figure className="dk-media" style={{ margin: 0 }}>
            {block.url ? <img src={block.url} alt={block.caption || ''} /> : <div className="dk-empty dk-noprint" style={{ width: '100%' }}>Imagen sin cargar</div>}
            {block.caption && <figcaption className="dk-cap">{block.caption}</figcaption>}
          </figure>
          <div>{block.text?.trim() && <RichText text={block.text} />}</div>
        </div>
      )
    case 'gallery': {
      const items = (block.items || []).filter((g) => g.url)
      if (!items.length) return <div className="dk-empty dk-noprint">Galería sin imágenes</div>
      return (
        <div className={`dk-gal ${cols(items.length, 4)}`}>
          {items.map((g, i) => (
            <figure key={i}>
              <img src={g.url} alt={g.caption || ''} />
              {g.caption && <figcaption className="dk-cap">{g.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )
    }
    case 'chart':
      return <BarChart block={block} />
    case 'process': {
      const items = (block.items || []).filter((p) => p.title || p.text)
      if (!items.length) return null
      return (
        <div className="dk-proc">
          {items.map((p, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="dk-proc-arrow" aria-hidden="true">→</span>}
              <div className="dk-proc-step">
                <p className="dk-proc-n">{String(i + 1).padStart(2, '0')}</p>
                <p className="dk-card-title">{inline(p.title)}</p>
                {p.text && <RichText text={p.text} />}
              </div>
            </Fragment>
          ))}
        </div>
      )
    }
    default:
      return null
  }
}


// ─── Gráfico de barras horizontales ───────────────────────────────────
// Una sola serie en un solo color (el del tramo, en su versión con
// contraste suficiente). Va impreso, así que cada barra lleva su valor
// escrito; el número también queda en un <title> para quien lo ve online.
export function parseChartRows(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, raw] = l.split('|').map((x) => x.trim())
      const value = Number(String(raw || '').replace(',', '.').replace(/[^\d.-]/g, ''))
      return { label: label || '', value: Number.isFinite(value) ? value : 0 }
    })
    .filter((r) => r.label)
}

function BarChart({ block }) {
  const rows = parseChartRows(block.text)
  if (!rows.length) return <div className="dk-empty dk-noprint">Gráfico sin datos</div>
  const unit = block.unit || ''
  const max = Math.max(...rows.map((r) => r.value), 0) || 1
  const W = 900
  const labelW = Math.min(260, Math.max(90, Math.max(...rows.map((r) => r.label.length)) * 8 + 16))
  const valueW = 64
  const barH = 22
  const gap = 14
  const plotW = W - labelW - valueW
  const H = rows.length * (barH + gap) - gap + 8
  const ticks = [0.25, 0.5, 0.75, 1]
  return (
    <figure className="dk-chart" style={{ margin: 0 }}>
      {block.title && <figcaption className="dk-chart-title">{block.title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={block.title || 'Gráfico de barras'}>
        {ticks.map((t) => (
          <line key={t} className="grid" x1={labelW + plotW * t} x2={labelW + plotW * t} y1={0} y2={H - 4} />
        ))}
        <line className="base" x1={labelW} x2={labelW} y1={0} y2={H - 4} />
        {rows.map((r, i) => {
          const y = i * (barH + gap)
          const w = Math.max(0, (Math.max(0, r.value) / max) * plotW)
          const rx = Math.min(4, w / 2)
          // Barra anclada a la base (esquinas rectas a la izquierda) y extremo redondeado de 4px.
          const d = w <= 0 ? '' : `M${labelW},${y} H${labelW + w - rx} Q${labelW + w},${y} ${labelW + w},${y + rx} V${y + barH - rx} Q${labelW + w},${y + barH} ${labelW + w - rx},${y + barH} H${labelW} Z`
          return (
            <g key={i}>
              <title>{`${r.label}: ${r.value}${unit}`}</title>
              <text className="lbl" x={labelW - 12} y={y + barH / 2} dominantBaseline="middle" textAnchor="end">{r.label}</text>
              {d && <path d={d} fill="var(--mark)" />}
              <text className="val" x={labelW + w + 8} y={y + barH / 2} dominantBaseline="middle">{`${r.value}${unit}`}</text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

// ─── Logos ────────────────────────────────────────────────────────────

function TesMark({ accent }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 88V52L52 28" stroke="#121212" />
        <path d="M56 88V62L78 40" stroke={accent} />
      </g>
      <circle cx="78" cy="40" r="7" fill={accent} />
    </svg>
  )
}

function EkcMark() {
  return (
    <svg viewBox="5 45 99 128" aria-hidden="true">
      <circle cx="34" cy="112" r="37" fill="#4FB4E8" />
      <circle cx="76" cy="82" r="25" fill="#FFC94A" />
      <circle cx="70" cy="132" r="34" fill="#F5A623" />
      <circle cx="30" cy="152" r="20" fill="#C6B4EC" />
    </svg>
  )
}

// ─── Slide ────────────────────────────────────────────────────────────

function Slide({ slide, index, total, deck, color, kids, portrait, showOverflow }) {
  const ref = useRef(null)
  const [overflow, setOverflow] = useState(false)
  useLayoutEffect(() => {
    if (!showOverflow || !ref.current) return
    const body = ref.current.querySelector('.dk-body')
    setOverflow(Boolean(body && body.scrollHeight > body.clientHeight + 2))
  })

  const isCover = slide.layout === 'cover'
  const footer = deck.data?.footer || `${BRAND_FOOTER[deck.scope]} // ${String(deck.title || '').replace(/\*/g, '')}`
  const page = String(index + 1).padStart(2, '0')
  const blocks = (slide.blocks || []).map((b) => <Block key={b.id} block={b} portrait={portrait} />)

  return (
    <section ref={ref} className={`dk-slide ${isCover ? 'dk-cover' : ''}`} data-slide={index}>
      {kids && (
        <>
          <span className="dk-blob" style={{ width: 180, height: 180, top: -70, right: -50, background: color.light }} />
          <span className="dk-blob" style={{ width: 110, height: 110, bottom: -40, left: -30, background: '#4FB4E8', opacity: 0.25 }} />
        </>
      )}
      {showOverflow && overflow && <span className="dk-overflow dk-noprint">⚠ El contenido no entra en la hoja</span>}

      {isCover ? (
        <>
          <span className="dk-logo">{kids ? <EkcMark /> : <TesMark accent={color.accent} />}</span>
          <div className="dk-body">
            {slide.kicker && <p className="dk-cover-kicker">{slide.kicker}</p>}
            <h1 className="dk-cover-title">{inline(slide.title || deck.title)}</h1>
            {slide.subtitle && <p className="dk-cover-sub">{inline(slide.subtitle)}</p>}
            {(deck.student || slide.tag) && (
              <div className="dk-meta">
                {deck.student && <span>{kids ? '🧒' : '👤'} {deck.student}</span>}
                {slide.tag && slide.tag.split(',').map((t) => t.trim()).filter(Boolean).map((t) => <span key={t}>{t}</span>)}
              </div>
            )}
            {blocks}
          </div>
        </>
      ) : (
        <>
          <header className="dk-head">
            <div style={{ minWidth: 0 }}>
              {slide.kicker && <p className="dk-kicker">{slide.kicker}</p>}
              <h2 className="dk-title">{inline(slide.title)}</h2>
            </div>
            {slide.tag && <span className="dk-tag">{slide.tag}</span>}
          </header>
          <div className="dk-body">{blocks}</div>
        </>
      )}

      <footer className="dk-foot">
        <span className="dk-brand">
          {kids ? <EkcMark /> : <TesMark accent={color.accent} />}
          {footer}
        </span>
        <span>
          {kids ? 'Página' : 'PAGE'} <b>{page}</b> / {String(total).padStart(2, '0')}
        </span>
      </footer>
    </section>
  )
}

// `only` (opcional): índice de una sola slide a dibujar (vista previa).
export default function DeckRenderer({ deck, only = null, showOverflow = false }) {
  useDeckFonts()
  const kids = deck.scope === 'infancias'
  const portrait = deck.kind === 'glossary'
  const color = resolveColor(deck.scope, deck.color_key)
  const slides = deck.data?.slides || []
  const vars = {
    '--accent': color.accent,
    '--accent-light': color.light || color.accent,
    '--mark': color.mark || color.accent,
    '--accent-soft': `color-mix(in srgb, ${color.light || color.accent} ${kids ? 22 : 11}%, white)`,
  }
  const list = only == null ? slides.map((s, i) => [s, i]) : slides[only] ? [[slides[only], only]] : []

  return (
    <div className={`dk ${kids ? 'dk--ekc' : 'dk--tes'} ${portrait ? 'dk--portrait' : ''}`} style={vars}>
      <style>{DECK_CSS}</style>
      {list.map(([slide, i]) => (
        <Slide
          key={slide.id || i}
          slide={slide}
          index={i}
          total={slides.length}
          deck={deck}
          color={color}
          kids={kids}
          portrait={portrait}
          showOverflow={showOverflow}
        />
      ))}
    </div>
  )
}

// Envuelve el renderer y lo escala para que entre en el ancho disponible
// (las slides miden una hoja A4 real).
export function ScaledDeck({ deck, only = null, showOverflow = false, maxScale = 1 }) {
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(0.5)
  const pageW = deck.kind === 'glossary' ? 794 : 1123
  const pageH = deck.kind === 'glossary' ? 1123 : 794
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const update = () => setScale(Math.min(maxScale, el.clientWidth / pageW))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pageW, maxScale])
  const count = only == null ? (deck.data?.slides || []).length : 1
  const height = (count * pageH + Math.max(0, count - 1) * 28) * scale
  return (
    <div ref={wrapRef} style={{ width: '100%', height, overflow: 'hidden' }}>
      <div style={{ width: pageW, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <DeckRenderer deck={deck} only={only} showOverflow={showOverflow} />
      </div>
    </div>
  )
}
