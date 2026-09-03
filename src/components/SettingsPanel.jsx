import { useEffect, useState } from 'react'
import { SETTINGS_LIMITS } from '../game/constants'
import { MUSIC_TRACKS } from '../game/musicTracks'
import { SKINS, SKIN_IDS } from '../game/skins'

const FIELD_LABELS = {
  boardWidth: 'Board width',
  boardHeight: 'Board height',
  startingLevel: 'Starting level',
  linesPerLevel: 'Lines per level',
  baseDropMs: 'Starting drop speed (ms)',
  speedCurve: 'Speed curve (lower = faster ramp)',
  nextPieceCount: 'Next-piece preview count',
  lockDelayMs: 'Lock delay (ms)',
}

// A slider paired with a typeable number box. The number box lets the
// player type multi-digit values without interruption — it only clamps to
// [min, max] and commits on blur/Enter, not on every keystroke, so partial
// input (e.g. clearing the field to type a new number) isn't fought with.
// The slider stays a live, always-in-range mirror of the committed value.
function NumberSliderField({ label, value, min, max, step, onChange, disabled = false }) {
  const [text, setText] = useState(String(value))

  // Keep the text box in sync when the value changes from elsewhere (e.g.
  // the slider being dragged, or the panel re-opening with new settings).
  useEffect(() => {
    setText(String(value))
  }, [value])

  function commit(raw) {
    let next = Number(raw)
    if (Number.isNaN(next)) next = min
    next = Math.min(max, Math.max(min, next))
    setText(String(next))
    onChange(next)
  }

  return (
    <label className="settings-field">
      <span className="settings-field-header">
        <span>{label}</span>
        <input
          type="number"
          className="settings-number-input"
          min={min}
          max={max}
          step={step}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit(e.target.value)
              e.target.blur()
            }
          }}
        />
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export default function SettingsPanel({ settings, onApply, onClose }) {
  const [draft, setDraft] = useState(settings)

  function setField(key, value) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function setScoring(key, value) {
    setDraft((d) => ({ ...d, scoring: { ...d.scoring, [key]: value } }))
  }

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <h2>Rules</h2>
        <p className="settings-hint">Changes apply on restart, using a fresh board. Type a value or drag the slider — out-of-range numbers snap to the nearest limit.</p>

        <div className="settings-grid">
          {Object.entries(SETTINGS_LIMITS).map(([key, { min, max, step }]) => (
            <NumberSliderField
              key={key}
              label={FIELD_LABELS[key]}
              value={draft[key]}
              min={min}
              max={max}
              step={step}
              onChange={(v) => setField(key, v)}
              disabled={key === 'lockDelayMs' && !draft.lockDelayEnabled}
            />
          ))}

          <label className="settings-field">
            <span>Randomizer</span>
            <select
              value={draft.randomizer}
              onChange={(e) => setField('randomizer', e.target.value)}
            >
              <option value="bag">7-bag (fair)</option>
              <option value="random">Fully random</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Music</span>
            <select value={draft.music} onChange={(e) => setField('music', e.target.value)}>
              <option value="none">None</option>
              {Object.entries(MUSIC_TRACKS).map(([id, track]) => (
                <option key={id} value={id}>
                  {track.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field">
            <span>Skin</span>
            <select value={draft.skin} onChange={(e) => setField('skin', e.target.value)}>
              {SKIN_IDS.map((id) => (
                <option key={id} value={id}>
                  {SKINS[id].label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field toggle">
            <span>Ghost piece</span>
            <input
              type="checkbox"
              checked={draft.ghostPieceEnabled}
              onChange={(e) => setField('ghostPieceEnabled', e.target.checked)}
            />
          </label>

          <label className="settings-field toggle">
            <span>Hold piece</span>
            <input
              type="checkbox"
              checked={draft.holdEnabled}
              onChange={(e) => setField('holdEnabled', e.target.checked)}
            />
          </label>

          <label className="settings-field toggle">
            <span>Lock delay</span>
            <input
              type="checkbox"
              checked={draft.lockDelayEnabled}
              onChange={(e) => setField('lockDelayEnabled', e.target.checked)}
            />
          </label>

          <label className="settings-field toggle">
            <span>Countdown</span>
            <input
              type="checkbox"
              checked={draft.countdownEnabled}
              onChange={(e) => setField('countdownEnabled', e.target.checked)}
            />
          </label>
        </div>

        <h3>Scoring</h3>
        <div className="settings-grid">
          {['single', 'double', 'triple', 'tetris'].map((key) => (
            <NumberSliderField
              key={key}
              label={`${key[0].toUpperCase() + key.slice(1)} clear`}
              value={draft.scoring[key]}
              min={0}
              max={2000}
              step={50}
              onChange={(v) => setScoring(key, v)}
            />
          ))}
        </div>

        <div className="settings-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => {
              onApply(draft)
              onClose()
            }}
          >
            Apply &amp; restart
          </button>
        </div>
      </div>
    </div>
  )
}
