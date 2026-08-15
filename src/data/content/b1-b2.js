// Contenido de ejemplo para B1·B2, organizado por track y temario (ver
// src/data/themes.js). La forma es THEMES_CONTENT[trackSlug][temarioSlug] =
// { flashcards, quiz, listenings, readingWriting }. No hace falta declarar
// las combinaciones vacías: lo que falta se completa solo (ver
// src/data/contentIndex.js). Reemplazá este contenido por el real — la
// estructura (nombres de campos) tiene que mantenerse igual.

// Business English → Foundations — de momento el único temario con
// contenido de muestra (phrasal verbs y vocabulario de ámbito laboral).
const businessEnglishFoundations = {
  flashcards: [
    { id: 1, front: 'to catch up', back: 'ponerse al día' },
    { id: 2, front: 'in the long run', back: 'a largo plazo' },
    { id: 3, front: 'to make up your mind', back: 'decidirse' },
    { id: 4, front: 'worthwhile', back: 'que vale la pena' },
    { id: 5, front: 'to bring up', back: 'mencionar / criar (un tema o un hijo)' },
    { id: 6, front: 'overwhelmed', back: 'abrumado/a' },
  ],

  quiz: {
    title: 'Cuestionario (ejemplo) · Phrasal verbs cotidianos',
    questions: [
      {
        id: 1,
        q: 'I need to ___ with my emails before the trip.',
        options: ['catch up', 'bring up', 'look forward'],
        answer: 0,
      },
      {
        id: 2,
        q: '¿Qué significa "to make up your mind"?',
        options: ['Olvidarse de algo', 'Decidirse', 'Enojarse'],
        answer: 1,
      },
      {
        id: 3,
        q: 'She felt completely ___ after her first week at the new job.',
        options: ['worthwhile', 'overwhelmed', 'caught up'],
        answer: 1,
      },
    ],
  },

  listenings: [
    {
      id: 1,
      title: 'Listening (ejemplo) · A short interview',
      youtubeId: '', // pegá acá el ID del video de YouTube, ej: "dQw4w9WgXcQ"
      transcript:
        `Interviewer: So, what made you decide to move abroad?\nGuest: Honestly, it wasn't a easy decision. I'd been thinking about it for years, but I finally made up my mind after I visited a friend who'd done the same thing.\nInterviewer: And has it been worthwhile?\nGuest: Definitely. It was overwhelming at first, but in the long run, it's the best decision I've made.`,
      questions: [
        {
          id: 1,
          q: '¿Por qué el invitado finalmente se decidió a mudarse?',
          options: ['Por trabajo', 'Después de visitar a una amiga', 'Por casualidad'],
          answer: 1,
        },
        {
          id: 2,
          q: 'Según el invitado, ¿valió la pena la decisión?',
          options: ['No, se arrepiente', 'Sí, a largo plazo', 'Todavía no lo sabe'],
          answer: 1,
        },
      ],
    },
  ],

  readingWriting: [
    {
      id: 1,
      type: 'reading',
      title: 'Reading (ejemplo) · Remote work',
      text:
        `Remote work has changed the way many people think about their careers. For some, it means more flexibility and a better work-life balance. For others, it can bring up new challenges, like staying motivated without a fixed routine or feeling isolated from colleagues.\n\nCompanies that have embraced remote work often say that, in the long run, it has helped them attract talent from different parts of the world. Still, plenty of managers admit it took time to make up their minds about whether the shift was truly worthwhile.`,
      questions: [
        { id: 1, q: '¿Qué desafío menciona el texto sobre el trabajo remoto?', type: 'short' },
        { id: 2, q: '¿Qué beneficio obtienen las empresas a largo plazo, según el texto?', type: 'short' },
      ],
    },
    {
      id: 2,
      type: 'writing',
      title: 'Writing (ejemplo) · Tu opinión',
      prompt:
        'Escribí un párrafo (80-120 palabras) dando tu opinión sobre el trabajo remoto. Usá al menos dos de las expresiones vistas en las flashcards de esta unidad (por ejemplo: "in the long run", "worthwhile", "overwhelmed").',
    },
  ],
}

export const THEMES_CONTENT = {
  'business-english': {
    foundations: businessEnglishFoundations,
  },
}
