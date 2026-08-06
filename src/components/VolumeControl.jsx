// A single icon button (mute toggle) + vertical volume slider. Used twice
// in App.jsx: once with icon="music" for the background music channel, and
// once with icon="speaker" for the announcer voice + game sound effects.
export default function VolumeControl({ icon, muted, volume, onToggleMute, onVolumeChange, label }) {
  const IconOn = icon === 'music' ? MusicNoteIcon : SpeakerIcon
  const IconOff = icon === 'music' ? MusicNoteMutedIcon : SpeakerMutedIcon

  return (
    <div className="volume-control">
      <button
        type="button"
        className={`music-icon-btn ${muted ? 'muted' : ''}`}
        onClick={onToggleMute}
        aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
        title={muted ? `Unmute ${label}` : `Mute ${label}`}
      >
        {muted ? <IconOff /> : <IconOn />}
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
          aria-label={`${label} volume`}
        />
      </div>
    </div>
  )
}

function MusicNoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  )
}

function MusicNoteMutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  )
}

function SpeakerMutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <line x1="16.5" y1="8.5" x2="22" y2="15.5" />
      <line x1="22" y1="8.5" x2="16.5" y2="15.5" />
    </svg>
  )
}
