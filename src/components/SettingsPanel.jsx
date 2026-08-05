import { useState } from 'react'
import { SETTINGS_LIMITS } from '../game/constants'
import { MUSIC_TRACKS } from '../game/audio'

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
        <p className="settings-hint">Changes apply on restart, using a fresh board.</p>

        <div className="settings-grid">
          {Object.entries(SETTINGS_LIMITS).map(([key, { min, max, step }]) => (
            <label key={key} className="settings-field">
              <span>
                {FIELD_LABELS[key]} — <strong>{draft[key]}</strong>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={draft[key]}
                onChange={(e) => setField(key, Number(e.target.value))}
              />
            </label>
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
        </div>

        <h3>Scoring</h3>
        <div className="settings-grid">
          {['single', 'double', 'triple', 'tetris'].map((key) => (
            <label key={key} className="settings-field">
              <span>
                {key[0].toUpperCase() + key.slice(1)} clear — <strong>{draft.scoring[key]}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={draft.scoring[key]}
                onChange={(e) => setScoring(key, Number(e.target.value))}
              />
            </label>
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
