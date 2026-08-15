// Los posts del blog ahora viven en Supabase (tabla `blog_posts`), no acá —
// se cargan/editan desde /notas-profe. Ver supabase/README.md para la puesta en
// marcha. Este archivo solo se queda con el helper de formato de fecha,
// compartido entre la vista pública (AdultosBlogPage/InfanciasBlogPage) y
// el panel de administración.

// Formatea una fecha YYYY-MM-DD a texto en español, parseando los
// componentes a mano (en vez de `new Date(iso)`) para evitar que el huso
// horario local corra el día mostrado un día para atrás.
export const formatPostDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
