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
