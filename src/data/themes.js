// Tracks de Adultos — sacados 1:1 del CSS real de la landing de cursos
// (courses/index.html: variables --be/--ec/--ep/--sp), no son una paleta
// inventada. En la landing cada card de curso tiene una franja de 4px del
// color de su track; acá pasa lo mismo en todo lo que pertenece al track.
//
// A diferencia de los grupos de Kids Club, los tracks NO son una progresión
// secuencial — son especializaciones en paralelo, cada alumno elige la que
// le sirve. Cada track sí tiene una progresión interna de 2-3 sub-niveles
// (ver "progression" más abajo), aunque el cuaderno todavía no modela esos
// sub-niveles como pantallas propias.
//
// La landing también tiene Business Spanish (#C47A0B) — curso de español
// para extranjeros, público distinto al de este cuaderno de inglés, así que
// queda afuera de este bloque.
//
// English for Developers y English for Travel son la excepción: no vienen
// de la landing de cursos (esos públicos hoy no están ahí), se agregaron a
// pedido para inglés de uso cotidiano fuera del ámbito de examen/oficina/
// creativo. Developers usa el violeta (#6B3FA0, color de Survival Spanish
// en la landing) y Travel usa el dorado (#C47A0B, color de Business Spanish
// en la landing) — acá no hay conflicto porque esos cursos de español no
// forman parte de este cuaderno.

// Cada track tiene su propia clave de acceso, compartida entre los alumnos
// de ESE curso — no hay clave por nivel. Un alumno de Business English usa
// la misma clave sin importar si está viendo el track en A1-A2, B1-B2 o
// C1-C2 (el desbloqueo queda guardado por track, no por nivel+track).
//
// Dentro de cada track hay "temarios": unidades de vocabulario/situación
// concreta (ej. Foundations, Client Communication). Ahí adentro viven las
// flashcards/cuestionario/listening/reading&writing. Para Business English,
// English for Creatives y Special Courses los temarios son 1:1 los
// sub-cursos reales de la landing. Exam Preparation es la excepción: en la
// landing sus 3 "niveles" son ritmos de cursada (3 meses antes / sprint /
// modo emergencia), no vocabulario distinto, así que ahí los temarios se
// armaron por destreza de examen (Reading/Listening/Writing/Speaking).
export const THEMES = [
  {
    slug: 'business-english',
    name: 'Business English',
    description: 'Reuniones, mails y comunicación profesional en el trabajo — de cero a liderar reuniones y hacer networking internacional.',
    progression: 'Foundations → Professional Communication → Advanced Business',
    color: 'brand', // #1B3FA0
    passcode: 'oficina24',
    temarios: [
      { slug: 'foundations', name: 'Foundations', description: 'Sobrevivir en un entorno laboral en inglés: básicos para el día a día.' },
      { slug: 'professional-communication', name: 'Professional Communication', description: 'Reuniones activas, reportes y mails.' },
      { slug: 'advanced-business', name: 'Advanced Business', description: 'Liderar reuniones, presentaciones y networking internacional.' },
    ],
  },
  {
    slug: 'english-for-creatives',
    name: 'English for Creatives',
    description: 'Inglés para diseñadores y creativos: vocabulario de proceso, comunicación con clientes y networking de industria.',
    progression: 'Creative Basics → Client Communication → Industry English',
    color: 'stamp', // #B03A2E
    passcode: 'estudio24',
    temarios: [
      { slug: 'creative-basics', name: 'Creative Basics', description: 'Vocabulario de diseño: describí tu trabajo y tu proceso.' },
      { slug: 'client-communication', name: 'Client Communication', description: 'Propuestas, briefings y feedback con clientes internacionales.' },
      { slug: 'industry-english', name: 'Industry English', description: 'Pitches, portfolio reviews y networking de industria.' },
    ],
  },
  {
    slug: 'exam-prep',
    name: 'Exam Preparation',
    description: 'Preparación para un examen internacional, con la intensidad ajustada al tiempo que te queda: desde 3 meses antes hasta modo emergencia.',
    progression: '3 months before → 1 month (Sprint) → Emergency mode',
    color: 'olive', // #1A7A4A
    passcode: 'examen24',
    temarios: [
      { slug: 'reading-use-of-english', name: 'Reading & Use of English', description: 'Comprensión de textos y gramática en contexto de examen.' },
      { slug: 'listening', name: 'Listening', description: 'Comprensión auditiva con el formato típico de examen.' },
      { slug: 'writing', name: 'Writing', description: 'Producción escrita: ensayos, cartas e informes según el examen.' },
      { slug: 'speaking', name: 'Speaking', description: 'Simulacros de la parte oral del examen.' },
    ],
  },
  {
    slug: 'special-courses',
    name: 'Special Courses',
    description: 'Cursos cortos y puntuales: entrevistas técnicas en inglés y contenido para redes sociales/creadores.',
    progression: 'English for Tech Interviews · English for Creators',
    color: 'pink', // #A0396B
    passcode: 'especial24',
    temarios: [
      { slug: 'tech-interviews', name: 'English for Tech Interviews', description: 'Mock interviews, vocabulario técnico, hablar de código con confianza.' },
      { slug: 'creators', name: 'English for Creators', description: 'Captions, guiones, pitches y DMs para redes.' },
    ],
  },
  {
    slug: 'english-for-developers',
    name: 'English for Developers',
    description: 'Inglés de uso cotidiano en equipos de desarrollo: code reviews, standups y comunicación async con el equipo.',
    progression: 'Code Reviews & PRs → Standups & Meetings → Docs & Async Comms',
    color: 'violet', // #6B3FA0
    passcode: 'codigo24',
    temarios: [
      { slug: 'code-reviews-prs', name: 'Code Reviews & PRs', description: 'Dar y recibir feedback sobre código, comentar pull requests con claridad.' },
      { slug: 'standups-meetings', name: 'Standups & Meetings', description: 'Daily standups, sprint planning y reuniones técnicas en inglés.' },
      { slug: 'docs-async-comms', name: 'Docs & Async Comms', description: 'Documentación técnica, mensajes en Slack/Jira y comunicación asincrónica con el equipo.' },
    ],
  },
  {
    slug: 'english-for-travel',
    name: 'English for Travel',
    description: 'Inglés práctico para viajar: aeropuertos, alojamiento, moverte y resolver imprevistos en otro país.',
    progression: 'Airports & Check-in → Hotels & Getting Around → Eating Out & Emergencies',
    color: 'gold', // #C47A0B
    passcode: 'viaje24',
    temarios: [
      { slug: 'airports-checkin', name: 'Airports & Check-in', description: 'Check-in, seguridad, migraciones y embarque sin sorpresas.' },
      { slug: 'hotels-getting-around', name: 'Hotels & Getting Around', description: 'Alojamiento, transporte público y pedir indicaciones.' },
      { slug: 'eating-out-emergencies', name: 'Eating Out & Emergencies', description: 'Restaurantes, compras y resolver imprevistos (salud, pérdidas, cambios de planes).' },
    ],
  },
]

export const getTheme = (slug) => THEMES.find((t) => t.slug === slug)

export const getTemario = (themeSlug, temarioSlug) =>
  getTheme(themeSlug)?.temarios.find((t) => t.slug === temarioSlug)

// Mapa de color de track → clases Tailwind completas (el JIT necesita
// strings literales). Se usa en TODO lo que pertenece a un track —
// encabezado, íconos, borde superior de tarjetas, etiquetas, botones —
// para que el color se reconozca de un vistazo, igual que en la landing.
// El feedback de correcto/incorrecto en los cuestionarios se mantiene
// siempre en verde/rojo semántico (olive/stamp), sin importar el color
// del track.
export const THEME_COLORS = {
  brand: {
    border: 'border-t-brand',
    borderT4: 'border-t-4 border-t-brand',
    borderL8: 'border-l-8 border-l-brand',
    tag: 'text-brand border-brand',
    icon: 'text-brand',
    hoverBg: 'hover:bg-brand',
    hoverText: 'hover:text-brand',
    focusBorder: 'focus:border-brand',
  },
  stamp: {
    border: 'border-t-stamp',
    borderT4: 'border-t-4 border-t-stamp',
    borderL8: 'border-l-8 border-l-stamp',
    tag: 'text-stamp border-stamp',
    icon: 'text-stamp',
    hoverBg: 'hover:bg-stamp',
    hoverText: 'hover:text-stamp',
    focusBorder: 'focus:border-stamp',
  },
  olive: {
    border: 'border-t-olive',
    borderT4: 'border-t-4 border-t-olive',
    borderL8: 'border-l-8 border-l-olive',
    tag: 'text-olive border-olive',
    icon: 'text-olive',
    hoverBg: 'hover:bg-olive',
    hoverText: 'hover:text-olive',
    focusBorder: 'focus:border-olive',
  },
  pink: {
    border: 'border-t-pink',
    borderT4: 'border-t-4 border-t-pink',
    borderL8: 'border-l-8 border-l-pink',
    tag: 'text-pink border-pink',
    icon: 'text-pink',
    hoverBg: 'hover:bg-pink',
    hoverText: 'hover:text-pink',
    focusBorder: 'focus:border-pink',
  },
  violet: {
    border: 'border-t-violet',
    borderT4: 'border-t-4 border-t-violet',
    borderL8: 'border-l-8 border-l-violet',
    tag: 'text-violet border-violet',
    icon: 'text-violet',
    hoverBg: 'hover:bg-violet',
    hoverText: 'hover:text-violet',
    focusBorder: 'focus:border-violet',
  },
  gold: {
    border: 'border-t-gold',
    borderT4: 'border-t-4 border-t-gold',
    borderL8: 'border-l-8 border-l-gold',
    tag: 'text-gold border-gold',
    icon: 'text-gold',
    hoverBg: 'hover:bg-gold',
    hoverText: 'hover:text-gold',
    focusBorder: 'focus:border-gold',
  },
}
