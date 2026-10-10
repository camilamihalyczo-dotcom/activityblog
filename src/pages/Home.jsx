import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, Newspaper } from 'lucide-react'
import { MARKETING_SITES } from '../lib/contact.js'

// Portada del Activity Blog: dos mitades, cada una vestida con su marca.
// - Adultos → Track English Studio (misma estética que su landing).
// - Infancias → English Kids Club (misma estética que su landing).
// Así cada alumno reconoce de un vistazo cuál es su lado.

const TES_TRACKS = [
  ['T01', '#4338CA'],
  ['T02', '#7C3AED'],
  ['T03', '#15803D'],
  ['T04', '#A21CAF'],
  ['T05', '#C2410C'],
  ['T06', '#B45309'],
  ['T07', '#0D9488'],
  ['T08', '#9F1239'],
]

const EKC_LEVELS = [
  ['Primeros Pasos', '#FFC94A'],
  ['Exploradores', '#5FC98D'],
  ['Aventureros', '#4FB4E8'],
  ['Teens', '#9B7EDE'],
]

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

function AdultosSide() {
  return (
    <section
      aria-labelledby="home-adultos"
      className="relative flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-14 lg:py-20 bg-[#FBF9F4] text-[#121212] bg-[radial-gradient(#E4DED0_1px,transparent_1px)] [background-size:20px_20px]"
    >
      <div className="max-w-xl w-full mx-auto lg:mx-0 lg:ml-auto">
        <div className="flex items-center gap-3 mb-10">
          <TesMark className="w-9 h-9" />
          <span className="font-display uppercase text-2xl tracking-wide leading-none">
            TRACK ENGLISH <i className="font-accent normal-case text-xl text-[#1C39BB] tracking-normal">studio.</i>
          </span>
        </div>

        <p className="font-tesMono text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#1C39BB] mb-4">
          Adultos · Campus Activity Blog
        </p>
        <h2 id="home-adultos" className="font-display uppercase text-[3.4rem] sm:text-7xl leading-[0.92] mb-6">
          Tu práctica,
          <br />
          entre clase y{' '}
          <span className="font-accent italic font-black text-[#1C39BB] normal-case tracking-normal">clase.</span>
        </h2>
        <p className="font-tesBody text-[#4A4A4A] text-base sm:text-lg leading-relaxed mb-8 max-w-md">
          Flashcards, cuestionarios, listening y ejercicios armados con lo que trabajamos en tu track. Desde la compu o el
          celular.
        </p>

        <Link
          to="/adultos"
          className="inline-flex items-center gap-2 font-tesMono text-xs font-bold uppercase tracking-[0.12em] bg-[#1C39BB] text-[#FBF9F4] border-2 border-[#121212] rounded-full px-6 py-3.5 shadow-[4px_4px_0_#121212] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#121212] transition-all"
        >
          Entrar · elegí tu nivel <ArrowRight size={16} aria-hidden="true" />
        </Link>

        <div className="flex items-center gap-5 mt-7 font-tesMono text-[11px] font-bold uppercase tracking-[0.12em]">
          <Link to="/adultos/blog" className="inline-flex items-center gap-1.5 border-b-2 border-[#121212] pb-0.5 hover:text-[#1C39BB] hover:border-[#1C39BB]">
            <Newspaper size={13} aria-hidden="true" /> Blog
          </Link>
          <a
            href={MARKETING_SITES.adultos}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-b-2 border-[#121212] pb-0.5 hover:text-[#1C39BB] hover:border-[#1C39BB]"
          >
            Track English Studio <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-12 pt-5 border-t-2 border-[#121212]">
          <p className="font-tesMono text-[10px] uppercase tracking-[0.14em] text-[#4A4A4A] mb-3">8 tracks</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Tracks">
            {TES_TRACKS.map(([code, color]) => (
              <li key={code} className="flex items-center gap-1.5 font-tesMono text-[11px] font-bold" style={{ color }}>
                <span className="w-1 h-4 rounded-full" style={{ background: color }} aria-hidden="true" />
                {code}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function InfanciasSide() {
  return (
    <section
      aria-labelledby="home-infancias"
      className="relative overflow-hidden flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-14 lg:py-20 bg-[#FFFBF2] text-[#2E2A4A]"
    >
      {/* Burbujas decorativas como en el hero de la landing. */}
      <span className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#FFC94A]/35" aria-hidden="true" />
      <span className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#4FB4E8]/25" aria-hidden="true" />
      <span className="absolute top-1/3 right-10 w-10 h-10 rounded-full bg-[#9B7EDE]/40" aria-hidden="true" />

      <div className="relative max-w-xl w-full mx-auto lg:mx-0 lg:mr-auto">
        <img src="/brand/logo-ekc-horizontal.svg" alt="English Kids Club" className="h-7 sm:h-8 w-auto mb-10" />

        <span className="inline-block font-playful font-semibold text-[11px] sm:text-xs uppercase tracking-wide bg-[#FFC94A] rounded-full px-4 py-1.5 mb-5">
          Para infancias y adolescentes 🎈
        </span>
        <h2 id="home-infancias" className="font-body font-extrabold uppercase text-[2.6rem] sm:text-6xl leading-[1.02] mb-6">
          Inglés para{' '}
          <span className="bg-[linear-gradient(transparent_60%,#FFC94A_60%)] px-1">jugar</span>
          <br />
          entre clases
        </h2>
        <p className="font-playful text-[#2E2A4A]/75 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
          Flashcards, juegos de palabras, canciones y actividades de tu grupo, para repasar en casa todo lo que vemos.
        </p>

        <Link
          to="/infancias"
          className="inline-flex items-center gap-2 font-playful font-semibold text-base bg-[#1F8A55] text-white rounded-full px-6 py-3.5 shadow-[0_8px_20px_rgba(31,138,85,0.3)] hover:-translate-y-0.5 transition-transform"
        >
          🎮 Entrar · elegí tu grupo
        </Link>

        <div className="flex items-center gap-5 mt-7 font-playful font-semibold text-sm">
          <Link to="/infancias/blog" className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-2 decoration-[#FFC94A] hover:text-[#7B57C9]">
            <Newspaper size={14} aria-hidden="true" /> Blog
          </Link>
          <a
            href={MARKETING_SITES.infancias}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-2 decoration-[#FFC94A] hover:text-[#7B57C9]"
          >
            English Kids Club <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-12">
          <p className="font-playful font-semibold text-[11px] uppercase tracking-wide text-[#2E2A4A]/60 mb-3">4 niveles</p>
          <ul className="flex flex-wrap gap-2" aria-label="Niveles">
            {EKC_LEVELS.map(([name, color]) => (
              <li key={name} className="font-playful font-semibold text-xs rounded-full px-3 py-1.5 bg-white shadow-[0_4px_12px_rgba(46,42,74,0.08)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <h1 className="sr-only">Activity Blog — material de práctica de Track English Studio y English Kids Club</h1>
      <div className="flex-1 grid lg:grid-cols-2">
        <AdultosSide />
        <InfanciasSide />
      </div>
    </main>
  )
}
