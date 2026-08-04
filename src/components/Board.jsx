export default function Board({ board, current, ghostY, cellSize = 28 }) {
  const width = board[0].length
  const height = board.length

  // Build a render grid: start from locked board, then overlay ghost + current piece
  const grid = board.map((row) => row.map((cell) => ({ color: cell, kind: cell ? 'locked' : null })))

  if (current && ghostY !== null && ghostY !== undefined) {
    paint(grid, current.shape, current.x, ghostY, null, 'ghost')
  }
  if (current) {
    paint(grid, current.shape, current.x, current.y, colorOf(current.type), 'active')
  }

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
      }}
    >
      {grid.flatMap((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`cell ${cell.kind ? cell.kind : 'empty'}`}
            style={cell.color ? { '--cell-color': cell.color } : undefined}
          />
        ))
      )}
    </div>
  )
}

function paint(grid, shape, posX, posY, color, kind) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue
      const gx = posX + x
      const gy = posY + y
      if (gy < 0 || gy >= grid.length || gx < 0 || gx >= grid[0].length) continue
      if (kind === 'ghost' && grid[gy][gx].kind === 'locked') continue
      grid[gy][gx] = { color, kind }
    }
  }
}

function colorOf(type) {
  const colors = {
    I: '#5eead4',
    O: '#facc15',
    T: '#c084fc',
    S: '#4ade80',
    Z: '#f87171',
    J: '#60a5fa',
    L: '#fb923c',
  }
  return colors[type]
}
