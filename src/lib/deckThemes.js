// Estilos, colores y tipos de bloque del creador de presentaciones.
// Los valores salen de tus landings:
// - Adultos → Track English Studio (courses/index.html): hueso + carbón,
//   Bebas Neue / Playfair Display itálica / Space Mono / Work Sans, y un
//   color por track (T01–T08) + cobalto.
// - Infancias → English Kids Club (english-kids-club/index.html): crema +
//   tinta violeta oscura, Inter 800 / Poppins, amarillo-verde-celeste-violeta.

export const ADULT_COLORS = [
  { key: 'cobalto', label: 'Cobalto (marca)', accent: '#1C39BB' },
  { key: 't01', label: 'T01 · Developers', accent: '#4338CA' },
  { key: 't02', label: 'T02 · Data & AI', accent: '#7C3AED' },
  { key: 't03', label: 'T03 · Business & Leadership', accent: '#15803D' },
  { key: 't04', label: 'T04 · HR & Recruiting', accent: '#A21CAF' },
  { key: 't05', label: 'T05 · Creatives', accent: '#C2410C' },
  { key: 't06', label: 'T06 · Travel', accent: '#B45309' },
  { key: 't07', label: 'T07 · Exam Preparation', accent: '#0D9488' },
  { key: 't08', label: 'T08 · Special Courses', accent: '#9F1239' },
]

export const KIDS_COLORS = [
  // `mark`: versión con contraste suficiente (≥ 3:1 sobre blanco) para las
  // barras de los gráficos; el amarillo y el verde de marca no llegan.
  { key: 'amarillo', label: 'Amarillo', accent: '#F5A623', light: '#FFC94A', mark: '#C77A06' },
  { key: 'verde', label: 'Verde', accent: '#2FAE6E', light: '#5FC98D', mark: '#1F8A55' },
  { key: 'celeste', label: 'Celeste', accent: '#2E93C9', light: '#4FB4E8' },
  { key: 'violeta', label: 'Violeta', accent: '#7B57C9', light: '#9B7EDE' },
]

export const colorsFor = (scope) => (scope === 'infancias' ? KIDS_COLORS : ADULT_COLORS)

export function resolveColor(scope, key) {
  const list = colorsFor(scope)
  return list.find((c) => c.key === key) || list[0]
}

export const STYLE_LABELS = {
  adultos: 'Track English Studio',
  infancias: 'English Kids Club',
}

export const BRAND_FOOTER = {
  adultos: 'Track English Studio',
  infancias: 'English Kids Club',
}

// Tipos de bloque que puede tener cada slide. `make()` devuelve el
// contenido inicial cuando se agrega uno nuevo desde el editor.
export const BLOCK_TYPES = [
  { type: 'text', label: 'Texto', make: () => ({ text: '' }) },
  { type: 'heading', label: 'Título de sección', make: () => ({ text: 'Section 1: …' }) },
  { type: 'cards', label: 'Tarjetas', make: () => ({ items: [{ label: '', title: '', text: '' }, { label: '', title: '', text: '' }] }) },
  { type: 'roadmap', label: 'Roadmap / pasos', make: () => ({ items: [{ title: '', text: '', tag: '' }] }) },
  { type: 'compare', label: 'Comparación ❌ / ✅', make: () => ({ wrongLabel: 'Versión literal', wrong: '', wrongNote: '', rightLabel: 'Versión profesional', right: '', rightNote: '' }) },
  { type: 'callout', label: 'Consigna destacada', make: () => ({ label: 'Prompt', text: '' }) },
  { type: 'vocab', label: 'Vocabulario', make: () => ({ items: [{ word: '', phonetic: '', translation: '', definition: '', example: '' }] }) },
  { type: 'table', label: 'Tabla', make: () => ({ text: 'Columna 1 | Columna 2\n… | …' }) },
  {
    type: 'errorRule',
    label: 'Error vs. Rule',
    make: () => ({
      mode: 'rule',
      items: [
        { rule: 'INSTEAD OF + [VERB-ING]', badge: 'Regla nativa', correct: 'Instead of **calling** them directly, I sent a formal email.', error: 'Instead of to call them…' },
        { rule: 'RESPONSIBLE FOR + [VERB-ING]', badge: 'Regla nativa', correct: 'I am responsible for **coordinating** the project.', error: 'Responsible for coordinate…' },
      ],
    }),
  },
  { type: 'image', label: 'Imagen', make: () => ({ url: '', caption: '', size: 'm' }) },
  { type: 'imageText', label: 'Imagen + texto', make: () => ({ url: '', caption: '', text: '', side: 'left' }) },
  { type: 'gallery', label: 'Galería de imágenes', make: () => ({ items: [{ url: '', caption: '' }, { url: '', caption: '' }, { url: '', caption: '' }] }) },
  { type: 'chart', label: 'Gráfico de barras', make: () => ({ title: '', unit: '%', text: 'Meetings | 45\nEmails | 30\nPresentations | 15\nCalls | 10' }) },
  { type: 'process', label: 'Diagrama de pasos', make: () => ({ items: [{ title: 'Impact', text: 'What happened' }, { title: 'Root cause', text: 'Why it happened' }, { title: 'Mitigation', text: 'What we did' }] }) },
  { type: 'video', label: 'Video (YouTube)', make: () => ({ url: '', caption: '' }) },
]

export const blockLabel = (type) => BLOCK_TYPES.find((b) => b.type === type)?.label || type

export function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}`
}

export const makeBlock = (type) => ({ id: genId(), type, ...(BLOCK_TYPES.find((b) => b.type === type)?.make()) })
