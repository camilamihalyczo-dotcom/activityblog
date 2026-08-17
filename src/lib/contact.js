// Enlaces de contacto y de los sitios de información de cada audiencia.
// Centralizado acá para no repetir URLs a mano en varios componentes.

const WHATSAPP_NUMBER = '541151268940'

// Arma el link de WhatsApp, con un mensaje pre-cargado opcional.
export function buildWhatsAppLink(message) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

// Sitios de información/landing de cada audiencia (no son parte de esta
// app: son las páginas públicas con precios, tracks y datos de contacto).
export const MARKETING_SITES = {
  adultos: 'https://camila-tutor.vercel.app/',
  infancias: 'https://english-kids-club.vercel.app/',
}
