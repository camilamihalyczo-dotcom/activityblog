// Estilos de las actividades para Adultos (papel, tinta) e Infancias
// (colores, bordes redondeados, tipografía "playful"). Las actividades
// unificadas (Completar oraciones, Pronunciación…) usan un solo componente
// y toman de acá las clases según `kids`. `c` son los colores del track o
// grupo (ver colorMaps.js).

export function getSkin(c, kids) {
  if (kids) {
    return {
      card: `bg-white rounded-[22px] shadow-kids ${c.borderT8}`,
      outer: 'text-kidsInk',
      img: 'rounded-xl',
      text: 'font-playful text-kidsInk',
      muted: 'text-kidsInk/70',
      small: 'font-playful text-xs text-kidsInk/70',
      option: 'rounded-xl font-playful',
      chosen: 'border-kidsInk bg-kidsInk/5',
      idle: 'border-kidsInk/12',
      ok: 'border-kidsGreenDeep bg-kidsGreen/15',
      bad: 'border-kidsRed bg-kidsRed/10',
      okIcon: 'text-kidsGreenDeep',
      badIcon: 'text-kidsRed',
      input: 'rounded-xl font-playful bg-kidsCream',
      inputIdle: `border-kidsInk/12 focus:outline focus:outline-3 ${c.outline} outline-none`,
      primary: `bg-kidsInk text-white font-playful font-semibold rounded-full ${c.hoverBg}`,
      resultBox: 'bg-white rounded-[22px] shadow-kids',
      resultTitle: 'font-body font-extrabold text-2xl text-kidsInk',
      link: `text-kidsInk/70 ${c.hoverText} font-playful text-sm font-semibold underline`,
      bankBox: 'bg-white rounded-[22px] shadow-kids sticky top-14',
      bankLabel: 'font-playful text-[10px] uppercase tracking-widest font-semibold text-kidsInk/70',
      chipSelected: 'border-kidsInk bg-kidsInk text-white',
      chipIdle: 'border-kidsInk/15 bg-kidsCream text-kidsInk hover:border-kidsInk/40',
      slotEmpty: 'border-kidsInk/25 text-kidsInk/70',
      slotFilled: 'border-solid border-kidsInk bg-kidsInk/5 text-kidsInk',
      title: 'font-body font-extrabold text-kidsInk',
      soft: 'bg-kidsCream',
      dropActive: 'border-kidsInk bg-kidsInk/10',
      accent: 'accent-kidsInk',
      body: 'font-playful text-kidsInk/85',
    }
  }
  return {
    card: `texture-card rounded-2xl ${c.borderT4}`,
    outer: 'text-ink',
    img: 'rounded-lg',
    text: 'text-ink',
    muted: 'text-ink/60',
    small: 'font-mono text-xs text-ink/60',
    option: 'rounded-lg',
    chosen: 'border-ink bg-ink/5',
    idle: 'border-ink/15',
    ok: 'border-olive bg-olive/10',
    bad: 'border-stamp bg-stamp/10',
    okIcon: 'text-olive',
    badIcon: 'text-stamp',
    input: 'rounded-lg bg-paper',
    inputIdle: `border-ink/15 ${c.focusBorder} outline-none`,
    primary: `bg-ink text-cream font-semibold rounded-lg ${c.hoverBg}`,
    resultBox: 'texture-card rounded-2xl',
    resultTitle: 'font-display text-2xl font-semibold text-ink',
    link: `text-ink/60 ${c.hoverText} text-sm font-medium underline`,
    bankBox: 'texture-card rounded-2xl shadow-md sticky top-3',
    bankLabel: 'font-mono text-[10px] uppercase tracking-widest text-ink/60',
    chipSelected: 'border-ink bg-ink text-cream',
    chipIdle: 'border-ink/15 bg-paper text-ink hover:border-ink/40',
    slotEmpty: 'border-ink/25 text-ink/60',
    slotFilled: 'border-solid border-ink bg-ink/5 text-ink',
    title: 'font-display font-semibold text-ink',
    soft: 'bg-paper',
    dropActive: 'border-brand bg-brand/10',
    accent: 'accent-brand',
    body: 'text-ink/85',
  }
}

