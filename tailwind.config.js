/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta tomada de la landing de cursos (courses/index.html) para
        // mantener coherencia de marca entre la landing y el cuaderno.
        paper: '#F3EDE3',
        paperdark: '#E3D8C7',
        ink: '#0D0D0D',
        stamp: '#B03A2E',
        olive: '#1A7A4A',
        gold: '#C47A0B',
        cream: '#FAFAF8',
        brand: '#1B3FA0',
        violet: '#6B3FA0',
        pink: '#A0396B',
        // Paleta tomada de la landing de English Kids Club — se usa solo
        // en las pantallas de Niños y adolescentes (selector de grupo),
        // para que ese bloque tenga identidad propia y más lúdica.
        kidsYellow: '#FFC94A',
        kidsYellowDeep: '#F5A623',
        kidsGreen: '#5FC98D',
        kidsGreenDeep: '#2FAE6E',
        kidsBlue: '#4FB4E8',
        kidsBlueDeep: '#2E93C9',
        kidsPurple: '#9B7EDE',
        kidsPurpleDeep: '#7B57C9',
        kidsCream: '#FFFBF2',
        kidsInk: '#2E2A4A',
        kidsRed: '#D9534F',
      },
      fontFamily: {
        // Tipografías de la landing: Bebas Neue para títulos y etiquetas
        // (reemplaza a Fraunces/IBM Plex Mono), Playfair Display itálica
        // como acento puntual, Inter para el cuerpo (reemplaza Space Grotesk).
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        accent: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        // Poppins: tipografía redondeada de la landing de Kids Club. Usada
        // en TODO el bloque de Niños y adolescentes (junto con Inter para
        // títulos), reemplazando ahí a Bebas Neue/Playfair/paper texturado
        // de Adultos — cada bloque tiene su propia identidad tipográfica.
        playful: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Sombra suave de las cards de la landing de Kids Club (sin borde
        // fino), en vez del borde editorial + sombra que usa Adultos.
        kids: '0 8px 24px rgba(46,42,74,0.10)',
      },
    },
  },
  plugins: [],
}
