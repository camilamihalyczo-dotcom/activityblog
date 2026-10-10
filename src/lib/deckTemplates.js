// Plantillas de clase modelo (1–4) y de glosario. Cada una arma la
// estructura de slides con bloques de ejemplo que después se editan en el
// panel. Basadas en cómo venías armando tus clases (roadmap, warm-up
// contrastivo, core theory, grammar, sandbox, pronunciation lab, misión
// del sábado, assignments).
import { genId } from './deckThemes.js'

const b = (type, data) => ({ id: genId(), type, ...data })
const s = (data) => ({ id: genId(), layout: 'content', kicker: '', title: '', tag: '', blocks: [], ...data })

const card = (label, title, text) => ({ label, title, text })
const word = (w, phonetic, translation, definition, example) => ({ word: w, phonetic, translation, definition, example })

function cover(kids, extra = {}) {
  return s({
    layout: 'cover',
    kicker: kids ? 'English Kids Club · Unit 1' : 'Track // Module 1',
    title: kids ? 'My *amazing* day' : 'Class 01: *Topic* of the session',
    subtitle: kids
      ? 'Hoy vamos a aprender a contar qué hacemos durante el día.'
      : 'Una línea que resuma qué vas a poder hacer al terminar la clase.',
    tag: kids ? 'Nivel: Explorers' : 'Focus: …',
    blocks: [
      b('cards', {
        items: kids
          ? [card('Vocabulary', 'Daily routines', 'wake up, brush my teeth…'), card('Grammar', 'Present simple', 'I play / She plays'), card('Game', 'Guess the action', '¡Mímica en inglés!')]
          : [card('Input 01', 'Key skill one', 'Breve descripción'), card('Input 02', 'Key skill two', 'Breve descripción'), card('Goal', 'Live roleplay', 'Qué van a practicar al final')],
      }),
    ],
    ...extra,
  })
}

const roadmap = (kids, items) =>
  s({
    kicker: kids ? "Today's plan" : 'Session Roadmap',
    title: kids ? 'What we will *do* today' : 'Session *schedule*',
    tag: kids ? '45 min' : '60 min',
    blocks: [b('roadmap', { items })],
  })

const warmup = (kids) =>
  s({
    kicker: kids ? 'Warm-up' : 'Step 01 // Warm-up',
    title: kids ? "Let's *start*!" : 'The friction *test*',
    tag: kids ? 'Game' : 'Contrastive analysis',
    blocks: kids
      ? [b('callout', { label: 'Question time', text: 'What do you do in the morning? 🌞\n¿Qué hacés a la mañana?' }), b('image', { url: '', caption: 'Imagen para describir' })]
      : [
          b('text', { text: 'Contexto breve del ejercicio de apertura.' }),
          b('compare', {
            wrongLabel: 'Versión directa / literal',
            wrong: 'Send me the documents right now.',
            wrongNote: '**Impacto:** suena imperativo y genera fricción.',
            rightLabel: 'Versión diplomática / profesional',
            right: "I'm following up on the documents we discussed.",
            rightNote: '**Impacto:** mantiene la relación y es claro.',
          }),
        ],
  })

const theory = (kids, n = 1) =>
  s({
    kicker: kids ? 'Learn' : `Core Theory // Unit ${n}`,
    title: kids ? 'New *words*' : 'Core *framework*',
    tag: kids ? 'Vocabulary' : 'Framework',
    blocks: kids
      ? [b('vocab', { items: [word('wake up', 'ueik ap', 'despertarse', '', 'I wake up at 7.'), word('brush', 'brash', 'cepillar', '', 'I brush my teeth.'), word('have breakfast', 'jav brékfast', 'desayunar', '', 'I have breakfast with my mum.')] })]
      : [
          b('cards', {
            items: [
              card('Step 1', 'Opener', 'Cómo arrancar.\n- *Example phrase*'),
              card('Step 2', 'Context', 'Por qué importa.\n- *Example phrase*'),
              card('Step 3', 'Action', 'Qué se pide.\n- *Example phrase*'),
              card('Step 4', 'Close', 'Cómo cerrar.\n- *Example phrase*'),
            ],
          }),
        ],
  })

const grammar = (kids) =>
  s({
    kicker: kids ? 'Grammar' : 'Grammar Scaffold',
    title: kids ? 'How it *works*' : 'Tenses in *action*',
    tag: kids ? 'Rule' : 'Structure',
    blocks: kids
      ? [b('table', { text: 'I / You / We / They | He / She / It\nI **play** | She **plays**\nI **eat** | He **eats**' }), b('callout', { label: 'Tip', text: 'Con he / she / it agregamos **-s** al verbo.' })]
      : [b('table', { text: 'Tense | Structure | Example\nPresent Continuous | am/is/are + -ing | We are reviewing the logs.\nPast Simple | verb + -ed | We fixed the issue yesterday.\nFuture (will) | will + verb | I will send the report today.' })],
  })

const errorRule = (kids) =>
  s({
    kicker: kids ? 'Watch out!' : 'Grammar Drill // Fixed Rule',
    title: kids ? 'Oops! *Fix it*' : 'The preposition + *-ING* rule',
    tag: kids ? 'Rule' : 'Error vs. rule',
    blocks: [
      b('errorRule', {
        mode: 'rule',
        items: kids
          ? [
              { rule: 'HE / SHE / IT + VERB-S', badge: 'Rule', correct: 'She **plays** football.', error: 'She play football.' },
              { rule: 'I AM + AGE', badge: 'Rule', correct: 'I **am** ten years old.', error: 'I have ten years.' },
            ]
          : [
              { rule: 'INSTEAD OF + [VERB-ING]', badge: 'Regla nativa', correct: 'Instead of **calling** them directly, I sent a formal email.', error: 'Instead of to call them…' },
              { rule: 'RESPONSIBLE FOR + [VERB-ING]', badge: 'Regla nativa', correct: 'I am responsible for **coordinating** customs clearances.', error: 'Responsible for coordinate…' },
              { rule: 'BEFORE / AFTER + [VERB-ING]', badge: 'Regla nativa', correct: 'Please verify the figures before **sending** the report.', error: 'Before to send the report…' },
            ],
      }),
    ],
  })

const dataSlide = (kids) =>
  s({
    kicker: kids ? 'Survey' : 'Data talk',
    title: kids ? 'Our class *survey*' : 'Describing *data*',
    tag: kids ? 'Chart' : 'Chart',
    blocks: [
      b('chart', {
        title: kids ? 'Favourite sports in our class' : 'Where we use English at work',
        unit: kids ? '' : '%',
        text: kids ? 'Football | 8\nSwimming | 5\nBasketball | 4\nTennis | 2' : 'Meetings | 45\nEmails | 30\nPresentations | 15\nCalls | 10',
      }),
      b('callout', { label: kids ? 'Ask' : 'Useful language', text: kids ? 'What is the most popular sport?' : 'The majority of… · Almost a third… · Only a small share…' }),
    ],
  })

const imageTextSlide = (kids) =>
  s({
    kicker: kids ? 'Look' : 'Visual context',
    title: kids ? 'Look and *say*' : 'Picture *description*',
    tag: kids ? 'Picture' : 'Speaking',
    blocks: [b('imageText', { url: '', caption: '', side: 'left', text: kids ? '- What can you see?\n- What colour is it?\n- Where is it?' : '- What is happening in the picture?\n- What might have happened before?\n- What would you do in this situation?' })],
  })

const practice = (kids) =>
  s({
    kicker: kids ? 'Practice' : 'Interactive Sandbox',
    title: kids ? 'Your *turn*!' : 'Error *correction*',
    tag: kids ? 'Activity' : 'Drill',
    blocks: kids
      ? [b('cards', { items: [card('1', 'Draw', 'Dibujá tu rutina y contala.'), card('2', 'Match', 'Uní cada acción con su imagen.'), card('3', 'Say it', 'Contale a tu compañero tu mañana.')] })]
      : [
          b('text', { text: 'Corregí las oraciones con las reglas de la clase:' }),
          b('roadmap', { items: [{ title: 'I am agree with you.', text: '→ I agree with you.', tag: 'Fix' }, { title: 'We discussed about the plan.', text: '→ We discussed the plan.', tag: 'Fix' }] }),
        ],
  })

const pronunciation = (kids) =>
  s({
    kicker: kids ? 'Say it right' : 'Pronunciation Lab',
    title: kids ? 'Sounds *fun*' : 'Spanish *phonetics* guide',
    tag: kids ? 'Listen & repeat' : 'Glossary & drills',
    blocks: [
      b('vocab', {
        items: kids
          ? [word('three', 'zrii', 'tres', 'La lengua entre los dientes.', ''), word('ship', 'ship', 'barco', 'Sonido corto.', ''), word('sheep', 'shiip', 'oveja', 'Sonido largo.', '')]
          : [word('Should', 'shud', 'deberíamos', 'La "l" es muda.', 'We should roll back.'), word('Due to', 'diu tu', 'debido a', 'Conector formal de causa.', 'Delayed due to congestion.'), word('Outage', 'AU-tij', 'caída del servicio', 'Acento en la primera sílaba.', 'A 40-minute outage.')],
      }),
    ],
  })

const mission = (kids) =>
  s({
    kicker: kids ? 'Mission' : 'Mission Briefing',
    title: kids ? 'Super *challenge*' : 'Live *roleplay*',
    tag: kids ? '⭐ Challenge' : 'Next session',
    blocks: kids
      ? [b('callout', { label: 'Your mission', text: 'Grabá un audio contando tu día en inglés y mostralo en la próxima clase. 🎤' })]
      : [b('callout', { label: 'Scenario', text: 'Describí el escenario del roleplay: quién llama, qué problema hay y qué tiene que lograr el alumno.' }), b('cards', { items: [card('You', 'Role', 'Qué hace el alumno'), card('Me', 'Role', 'Qué hace la profe')] })],
  })

const assignments = (kids) =>
  s({
    kicker: kids ? 'Homework' : 'Assignments',
    title: kids ? 'At *home*' : 'Mid-week *preparation*',
    tag: 'Activity Blog',
    blocks: [
      b('roadmap', {
        items: kids
          ? [{ title: 'Flashcards', text: 'Repasá las palabras nuevas en el Activity Blog.', tag: '10 min' }, { title: 'Pronunciación', text: 'Jugá a emparejar las palabras que suenan igual.', tag: '5 min' }]
          : [{ title: 'Flashcards & glossary', text: 'Repasar el vocabulario en el Activity Blog.', tag: 'Activity Blog' }, { title: 'Writing', text: 'Escribir el mail de seguimiento trabajado en clase.', tag: 'Writing' }],
      }),
    ],
  })

const caseStudy = (kids) =>
  s({
    kicker: kids ? 'Story time' : 'Step 02 // Live Case Study',
    title: kids ? "Let's *read*" : 'The *case*',
    tag: kids ? 'Reading' : 'Transcript',
    blocks: [
      b('text', { text: kids ? 'Leé la historia y contestá: ¿qué hace Tom a la mañana?' : 'Contexto del caso: quiénes son, qué pasó y qué tienen que resolver.' }),
      b('callout', { label: kids ? 'The story' : 'Transcript', text: kids ? 'Tom wakes up at 7. He brushes his teeth and has breakfast…' : '**Sarah:** …\n**David:** …' }),
    ],
  })

const videoSlide = (kids) =>
  s({
    kicker: kids ? 'Watch' : 'Step 03 // Video Deep Dive',
    title: kids ? 'Watch and *learn*' : 'Key *moments*',
    tag: kids ? 'Video' : 'Video',
    blocks: [b('video', { url: '', caption: kids ? 'Mirá el video y contá cuántas acciones ves.' : 'Prestá atención a las frases de seguimiento.' }), b('cards', { items: [card('00:30', 'Moment 1', 'Qué observar'), card('01:15', 'Moment 2', 'Qué observar')] })],
  })

const moduleSlides = (n) => [
  s({ kicker: `Module ${n} • Topic`, title: `Module ${n}: *Key question*`, tag: 'Theory', blocks: [b('compare', { wrongLabel: 'Weak answer', wrong: '…', wrongNote: '', rightLabel: 'Strong answer', right: '…', rightNote: '' })] }),
  s({ kicker: `Module ${n} • Key phonetics`, title: 'Say it *right*', tag: 'Voice lab', blocks: [b('vocab', { items: [word('…', '…', '…', '…', '')] })] }),
  s({ kicker: `Module ${n} • Improvisation sandbox`, title: 'Your *turn*', tag: 'Practice', blocks: [b('callout', { label: 'Prompt', text: 'Pregunta para improvisar en vivo.' })] }),
]

export const CLASS_TEMPLATES = [
  {
    key: 'standard',
    number: 1,
    label: 'Clase estándar',
    desc: 'Portada · roadmap · warm-up · teoría · gramática · error vs. rule · práctica · pronunciación · misión · tareas',
    build: (kids) => [
      cover(kids),
      roadmap(kids, kids
        ? [{ title: 'Warm-up game', text: 'Preguntas y mímica', tag: '5 min' }, { title: 'New words', text: 'Vocabulario con imágenes', tag: '10 min' }, { title: 'Grammar', text: 'La regla del día', tag: '10 min' }, { title: 'Practice', text: 'Actividades en parejas', tag: '15 min' }, { title: 'Mission', text: 'Desafío para casa', tag: '5 min' }]
        : [{ title: 'Warm-up', text: 'Activación (5 min)', tag: 'Warm-up' }, { title: 'Core theory', text: 'Marco principal (20 min)', tag: 'Theory' }, { title: 'Grammar lab', text: 'Estructuras (15 min)', tag: 'Grammar' }, { title: 'Sandbox', text: 'Práctica guiada (12 min)', tag: 'Practice' }, { title: 'Briefing', text: 'Pronunciación y misión (8 min)', tag: 'Briefing' }]),
      warmup(kids),
      theory(kids),
      grammar(kids),
      errorRule(kids),
      practice(kids),
      pronunciation(kids),
      mission(kids),
      assignments(kids),
    ],
  },
  {
    key: 'case-video',
    number: 2,
    label: 'Clase con caso / video',
    desc: 'Portada · roadmap · warm-up · caso · video · teoría · práctica · vocabulario · tareas',
    build: (kids) => [
      cover(kids),
      roadmap(kids, [{ title: 'Warm-up', text: '', tag: '5 min' }, { title: kids ? 'Story time' : 'Case study', text: '', tag: '10 min' }, { title: 'Video', text: '', tag: '15 min' }, { title: kids ? 'Learn' : 'Core theory', text: '', tag: '15 min' }, { title: 'Practice', text: '', tag: '15 min' }]),
      warmup(kids),
      caseStudy(kids),
      videoSlide(kids),
      theory(kids),
      practice(kids),
      pronunciation(kids),
      assignments(kids),
    ],
  },
  {
    key: 'masterclass',
    number: 3,
    label: 'Masterclass por módulos',
    desc: 'Portada · roadmap · fundamentos · módulos (teoría + fonética + sandbox) · simulación · cierre',
    build: (kids) => [
      cover(kids, { kicker: kids ? 'Special class' : 'Intensive Masterclass • Special Course' }),
      roadmap(kids, [{ title: 'Foundations', text: 'Bases y herramientas', tag: 'Foundations' }, { title: 'Module 1', text: '', tag: 'Module' }, { title: 'Module 2', text: '', tag: 'Module' }, { title: 'Simulation', text: 'Práctica integral', tag: 'Live' }]),
      s({ kicker: 'Foundations • Toolkit', title: 'Your *toolkit*', tag: 'Foundations', blocks: [b('cards', { items: [card('Tool 1', 'Opener', '…'), card('Tool 2', 'Buying time', '…'), card('Tool 3', 'Steering', '…')] })] }),
      grammar(kids),
      ...moduleSlides(1),
      ...moduleSlides(2),
      s({ kicker: 'Simulation', title: 'Live *simulation*', tag: 'Roleplay', blocks: [b('callout', { label: 'Scenario', text: 'Consigna de la simulación final.' }), b('roadmap', { items: [{ title: 'Phase 1', text: '…', tag: '' }, { title: 'Phase 2', text: '…', tag: '' }] })] }),
      assignments(kids),
    ],
  },
  {
    key: 'short',
    number: 4,
    label: 'Clase corta / repaso',
    desc: 'Portada · warm-up · repaso · práctica · tareas',
    build: (kids) => [
      cover(kids, { blocks: [] }),
      warmup(kids),
      s({ kicker: kids ? 'Remember' : 'Quick recap', title: kids ? "Let's *remember*" : 'Key *takeaways*', tag: 'Recap', blocks: [b('cards', { items: [card('1', 'Idea clave', '…'), card('2', 'Idea clave', '…'), card('3', 'Idea clave', '…')] })] }),
      practice(kids),
      assignments(kids),
    ],
  },
]

export const GLOSSARY_TEMPLATE = {
  key: 'glossary',
  label: 'Glosario',
  build: (kids) => [
    s({
      layout: 'content',
      kicker: kids ? 'English Kids Club · Glossary' : 'Module // Glossary',
      title: kids ? 'My *words*' : 'Class 01: *Glossary*',
      tag: kids ? 'Unit 1' : 'Page 1',
      blocks: [
        b('heading', { text: kids ? 'Section 1: Actions' : 'Section 1: Key verbs' }),
        b('vocab', { items: [word('could', 'kud', 'podría', 'Posibilidad abierta.', 'It could be the network.'), word('might', 'mait', 'podría ser que', 'Probabilidad cauta.', 'It might be a memory leak.'), word('should', 'shud', 'deberíamos', 'Recomendación.', 'We should roll back.')] }),
        b('heading', { text: kids ? 'Section 2: Things' : 'Section 2: Connectors' }),
        b('vocab', { items: [word('due to', 'diu tu', 'debido a', 'Causa directa.', 'It crashed due to a null value.'), word('in order to', 'in ÓR-der tu', 'con el fin de', 'Propósito.', 'We rolled back in order to fix it.'), word('root cause', 'rut koz', 'causa raíz', 'Origen del problema.', 'The root cause was schema drift.')] }),
      ],
    }),
    s({
      kicker: kids ? 'Practice' : 'Patterns & phonetics',
      title: kids ? 'Say it *right*' : 'Patterns & *phonetic* audit',
      tag: kids ? 'Unit 1' : 'Page 2',
      blocks: [
        b('heading', { text: kids ? 'Useful phrases' : 'Section 3: Patterns' }),
        b('table', { text: kids ? 'English | Español\nCan I go to the bathroom? | ¿Puedo ir al baño?\nI don’t understand. | No entiendo.' : 'Pattern | Use | Example\nDue to + noun | Causa | Due to port congestion…\nWill + verb | Compromiso | I will send it today.' }),
        b('heading', { text: kids ? 'Sounds' : 'Section 4: Phonetic audit' }),
        b('vocab', { items: [word('avoid', 'a-VOID', '', 'Acento en VOID.', ''), word('trace', 'treis', '', 'Diptongo /ei/ claro.', ''), word('timeout', 'TAIM-aut', '', 'Dos sílabas limpias.', '')] }),
      ],
    }),
  ],
}

export function buildDeckData(kind, templateKey, scope) {
  const kids = scope === 'infancias'
  const tpl = kind === 'glossary' ? GLOSSARY_TEMPLATE : CLASS_TEMPLATES.find((t) => t.key === templateKey) || CLASS_TEMPLATES[0]
  return { footer: '', slides: tpl.build(kids) }
}

export const templateLabel = (kind, key) =>
  kind === 'glossary' ? 'Glosario' : (CLASS_TEMPLATES.find((t) => t.key === key) || {}).label || key

// Plantillas de slide sueltas para "+ Agregar slide" en el editor.
export const SLIDE_PRESETS = [
  { key: 'blank', label: 'En blanco', make: () => s({ title: 'New *slide*', blocks: [b('text', { text: '' })] }) },
  { key: 'roadmap', label: 'Roadmap', make: (kids) => roadmap(kids, [{ title: '', text: '', tag: '' }]) },
  { key: 'warmup', label: 'Warm-up / comparación', make: warmup },
  { key: 'theory', label: 'Teoría (tarjetas)', make: theory },
  { key: 'grammar', label: 'Gramática (tabla)', make: grammar },
  { key: 'errorRule', label: 'Error vs. Rule', make: errorRule },
  { key: 'data', label: 'Gráfico / datos', make: dataSlide },
  { key: 'imageText', label: 'Imagen + texto', make: imageTextSlide },
  { key: 'practice', label: 'Práctica', make: practice },
  { key: 'pronunciation', label: 'Pronunciación / vocabulario', make: pronunciation },
  { key: 'video', label: 'Video', make: videoSlide },
  { key: 'case', label: 'Caso / lectura', make: caseStudy },
  { key: 'mission', label: 'Misión', make: mission },
  { key: 'assignments', label: 'Tareas', make: assignments },
  { key: 'cover', label: 'Portada', make: (kids) => cover(kids) },
]
