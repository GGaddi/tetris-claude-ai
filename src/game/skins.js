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
    // Seven shades of grey spanning near-white to near-black, spaced far
    // enough apart to stay tell-apart-able on a screen with no color at
    // all — same constraint the original dot-matrix palette had.
    colors: {
      I: '#e8e8e8',
      O: '#c2c2c2',
      T: '#9c9c9c',
      S: '#767676',
      Z: '#565656',
      J: '#3a3a3a',
      L: '#212121',
    },
  },
}

export const SKIN_IDS = Object.keys(SKINS)
export const DEFAULT_SKIN = 'modern'

export function getPieceColor(skinId, type) {
  const skin = SKINS[skinId] || SKINS[DEFAULT_SKIN]
  return skin.colors[type] || SKINS[DEFAULT_SKIN].colors[type]
}
