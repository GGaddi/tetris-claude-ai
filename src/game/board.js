export function createEmptyBoard(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(null))
}

export function isValidPosition(board, shape, posX, posY) {
  const width = board[0].length
  const height = board.length
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue
      const boardX = posX + x
      const boardY = posY + y
      if (boardX < 0 || boardX >= width || boardY >= height) return false
      if (boardY < 0) continue // allow spawning partially above the board
      if (board[boardY][boardX]) return false
    }
  }
  return true
}

export function mergePieceIntoBoard(board, shape, posX, posY, color) {
  const next = board.map((row) => [...row])
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue
      const boardY = posY + y
      const boardX = posX + x
      if (boardY >= 0 && boardY < next.length && boardX >= 0 && boardX < next[0].length) {
        next[boardY][boardX] = color
      }
    }
  }
  return next
}

export function clearLines(board) {
  const width = board[0].length
  const remaining = board.filter((row) => row.some((cell) => !cell))
  const clearedCount = board.length - remaining.length
  const newRows = Array.from({ length: clearedCount }, () => Array(width).fill(null))
  return { board: [...newRows, ...remaining], clearedCount }
}

export function getGhostY(board, shape, posX, posY) {
  let ghostY = posY
  while (isValidPosition(board, shape, posX, ghostY + 1)) {
    ghostY += 1
  }
  return ghostY
}
