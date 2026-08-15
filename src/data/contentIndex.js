import { THEMES_CONTENT as a1a2 } from './content/a1-a2.js'
import { THEMES_CONTENT as b1b2 } from './content/b1-b2.js'
import { THEMES_CONTENT as c1c2 } from './content/c1-c2.js'

const EMPTY_TEMARIO_CONTENT = { flashcards: [], quiz: null, listenings: [], readingWriting: [] }

export const CONTENT_BY_LEVEL = {
  'a1-a2': a1a2,
  'b1-b2': b1b2,
  'c1-c2': c1c2,
}

// Contenido de un nivel + track + temario puntual (ver src/data/themes.js
// para la lista de tracks y temarios). Si todavía no se cargó nada para esa
// combinación, devuelve el bloque vacío — así las páginas de actividad
// siempre reciben la misma forma de datos, y los archivos de content/*.js
// solo necesitan declarar las combinaciones que YA tienen contenido real.
export const getTemarioContent = (levelSlug, themeSlug, temarioSlug) =>
  CONTENT_BY_LEVEL[levelSlug]?.[themeSlug]?.[temarioSlug] || EMPTY_TEMARIO_CONTENT
