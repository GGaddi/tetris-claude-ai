export default function MusicControl({ muted, volume, onToggleMute, onVolumeChange }) {
  return (
    <div className="music-control">
      <button
        type="button"
        className={`music-icon-btn ${muted ? 'muted' : ''}`}
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        title={muted ? 'Unmute audio' : 'Mute audio'}
      >
        {muted ? <MuteIcon /> : <SoundIcon />}
      </button>
      <div className="volume-slider-wrap">
        <input
          className="volume-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(volume * 100)}
          disabled={muted}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          aria-label="Music and sound effects volume"
        />
      </div>
    </div>
  )
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <line x1="16.5" y1="8.5" x2="22" y2="15.5" />
      <line x1="22" y1="8.5" x2="16.5" y2="15.5" />
    </svg>
  )
}
