import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { TETROMINOES, rotateMatrix, refillQueue } from './tetrominoes'
import { getPieceColor } from './skins'
import { createEmptyBoard, isValidPosition, mergePieceIntoBoard, clearLines, getGhostY } from './board'
import { computeDropInterval } from './constants'

const LINE_LABELS = ['', 'single', 'double', 'triple', 'tetris']

function spawnFromQueue(state) {
  const settings = state.settings
  let queue = refillQueue(state.queue, settings.randomizer, settings.nextPieceCount + 1)
  const type = queue[0]
  queue = queue.slice(1)
  const shape = TETROMINOES[type].shape
  const size = shape.length
  const x = Math.floor(settings.boardWidth / 2) - Math.floor(size / 2)
  const y = 0
  const current = { type, shape, x, y }
  const gameOver = !isValidPosition(state.board, shape, x, y)
  return { ...state, current, queue, canHold: true, status: gameOver ? 'gameover' : state.status }
}

const COUNTDOWN_START = 3

// `autoStart` controls whether the board comes up already playing or waits
// on a "ready" screen for the player to press Start / Enter. Every current
// caller (first load, Restart, Apply & restart) passes false so the player
// always lands back on the start screen; the flag is kept in case a future
// caller wants to skip it.
function initialState(settings, autoStart = false) {
  const board = createEmptyBoard(settings.boardWidth, settings.boardHeight)
  let state = {
    settings,
    board,
    current: null,
    hold: null,
    canHold: true,
    queue: [],
    score: 0,
    lines: 0,
    level: settings.startingLevel,
    status: autoStart ? 'playing' : 'ready',
    countdown: null,
    lastClear: null,
    // Bumped every time a piece locks into the board, whether from gravity
    // or a hard drop — lets the UI play a single consistent "lock" sound
    // for both without needing to know which caused it.
    lockSeq: 0,
  }
  state = spawnFromQueue(state)
  return state
}

function tryMove(state, dx, dy) {
  if (!state.current || state.status !== 'playing') return state
  const { shape, x, y } = state.current
  const nx = x + dx
  const ny = y + dy
  if (isValidPosition(state.board, shape, nx, ny)) {
    return { ...state, current: { ...state.current, x: nx, y: ny } }
  }
  return state
}

function lockPiece(state) {
  const { shape, x, y, type } = state.current
  const color = getPieceColor(state.settings.skin, type)
  const merged = mergePieceIntoBoard(state.board, shape, x, y, color)
  const { board: clearedBoard, clearedCount } = clearLines(merged)
  const scoring = state.settings.scoring
  const points = [0, scoring.single, scoring.double, scoring.triple, scoring.tetris][clearedCount] || 0
  const newLines = state.lines + clearedCount
  const newLevel =
    state.settings.startingLevel +
    Math.floor(newLines / state.settings.linesPerLevel)

  let next = {
    ...state,
    board: clearedBoard,
    score: state.score + points * newLevel,
    lines: newLines,
    level: newLevel,
    lastClear: clearedCount > 0 ? { count: clearedCount, label: LINE_LABELS[clearedCount] } : null,
    lockSeq: state.lockSeq + 1,
  }
  next = spawnFromQueue(next)
  return next
}

function tryRotate(state, direction) {
  if (!state.current || state.status !== 'playing') return state
  const { shape, x, y, type } = state.current
  if (type === 'O') return state // rotation-invariant
  const rotated = rotateMatrix(shape, direction)
  const kicks = [0, -1, 1, -2, 2]
  for (const kick of kicks) {
    if (isValidPosition(state.board, rotated, x + kick, y)) {
      return { ...state, current: { ...state.current, shape: rotated, x: x + kick } }
    }
  }
  return state
}

function hardDrop(state) {
  if (!state.current || state.status !== 'playing') return state
  const { shape, x, y } = state.current
  const ghostY = getGhostY(state.board, shape, x, y)
  const cellsDropped = ghostY - y
  const bonus = cellsDropped * state.settings.scoring.hardDropPerCell
  const dropped = { ...state, current: { ...state.current, y: ghostY }, score: state.score + bonus }
  return lockPiece(dropped)
}

function holdPiece(state) {
  if (!state.settings.holdEnabled || !state.canHold || !state.current || state.status !== 'playing') return state
  const currentType = state.current.type
  if (state.hold === null) {
    const withHold = { ...state, hold: currentType, canHold: false }
    return spawnFromQueue(withHold)
  }
  const shape = TETROMINOES[state.hold].shape
  const size = shape.length
  const x = Math.floor(state.settings.boardWidth / 2) - Math.floor(size / 2)
  const swapped = {
    ...state,
    current: { type: state.hold, shape, x, y: 0 },
    hold: currentType,
    canHold: false,
  }
  return swapped
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      if (state.status === 'ready') {
        if (state.settings.countdownEnabled) {
          return { ...state, status: 'countdown', countdown: COUNTDOWN_START }
        }
        return { ...state, status: 'playing' }
      }
      return state
    case 'COUNTDOWN_TICK': {
      if (state.status !== 'countdown') return state
      const remaining = state.countdown - 1
      if (remaining <= 0) return { ...state, status: 'playing', countdown: null }
      return { ...state, countdown: remaining }
    }
    case 'MOVE_LEFT':
      return tryMove(state, -1, 0)
    case 'MOVE_RIGHT':
      return tryMove(state, 1, 0)
    case 'SOFT_DROP': {
      const moved = tryMove(state, 0, 1)
      if (moved === state) return state
      return { ...moved, score: moved.score + state.settings.scoring.softDropPerCell }
    }
    case 'GRAVITY_TICK': {
      if (!state.current || state.status !== 'playing') return state
      const { shape, x, y } = state.current
      if (isValidPosition(state.board, shape, x, y + 1)) {
        return { ...state, current: { ...state.current, y: y + 1 } }
      }
      // Piece has landed. With lock delay off, lock immediately (prior
      // behavior). With it on, hold here — the lock-delay timeout effect
      // in useTetris (keyed on state.current) locks it after the grace
      // period, and re-arms itself on every move/rotate/drop since each
      // of those produces a new `current` object.
      if (state.settings.lockDelayEnabled) return state
      return lockPiece(state)
    }
    case 'LOCK_NOW': {
      // Fired when a lock-delay timeout elapses. Re-check groundedness in
      // case the piece moved since the timer was scheduled — the effect
      // that schedules this clears stale timers on change, but this is a
      // cheap extra guard against any race.
      if (!state.current || state.status !== 'playing') return state
      const { shape, x, y } = state.current
      if (isValidPosition(state.board, shape, x, y + 1)) return state
      return lockPiece(state)
    }
    case 'HARD_DROP':
      return hardDrop(state)
    case 'ROTATE_CW':
      return tryRotate(state, 1)
    case 'ROTATE_CCW':
      return tryRotate(state, -1)
    case 'HOLD':
      return holdPiece(state)
    case 'PAUSE':
      if (state.status === 'playing') return { ...state, status: 'paused' }
      if (state.status === 'paused') return { ...state, status: 'playing' }
      return state
    case 'RESTART':
      return initialState(action.settings, false)
    case 'RESTART_AND_START': {
      const fresh = initialState(action.settings, false)
      if (fresh.settings.countdownEnabled) {
        return { ...fresh, status: 'countdown', countdown: COUNTDOWN_START }
      }
      return { ...fresh, status: 'playing' }
    }
    case 'UPDATE_SETTINGS':
      return initialState(action.settings, false)
    default:
      return state
  }
}

export function useTetris(initialSettings) {
  const [state, dispatch] = useReducer(reducer, initialSettings, (settings) => initialState(settings, false))
  const settings = state.settings
  const dropInterval = useMemo(() => computeDropInterval(state.level, settings), [state.level, settings])
  const softDropInterval = Math.max(20, Math.round(dropInterval / settings.softDropMultiplier))

  const softDropHeld = useRef(false)

  // Gravity loop
  useEffect(() => {
    if (state.status !== 'playing') return undefined
    const interval = softDropHeld.current ? softDropInterval : dropInterval
    const id = setInterval(() => dispatch({ type: 'GRAVITY_TICK' }), interval)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.level, state.current?.type, softDropHeld.current])

  // Lock delay: once a piece can't move down any further, give the player
  // `lockDelayMs` before it actually locks (only when the rule is turned
  // on — off by default, which preserves the old instant-lock behavior).
  // This is re-keyed on `state.current` — a new object every move,
  // rotation, or gravity step — and on `state.board`, which only changes
  // when a piece locks. That means any input while grounded tears down
  // the pending timeout and schedules a fresh one, which is exactly what
  // "resets the lock delay" means, without a separate reducer action for
  // it. Note there's no cap on resets, so a piece can in principle be
  // shuffled indefinitely at the bottom without locking — acceptable for
  // this project, but worth knowing if that ever needs tightening.
  useEffect(() => {
    if (!settings.lockDelayEnabled) return undefined
    if (state.status !== 'playing' || !state.current) return undefined
    const { shape, x, y } = state.current
    const grounded = !isValidPosition(state.board, shape, x, y + 1)
    if (!grounded) return undefined
    const id = setTimeout(() => dispatch({ type: 'LOCK_NOW' }), settings.lockDelayMs)
    return () => clearTimeout(id)
  }, [state.current, state.board, state.status, settings.lockDelayEnabled, settings.lockDelayMs])

  // Pre-game countdown, ticks once per second down to 0 then flips to 'playing'
  useEffect(() => {
    if (state.status !== 'countdown') return undefined
    const id = setInterval(() => dispatch({ type: 'COUNTDOWN_TICK' }), 1000)
    return () => clearInterval(id)
  }, [state.status])

  const move = useCallback((dir) => dispatch({ type: dir === -1 ? 'MOVE_LEFT' : 'MOVE_RIGHT' }), [])
  const rotate = useCallback((dir = 1) => dispatch({ type: dir === 1 ? 'ROTATE_CW' : 'ROTATE_CCW' }), [])
  const softDrop = useCallback((held) => {
    softDropHeld.current = held
    if (held) dispatch({ type: 'SOFT_DROP' })
  }, [])
  const hardDrop_ = useCallback(() => dispatch({ type: 'HARD_DROP' }), [])
  const hold = useCallback(() => dispatch({ type: 'HOLD' }), [])
  const togglePause = useCallback(() => dispatch({ type: 'PAUSE' }), [])
  const restart = useCallback((newSettings) => dispatch({ type: 'RESTART', settings: newSettings || settings }), [settings])
  const restartAndStart = useCallback((newSettings) => dispatch({ type: 'RESTART_AND_START', settings: newSettings || settings }), [settings])
  const updateSettings = useCallback((newSettings) => dispatch({ type: 'UPDATE_SETTINGS', settings: newSettings }), [])
  const start = useCallback(() => dispatch({ type: 'START' }), [])

  const ghostY = useMemo(() => {
    if (!state.current || !settings.ghostPieceEnabled) return null
    return getGhostY(state.board, state.current.shape, state.current.x, state.current.y)
  }, [state.current, state.board, settings.ghostPieceEnabled])

  const nextTypes = useMemo(() => state.queue.slice(0, settings.nextPieceCount), [state.queue, settings.nextPieceCount])

  return {
    state,
    ghostY,
    nextTypes,
    actions: { move, rotate, softDrop, hardDrop: hardDrop_, hold, togglePause, restart, restartAndStart, updateSettings, start },
  }
}
