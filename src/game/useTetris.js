import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { TETROMINOES, rotateMatrix, refillQueue } from './tetrominoes'
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

function initialState(settings) {
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
    status: 'playing',
    lastClear: null,
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
  const color = TETROMINOES[type].color
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
      return initialState(action.settings)
    case 'UPDATE_SETTINGS':
      return initialState(action.settings)
    default:
      return state
  }
}

export function useTetris(initialSettings) {
  const [state, dispatch] = useReducer(reducer, initialSettings, initialState)
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
  const updateSettings = useCallback((newSettings) => dispatch({ type: 'UPDATE_SETTINGS', settings: newSettings }), [])

  const ghostY = useMemo(() => {
    if (!state.current || !settings.ghostPieceEnabled) return null
    return getGhostY(state.board, state.current.shape, state.current.x, state.current.y)
  }, [state.current, state.board, settings.ghostPieceEnabled])

  const nextTypes = useMemo(() => state.queue.slice(0, settings.nextPieceCount), [state.queue, settings.nextPieceCount])

  return {
    state,
    ghostY,
    nextTypes,
    actions: { move, rotate, softDrop, hardDrop: hardDrop_, hold, togglePause, restart, updateSettings },
  }
}
