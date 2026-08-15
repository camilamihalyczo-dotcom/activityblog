// Configuración de niveles para Adultos.
// El nivel en sí ya no pide clave — la clave de acceso ahora vive en el
// track/curso (ver src/data/themes.js), porque cada curso tiene su propia
// clave compartida entre sus alumnos, sin importar el nivel de inglés.
// Para agregar contenido nuevo: editar el archivo correspondiente en /data/content/*.js

export const LEVELS = [
  {
    slug: 'a1-a2',
    code: 'A1 · A2',
    name: 'Principiante',
    description: 'Primeros pasos: vocabulario esencial, frases cotidianas y estructuras básicas.',
    stampColor: 'olive',
  },
  {
    slug: 'b1-b2',
    code: 'B1 · B2',
    name: 'Intermedio',
    description: 'Fluidez en conversación, comprensión de textos y audios de complejidad media.',
    stampColor: 'stamp',
  },
  {
    slug: 'c1-c2',
    code: 'C1 · C2',
    name: 'Avanzado',
    description: 'Dominio casi nativo: matices, registro formal/informal y temas complejos.',
    stampColor: 'gold',
  },
]

export const getLevel = (slug) => LEVELS.find((l) => l.slug === slug)
