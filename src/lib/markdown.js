import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Markdown simple para el cuerpo de los posts del blog: negrita, cursiva,
// links y listas. `breaks: true` hace que un solo salto de línea (sin
// necesidad de dejar una línea en blanco) ya se vea como salto de línea —
// así el contenido que ya existía (texto plano, escrito antes de que
// hubiera formato) se sigue viendo igual que antes.
marked.setOptions({ breaks: true, gfm: true })

// Sanitizamos igual, aunque quien escribe es la profe: son posts públicos
// que cualquiera puede abrir, así que conviene no confiar 100% en el HTML
// generado.
export function renderMarkdown(text) {
  if (!text) return ''
  const html = marked.parse(text)
  return DOMPurify.sanitize(html)
}
