import { useEffect, useRef, useState } from 'react'
import { useTetris } from './game/useTetris'
import { DEFAULT_SETTINGS } from './game/constants'
import { musicEngine, sfxEngine, announceClear, cancelAnnouncement } from './game/audio'
import Board from './components/Board'
import PiecePreview from './components/PiecePreview'
import StatusPanel from './components/StatusPanel'
import SettingsPanel from './components/SettingsPanel'
import VolumeControl from './components/VolumeControl'

export default function App() {
  const { state, ghostY, nextTypes, actions } = useTetris(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const [musicVolume, setMusicVolume] = useState(0.5)
  const [sfxMuted, setSfxMuted] = useState(false)
  const [sfxVolume, setSfxVolume] = useState(0.6)
  const lastAnnouncedRef = useRef(null)
  const gameOverAnnouncedRef = useRef(false)
  const prevStatusRef = useRef(state.status)

  // Keep the audio engine's track selection, volume, and mute state in
  // sync with React state (the engines themselves are plain JS singletons,
  // not React-managed, since Web Audio nodes aren't something React renders).
  useEffect(() => {
    musicEngine.setTrack(state.settings.music)
  }, [state.settings.music])

  useEffect(() => {
    musicEngine.setVolume(musicVolume)
  }, [musicVolume])

  useEffect(() => {
    musicEngine.setMuted(musicMuted)
  }, [musicMuted])

  useEffect(() => {
    sfxEngine.setVolume(sfxVolume)
  }, [sfxVolume])

  useEffect(() => {
    sfxEngine.setMuted(sfxMuted)
  }, [sfxMuted])

  // Announce every new line clear with a spoken "single/double/triple/tetris".
  useEffect(() => {
    if (state.lastClear && state.lastClear !== lastAnnouncedRef.current) {
      lastAnnouncedRef.current = state.lastClear
      announceClear(state.lastClear, { muted: sfxMuted, volume: sfxVolume })
    }
  }, [state.lastClear, sfxMuted, sfxVolume])

  // Game-over sting, played once per game-over.
  useEffect(() => {
    if (state.status === 'gameover' && !gameOverAnnouncedRef.current) {
      gameOverAnnouncedRef.current = true
      if (!sfxMuted) sfxEngine.playGameOver()
    }
    if (state.status !== 'gameover') {
      gameOverAnnouncedRef.current = false
    }
  }, [state.status, sfxMuted])

  // Music only ever plays during actual gameplay. It stops outright (not
  // just muted) any time we land back on the start screen — fresh load,
  // Restart, or applying new rules — or when the game is paused, and only
  // (re)starts once the status becomes 'playing'. That means it starts
  // when the pre-game countdown finishes, not when the countdown begins,
  // and restarts from the top of the (possibly newly-selected) track each
  // time gameplay begins.
  useEffect(() => {
    const prev = prevStatusRef.current
    if (state.status !== prev) {
      if (state.status === 'ready' || state.status === 'paused') {
        musicEngine.stop()
        cancelAnnouncement()
      } else if (state.status === 'playing' && prev !== 'playing') {
        musicEngine.start()
      }
      prevStatusRef.current = state.status
    }
  }, [state.status])

  // Browsers require a user gesture before audio can play. Pressing Start
  // only primes (unlocks) the audio context here — actual music playback
  // begins once the countdown finishes and the status-transition effect
  // above sees 'playing'.
  function handleStart() {
    musicEngine.unlock()
    actions.start()
  }

  // Applying rule changes resets the game back to the 'ready' status,
  // which the effect above already reacts to by stopping music. The next
  // time gameplay starts, it'll play whichever track is now selected.
  function handleApplySettings(newSettings) {
    actions.updateSettings(newSettings)
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (settingsOpen) return

      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (state.status === 'ready') {
          e.preventDefault()
          handleStart()
        }
        return
      }

      if (state.status === 'ready') return

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault()
          actions.move(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          actions.move(1)
          break
        case 'ArrowDown':
          e.preventDefault()
          actions.softDrop(true)
          break
        case 'ArrowUp':
        case 'KeyX':
          e.preventDefault()
          actions.rotate(1)
          break
        case 'KeyZ':
          e.preventDefault()
          actions.rotate(-1)
          break
        case 'Space':
          e.preventDefault()
          if (state.status === 'playing') sfxEngine.playHardDrop()
          actions.hardDrop()
          break
        case 'KeyC':
        case 'ShiftLeft':
          e.preventDefault()
          actions.hold()
          break
        case 'KeyP':
          e.preventDefault()
          actions.togglePause()
          break
        case 'KeyR':
          e.preventDefault()
          actions.restart()
          break
        default:
          break
      }
    }
    function onKeyUp(e) {
      if (e.code === 'ArrowDown') actions.softDrop(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [actions, settingsOpen, state.status])

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          DROP<span className="accent">//</span>
        </h1>
        <p className="tagline">a tetromino stacker with rules you can bend</p>
      </header>

      <main className="layout">
        <aside className="panel left">
          <PiecePreview type={state.hold} label="Hold" dim={!state.settings.holdEnabled} />
          <div className="controls-hint">
            <h3>Controls</h3>
            <ul>
              <li><kbd>&larr;</kbd> <kbd>&rarr;</kbd> move</li>
              <li><kbd>&darr;</kbd> soft drop</li>
              <li><kbd>Space</kbd> hard drop</li>
              <li><kbd>&uarr;</kbd> / <kbd>X</kbd> rotate CW</li>
              <li><kbd>Z</kbd> rotate CCW</li>
              <li><kbd>C</kbd> hold</li>
              <li><kbd>P</kbd> pause &nbsp; <kbd>R</kbd> restart</li>
            </ul>
          </div>
        </aside>

        <section className="board-wrap">
          <Board board={state.board} current={state.current} ghostY={state.settings.ghostPieceEnabled ? ghostY : null} />
        </section>

        <aside className="panel right">
          <div className="status-row">
            <StatusPanel
              score={state.score}
              level={state.level}
              lines={state.lines}
              status={state.status}
              lastClear={state.lastClear}
            />

            <div className="audio-controls">
              <VolumeControl
                icon="music"
                label="Music"
                muted={musicMuted}
                volume={musicVolume}
                onToggleMute={() => setMusicMuted((m) => !m)}
                onVolumeChange={setMusicVolume}
              />
              <VolumeControl
                icon="speaker"
                label="Announcer & sound effects"
                muted={sfxMuted}
                volume={sfxVolume}
                onToggleMute={() => setSfxMuted((m) => !m)}
                onVolumeChange={setSfxVolume}
              />
            </div>
          </div>

          <div className="next-queue">
            <span className="preview-label">Next</span>
            {nextTypes.map((t, i) => (
              <PiecePreview key={i} type={t} label={i === 0 ? 'On deck' : `+${i}`} size={14} />
            ))}
          </div>

          <div className="panel-actions">
            {state.status === 'ready' && (
              <button className="btn primary" onClick={handleStart}>
                Start
              </button>
            )}
            {state.status === 'countdown' && (
              <button className="btn primary" disabled>
                Starting in {state.countdown}&hellip;
              </button>
            )}
            {(state.status === 'playing' || state.status === 'paused' || state.status === 'gameover') && (
              <button className="btn primary" onClick={() => actions.togglePause()}>
                {state.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
            )}
            <button className="btn ghost" onClick={() => actions.restart()}>
              Restart
            </button>
            <button className="btn ghost" onClick={() => setSettingsOpen(true)}>
              Rules
            </button>
          </div>
        </aside>
      </main>

      {state.status === 'ready' && (
        <div className="start-overlay">
          <div className="start-panel">
            <h2>
              DROP<span className="accent">//</span>
            </h2>
            <p>Press <kbd>Enter</kbd> or click Start to begin</p>
            <button className="btn primary" onClick={handleStart}>
              Start
            </button>
          </div>
        </div>
      )}

      {state.status === 'countdown' && (
        <div className="start-overlay">
          <div className="countdown-number" key={state.countdown}>
            {state.countdown}
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={state.settings}
          onApply={handleApplySettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
