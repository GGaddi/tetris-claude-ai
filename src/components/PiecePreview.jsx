import { TETROMINOES } from '../game/tetrominoes'
import { getPieceColor } from '../game/skins'

export default function PiecePreview({ type, label, dim = false, size = 16, skin = 'modern' }) {
  const shape = type ? trim(TETROMINOES[type].shape) : null
  const color = type ? getPieceColor(skin, type) : null

  return (
    <div className={`preview skin-${skin} ${dim ? 'dim' : ''}`}>
      <span className="preview-label">{label}</span>
      <div className="preview-grid">
        {shape ? (
          <div
            className="preview-shape"
            style={{ gridTemplateColumns: `repeat(${shape[0].length}, ${size}px)` }}
          >
            {shape.flatMap((row, y) =>
              row.map((v, x) => (
                <div
                  key={`${x}-${y}`}
                  className="preview-cell"
                  style={v ? { '--cell-color': color } : undefined}
                />
              ))
            )}
          </div>
        ) : (
          <div className="preview-empty">—</div>
        )}
      </div>
    </div>
  )
}

// Trim empty border rows/cols so pieces sit nicely centered in the preview box
function trim(shape) {
  const rows = shape.map((r, i) => (r.some(Boolean) ? i : -1)).filter((i) => i >= 0)
  const cols = shape[0].map((_, x) => (shape.some((r) => r[x]) ? x : -1)).filter((i) => i >= 0)
  return rows.map((y) => cols.map((x) => shape[y][x]))
}
