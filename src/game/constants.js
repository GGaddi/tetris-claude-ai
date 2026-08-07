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

// Dark jewel-tone backgrounds for the play-area frame, cycling once per
// level so the game visibly shifts mood as the player progresses. Chosen
// to stay dark enough that the board's own cells/pieces remain the clear
// focal point — this recolors the frame around the board, not the cells.
export const LEVEL_BACKGROUNDS = [
  '#121927', // teal-black (default)
  '#1a1330', // violet-black
  '#0f2233', // deep blue
  '#2a1420', // wine red
  '#231a0d', // amber-black
  '#0f2a1c', // forest green
  '#2a1030', // magenta-black
  '#1f2205', // olive-gold (kept dark)
  '#0d2429', // cyan-black
  '#1a1030', // indigo-black
]

export function levelBackground(level) {
  const idx = Math.max(0, level - 1) % LEVEL_BACKGROUNDS.length
  return LEVEL_BACKGROUNDS[idx]
}
