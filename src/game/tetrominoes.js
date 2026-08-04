// Each piece is defined on an N x N grid so the same rotate() function
// works for all of them (classic "rotate the bounding box" approach).
export const TETROMINOES = {
  I: {
    color: '#5eead4',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    color: '#facc15',
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: '#c084fc',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    color: '#4ade80',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    color: '#f87171',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    color: '#60a5fa',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    color: '#fb923c',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
}

export const PIECE_TYPES = Object.keys(TETROMINOES)

export function rotateMatrix(matrix, direction = 1) {
  const n = matrix.length
  const result = matrix.map((row) => [...row])
  if (direction === 1) {
    // clockwise
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        result[x][n - 1 - y] = matrix[y][x]
      }
    }
  } else {
    // counter-clockwise
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        result[n - 1 - x][y] = matrix[y][x]
      }
    }
  }
  return result
}

// Generates `count` more piece types and appends them to `queue`,
// using either the "7-bag" randomizer (each piece appears once per
// shuffled bag of 7) or pure uniform-random selection.
export function refillQueue(queue, randomizer, minLength) {
  const next = [...queue]
  while (next.length < minLength) {
    if (randomizer === 'bag') {
      const bag = shuffle([...PIECE_TYPES])
      next.push(...bag)
    } else {
      next.push(PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)])
    }
  }
  return next
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
