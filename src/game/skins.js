// Skin definitions: each skin controls piece colors plus the visual style
// of locked/active cells (corner radius, cell gap, and the box-shadow used
// to fake a bevel or pixel-highlight). Adding a new skin means adding an
// entry here AND a matching `.skin-<id>` CSS-variable block in App.css
// (search for "Skins" there) — this file has no rendering opinions of its
// own, it just names colors and hands out CSS values.
export const SKINS = {
  modern: {
    label: 'Modern',
    colors: {
      I: '#5eead4',
      O: '#facc15',
      T: '#c084fc',
      S: '#4ade80',
      Z: '#f87171',
      J: '#60a5fa',
      L: '#fb923c',
    },
  },
  blocky: {
    label: 'Blocky',
    colors: {
      I: '#00e5ff',
      O: '#ffe600',
      T: '#b026ff',
      S: '#39ff14',
      Z: '#ff2e2e',
      J: '#2979ff',
      L: '#ff9100',
    },
  },
  classic: {
    label: 'Classic (Game Boy)',
    // Seven shades of grey, kept inside a mid-range band (not true white
    // or true black) so every piece stays visible against the app's dark
    // panels — especially the preview cards, which have no light backdrop
    // behind the cell. A visible outline (see .skin-classic rules in
    // App.css) backs this up further.
    colors: {
      I: '#dcdcdc',
      O: '#bcbcbc',
      T: '#9c9c9c',
      S: '#7e7e7e',
      Z: '#626262',
      J: '#4a4a4a',
      L: '#363636',
    },
  },
  circular: {
    label: 'Circular',
    // Soft bubble-like palette. The shape change (square -> circle) is
    // handled entirely in CSS (see `.skin-circular` rules in App.css) —
    // this skin doesn't need its own cell size or gap, same as every
    // other skin.
    colors: {
      I: '#7dd3fc',
      O: '#fde68a',
      T: '#d8b4fe',
      S: '#86efac',
      Z: '#fca5a5',
      J: '#93c5fd',
      L: '#fdba74',
    },
  },
}

export const SKIN_IDS = Object.keys(SKINS)
export const DEFAULT_SKIN = 'modern'

export function getPieceColor(skinId, type) {
  const skin = SKINS[skinId] || SKINS[DEFAULT_SKIN]
  return skin.colors[type] || SKINS[DEFAULT_SKIN].colors[type]
}
