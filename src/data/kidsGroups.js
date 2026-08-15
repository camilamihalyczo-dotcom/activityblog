// Configuración de grupos para Infancias y adolescentes (English Kids Club).
// A diferencia de Adultos, acá los "niveles" son grupos por edad, no por
// nivel de idioma. Cada grupo tiene su propia clave de acceso y su propio
// set de temas habilitados (los más chicos todavía no tienen cuestionario
// ni reading/writing — se van sumando a medida que crecen).
// Para agregar contenido nuevo: editar el archivo correspondiente en
// /data/content/kids/*.js

export const GROUPS = [
  {
    slug: 'primeros-pasos',
    code: '4–6',
    name: 'Primeros Pasos',
    ageRange: '4–6 años',
    passcode: 'globo24',
    description: 'Juego puro: colores, números, animales y rutinas simples con mucho apoyo visual. Sin lectoescritura formal ni evaluación — solo vocabulario, canciones y repetición.',
    color: 'kidsYellow',
    colorDeep: 'kidsYellowDeep',
    milestone: 1,
    topics: ['flashcards', 'listening'],
  },
  {
    slug: 'exploradores',
    code: '7–9',
    name: 'Exploradores',
    ageRange: '7–9 años',
    passcode: 'brujula24',
    description: 'Primeras frases y phonics en formato de juego grupal: se presentan, cuentan qué les gusta y siguen historias cortas con preguntas y juegos de rol.',
    color: 'kidsGreen',
    colorDeep: 'kidsGreenDeep',
    milestone: 2,
    topics: ['flashcards', 'listening', 'cuestionario'],
  },
  {
    slug: 'aventureros',
    code: '10–12',
    name: 'Aventureros',
    ageRange: '10–12 años',
    passcode: 'mapa24',
    description: 'Gramática y conversación real sobre lo que les interesa (series, juegos, redes), con comprensión más exigente, mini proyectos y debate liviano.',
    color: 'kidsBlue',
    colorDeep: 'kidsBlueDeep',
    milestone: 3,
    topics: ['flashcards', 'cuestionario', 'listening', 'reading-writing'],
  },
  {
    slug: 'teens',
    code: '13–17',
    name: 'Teens',
    ageRange: '13–17 años',
    passcode: 'cumbre24teens',
    description: 'Writing más largo, speaking real y simulacros de examen, con pop culture y temas de actualidad — para un examen internacional o para perder el miedo a hablar.',
    color: 'kidsPurple',
    colorDeep: 'kidsPurpleDeep',
    milestone: 4,
    topics: ['flashcards', 'cuestionario', 'listening', 'reading-writing'],
  },
]

export const getGroup = (slug) => GROUPS.find((g) => g.slug === slug)

// Mapa de color de grupo → clases Tailwind completas (el JIT necesita
// strings literales, no se pueden armar con template strings dinámicos).
// Se usa en TODO lo que pertenece a un grupo — headers, íconos, bordes de
// tarjetas, numeritos de progreso, botones — para que el color de nivel se
// reconozca de un vistazo, igual que en la landing de English Kids Club.
export const KIDS_GROUP_COLORS = {
  kidsYellow: {
    borderT8: 'border-t-8 border-kidsYellowDeep',
    bg: 'bg-kidsYellowDeep',
    bgLight: 'bg-kidsYellow',
    text: 'text-kidsYellowDeep',
    hoverText: 'hover:text-kidsYellowDeep',
    hoverBg: 'hover:bg-kidsYellowDeep',
    outline: 'focus:outline-kidsYellowDeep',
  },
  kidsGreen: {
    borderT8: 'border-t-8 border-kidsGreenDeep',
    bg: 'bg-kidsGreenDeep',
    bgLight: 'bg-kidsGreen',
    text: 'text-kidsGreenDeep',
    hoverText: 'hover:text-kidsGreenDeep',
    hoverBg: 'hover:bg-kidsGreenDeep',
    outline: 'focus:outline-kidsGreenDeep',
  },
  kidsBlue: {
    borderT8: 'border-t-8 border-kidsBlueDeep',
    bg: 'bg-kidsBlueDeep',
    bgLight: 'bg-kidsBlue',
    text: 'text-kidsBlueDeep',
    hoverText: 'hover:text-kidsBlueDeep',
    hoverBg: 'hover:bg-kidsBlueDeep',
    outline: 'focus:outline-kidsBlueDeep',
  },
  kidsPurple: {
    borderT8: 'border-t-8 border-kidsPurpleDeep',
    bg: 'bg-kidsPurpleDeep',
    bgLight: 'bg-kidsPurple',
    text: 'text-kidsPurpleDeep',
    hoverText: 'hover:text-kidsPurpleDeep',
    hoverBg: 'hover:bg-kidsPurpleDeep',
    outline: 'focus:outline-kidsPurpleDeep',
  },
}
