import { Link } from 'react-router-dom'
import { GraduationCap, Baby, Newspaper, ExternalLink } from 'lucide-react'
import { MARKETING_SITES } from '../lib/contact.js'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60 mb-4">Material de clase</p>
      <h1 className="font-display text-4xl sm:text-6xl text-ink mb-3 leading-[0.95]">
        ACTIVITY
        <br />
        <span className="font-accent italic text-brand text-3xl sm:text-5xl">Blog</span>
      </h1>
      <p className="text-ink/60 max-w-md mb-12">
        Flashcards, cuestionarios, listenings y ejercicios de reading &amp; writing para practicar entre clase y clase.
      </p>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl">
        <div className="relative flex-1 texture-card rounded-2xl p-8 pt-9 text-left hover:-translate-y-1 transition-transform overflow-hidden">
          {/* Franja con los colores de los 6 tracks de Adultos, ordenados
              por matiz (rojo → naranja → verde → azul → violeta → rosa)
              en vez del orden de THEMES, para que la transición sea suave
              como un arcoiris real y no salte de color en color. */}
          <span
            className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#B03A2E,#C47A0B,#1A7A4A,#1B3FA0,#6B3FA0,#A0396B)]"
            aria-hidden="true"
          />
          <Link to="/adultos" className="block">
            <GraduationCap className="text-brand mb-4" size={30} />
            <p className="font-display text-xl font-semibold text-ink mb-1">Adultos</p>
            <p className="text-ink/60 text-sm mb-4">Por nivel: A1/A2 · B1/B2 · C1/C2</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/adultos/blog"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border border-ink/20 rounded-full px-3 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors"
            >
              <Newspaper size={12} /> Blog
            </Link>
            <a
              href={MARKETING_SITES.adultos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border border-ink/20 rounded-full px-3 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors"
            >
              <ExternalLink size={12} /> Más info
            </a>
          </div>
        </div>

        <div className="relative flex-1 texture-card rounded-2xl p-8 pt-9 text-left hover:-translate-y-1 transition-transform overflow-hidden">
          {/* Franja con los 4 colores de nivel en orden de progresión
              (amarillo → verde → celeste → violeta), como resumen del
              "camino" completo de English Kids Club. */}
          <span
            className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#FFC94A,#5FC98D,#4FB4E8,#9B7EDE)]"
            aria-hidden="true"
          />
          <Link to="/infancias" className="block">
            <Baby className="text-kidsPurpleDeep mb-4" size={30} />
            <p className="font-display text-xl font-semibold text-ink mb-1">Infancias y adolescentes</p>
            <p className="text-ink/60 text-sm mb-4">Por grupo: Primeros Pasos · Exploradores · Aventureros · Teens</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/infancias/blog"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border border-ink/20 rounded-full px-3 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors"
            >
              <Newspaper size={12} /> Blog
            </Link>
            <a
              href={MARKETING_SITES.infancias}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border border-ink/20 rounded-full px-3 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors"
            >
              <ExternalLink size={12} /> Más info
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
