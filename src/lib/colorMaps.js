// Mapas de color → clases Tailwind completas. Quedan estáticos acá (no
// vienen de la base de datos) porque el JIT de Tailwind necesita ver el
// nombre de cada clase como texto literal en algún archivo fuente — si el
// color fuera 100% dinámico, Tailwind nunca generaría el CSS para esas
// clases y quedarían invisibles. Por eso los tracks/grupos en la base de
// datos solo pueden elegir una `color_key` de esta lista cerrada (ver los
// checks en supabase/schema_phase2.sql), no un color libre.

export const THEME_COLORS = {
  brand: {
    border: 'border-t-brand',
    borderT4: 'border-t-4 border-t-brand',
    borderL8: 'border-l-8 border-l-brand',
    tag: 'text-brand border-brand',
    icon: 'text-brand',
    hoverBg: 'hover:bg-brand',
    hoverText: 'hover:text-brand',
    focusBorder: 'focus:border-brand',
  },
  stamp: {
    border: 'border-t-stamp',
    borderT4: 'border-t-4 border-t-stamp',
    borderL8: 'border-l-8 border-l-stamp',
    tag: 'text-stamp border-stamp',
    icon: 'text-stamp',
    hoverBg: 'hover:bg-stamp',
    hoverText: 'hover:text-stamp',
    focusBorder: 'focus:border-stamp',
  },
  olive: {
    border: 'border-t-olive',
    borderT4: 'border-t-4 border-t-olive',
    borderL8: 'border-l-8 border-l-olive',
    tag: 'text-olive border-olive',
    icon: 'text-olive',
    hoverBg: 'hover:bg-olive',
    hoverText: 'hover:text-olive',
    focusBorder: 'focus:border-olive',
  },
  pink: {
    border: 'border-t-pink',
    borderT4: 'border-t-4 border-t-pink',
    borderL8: 'border-l-8 border-l-pink',
    tag: 'text-pink border-pink',
    icon: 'text-pink',
    hoverBg: 'hover:bg-pink',
    hoverText: 'hover:text-pink',
    focusBorder: 'focus:border-pink',
  },
  violet: {
    border: 'border-t-violet',
    borderT4: 'border-t-4 border-t-violet',
    borderL8: 'border-l-8 border-l-violet',
    tag: 'text-violet border-violet',
    icon: 'text-violet',
    hoverBg: 'hover:bg-violet',
    hoverText: 'hover:text-violet',
    focusBorder: 'focus:border-violet',
  },
  gold: {
    border: 'border-t-gold',
    borderT4: 'border-t-4 border-t-gold',
    borderL8: 'border-l-8 border-l-gold',
    tag: 'text-gold border-gold',
    icon: 'text-gold',
    hoverBg: 'hover:bg-gold',
    hoverText: 'hover:text-gold',
    focusBorder: 'focus:border-gold',
  },
}

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

// Listas usadas en los <select> del panel de administración — son las
// únicas opciones válidas, en el mismo orden en que se muestran.
export const TRACK_COLOR_OPTIONS = ['brand', 'stamp', 'olive', 'pink', 'violet', 'gold']
export const GROUP_COLOR_OPTIONS = ['kidsYellow', 'kidsGreen', 'kidsBlue', 'kidsPurple']
