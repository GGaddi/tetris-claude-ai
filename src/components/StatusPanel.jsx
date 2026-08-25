export default function StatusPanel({ score, level, lines, status, lastClear }) {
  return (
    <div className="status-panel">
      <div className="stat">
        <span className="stat-label">Score</span>
        <span className="stat-value">{score.toLocaleString()}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Level</span>
        <span className="stat-value">{level}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Lines</span>
        <span className="stat-value">{lines}</span>
      </div>
      <div className={`clear-badge ${lastClear ? 'active' : ''}`} key={lines}>
        {lastClear ? `${lastClear.label}!` : '\u00A0'}
      </div>
      {status === 'paused' && <div className="status-flag">Paused</div>}
      {status === 'gameover' && (
        <>
          <div className="status-flag over">Game over</div>
          <div className="restart-hint">Press Enter to Restart</div>
        </>
      )}
    </div>
  )
}
