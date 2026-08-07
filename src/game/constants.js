export const DEFAULT_SETTINGS = {
  boardWidth: 10,
  boardHeight: 20,
  startingLevel: 1,
  linesPerLevel: 10,
  randomizer: 'bag', // 'bag' | 'random'
  baseDropMs: 800, // ms between automatic drops at level 1
  speedCurve: 0.82, // multiplier applied to drop interval per level (lower = faster ramp)
  minDropMs: 60, // fastest the piece is ever allowed to fall
  softDropMultiplier: 20, // how much faster soft-drop is vs gravity
  ghostPieceEnabled: true,
  holdEnabled: true,
  nextPieceCount: 3,
  music: 'korobeiniki', // 'none' | any key in MUSIC_TRACKS (see game/audio.js)
  scoring: {
    single: 100,
    double: 300,
    triple: 500,
    tetris: 800,
    softDropPerCell: 1,
    hardDropPerCell: 2,
  },
  lockDelayMs: 500, // grace period after landing before a piece locks
}

export const SETTINGS_LIMITS = {
  boardWidth: { min: 6, max: 16, step: 1 },
  boardHeight: { min: 12, max: 30, step: 1 },
  startingLevel: { min: 1, max: 15, step: 1 },
  linesPerLevel: { min: 1, max: 20, step: 1 },
  baseDropMs: { min: 200, max: 1500, step: 50 },
  speedCurve: { min: 0.6, max: 0.95, step: 0.01 },
  nextPieceCount: { min: 1, max: 5, step: 1 },
  lockDelayMs: { min: 0, max: 1500, step: 50 },
}

export function computeDropInterval(level, settings) {
  const interval = settings.baseDropMs * Math.pow(settings.speedCurve, level - 1)
  return Math.max(settings.minDropMs, Math.round(interval))
}

// Jewel-tone themes for the play area, cycling once per level so the game
// visibly shifts mood as the player progresses. Each theme has three tones
// so the frame, grid lines, and empty-cell background all shift together
// while staying just dark enough that piece colors remain the clear focal
// point:
//   frame  — background of the panel surrounding the board
//   line   — board background, shows through the 1px gaps between cells
//   panel  — background of empty (and ghost) cells
export const LEVEL_THEMES = [
  { frame: '#173b3c', line: '#1f5a58', panel: '#277572' }, // teal
  { frame: '#2e2740', line: '#3d3455', panel: '#4a4068' }, // violet (muted plum)
  { frame: '#132f4d', line: '#1d4870', panel: '#255a8a' }, // deep blue
  { frame: '#3f2530', line: '#573347', panel: '#6b405a' }, // wine red (muted rose)
  { frame: '#4a3410', line: '#6b4c16', panel: '#85601c' }, // amber
  { frame: '#0f4327', line: '#17633a', panel: '#1e7c48' }, // forest green
  { frame: '#3f2740', line: '#573650', panel: '#6b4464' }, // magenta (muted mauve)
  { frame: '#3f420f', line: '#5d6116', panel: '#767c1c' }, // olive-gold
  { frame: '#0f4650', line: '#186876', panel: '#1f8394' }, // cyan
  { frame: '#232a45', line: '#303a5e', panel: '#3c4775' }, // indigo (muted slate)
]

export function levelTheme(level) {
  const idx = Math.max(0, level - 1) % LEVEL_THEMES.length
  return LEVEL_THEMES[idx]
}
