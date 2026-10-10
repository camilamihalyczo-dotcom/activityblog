import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, Newspaper } from 'lucide-react'
import { MARKETING_SITES } from '../lib/contact.js'

// Portada del Activity Blog: título centrado y dos tarjetas lado a lado,
// cada una con la estética de su marca (Track English Studio para Adultos,
// English Kids Club para Infancias). Debajo de cada tarjeta, los links al
// blog y a la landing correspondiente. Las "Sugerencias" son el pie común
// del sitio (Footer).

function TesMark({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="none" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 88V52L52 28" stroke="#121212" />
        <path d="M56 88V62L78 40" stroke="#1C39BB" />
      </g>
      <circle cx="78" cy="40" r="7" fill="#1C39BB" />
    </svg>
  )
}

function CardLinks({ blogTo, siteHref, siteLabel, className }) {
  return (
    <div className={`flex items-center gap-6 mt-4 px-2 ${className}`}>
      <Link to={blogTo} className="inline-flex items-center gap-1.5 hover:underline underline-offset-4">
        <Newspaper size={14} aria-hidden="true" /> Blog
      </Link>
      <a href={siteHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline underline-offset-4">
        {siteLabel} <ExternalLink size={13} aria-hidden="true" />
      </a>
    </div>
  )
}

function AdultosCard() {
  return (
    <div className="flex flex-col">
      <Link
        to="/adultos"
        aria-label="Adultos — entrar"
        className="group flex-1 flex flex-col items-center text-center bg-[#FBF9F4] bg-[radial-gradient(#E4DED0_1px,transparent_1px)] [background-size:18px_18px] text-[#121212] border-2 border-[#121212] rounded-[28px] shadow-[6px_6px_0_#1C39BB] px-8 py-9 transition-transform hover:-translate-y-1"
      >
        <span className="flex items-center gap-2 mb-6">
          <TesMark className="w-7 h-7" />
          <span className="font-display uppercase text-lg tracking-wide leading-none">
            Track English <i className="font-accent normal-case text-base text-[#1C39BB] tracking-normal">studio.</i>
          </span>
        </span>
        <h2 className="font-display uppercase text-6xl leading-none mb-4">
          Adultos<span className="font-accent italic font-black text-[#1C39BB]">.</span>
        </h2>
        <p className="font-tesBody text-[#4A4A4A] leading-relaxed max-w-xs mb-7">
          Flashcards, cuestionarios y ejercicios armados con lo que trabajamos en tu track.
        </p>
        <span className="mt-auto inline-flex items-center gap-2 font-tesMono text-xs font-bold uppercase tracking-[0.12em] bg-[#1C39BB] text-[#FBF9F4] border-2 border-[#121212] rounded-full px-6 py-3 shadow-[3px_3px_0_#121212] group-hover:shadow-[5px_5px_0_#121212] transition-shadow">
          Entrar <ArrowRight size={15} aria-hidden="true" />
        </span>
      </Link>
      <CardLinks
        blogTo="/adultos/blog"
        siteHref={MARKETING_SITES.adultos}
        siteLabel="Track English Studio"
        className="font-tesMono text-[11px] font-bold uppercase tracking-[0.12em] text-[#121212]"
      />
    </div>
  )
}

function InfanciasCard() {
  return (
    <div className="flex flex-col">
      <Link
        to="/infancias"
        aria-label="Infancias y adolescentes — entrar"
        className="group relative overflow-hidden flex-1 flex flex-col items-center text-center bg-[#FFFBF2] text-[#2E2A4A] rounded-[28px] shadow-[0_10px_30px_rgba(46,42,74,0.10)] px-8 py-9 transition-transform hover:-translate-y-1"
      >
        <span className="absolute -top-16 -right-14 w-44 h-44 rounded-full bg-[#FFC94A]/35" aria-hidden="true" />
        <span className="absolute -bottom-16 -left-12 w-36 h-36 rounded-full bg-[#4FB4E8]/25" aria-hidden="true" />
        <img src="/brand/logo-ekc-horizontal.svg" alt="English Kids Club" className="relative h-6 w-auto mb-6" />
        <h2 className="relative font-body font-extrabold uppercase text-[2rem] sm:text-4xl leading-[1.05] mb-4">
          Infancias y{' '}
          <span className="bg-[linear-gradient(transparent_60%,#FFC94A_60%)] px-1">adolescentes</span>
        </h2>
        <p className="relative font-playful text-[#2E2A4A]/75 leading-relaxed max-w-xs mb-7">
          Flashcards, juegos y actividades de tu grupo para repasar en casa todo lo que vemos.
        </p>
        <span className="relative mt-auto inline-flex items-center gap-2 font-playful font-semibold bg-[#1F8A55] text-white rounded-full px-6 py-3 shadow-[0_8px_20px_rgba(31,138,85,0.3)]">
          🎮 Entrar
        </span>
      </Link>
      <CardLinks
        blogTo="/infancias/blog"
        siteHref={MARKETING_SITES.infancias}
        siteLabel="English Kids Club"
        className="font-playful font-semibold text-sm text-[#2E2A4A]"
      />
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-5 py-14 sm:py-16 bg-[#F7F4EE]">
      <p className="font-tesMono text-[11px] uppercase tracking-[0.25em] text-ink/50 mb-3">Material de práctica entre clases</p>
      <h1 className="font-body font-extrabold text-5xl sm:text-7xl text-ink tracking-tight mb-12 sm:mb-14 text-center">Activity Blog</h1>
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 w-full max-w-4xl">
        <AdultosCard />
        <InfanciasCard />
      </div>
    </main>
  )
}
