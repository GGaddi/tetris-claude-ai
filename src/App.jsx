import { useEffect, useRef, useState } from 'react'
import { useTetris } from './game/useTetris'
import { DEFAULT_SETTINGS, levelTheme } from './game/constants'
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
  const lastLockSeqRef = useRef(state.lockSeq)

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

  // Announce every new line clear with a spoken "single/double/triple/tetris"
  // plus a short original arcade-style fanfare that scales with clear size.
  useEffect(() => {
    if (state.lastClear && state.lastClear !== lastAnnouncedRef.current) {
      lastAnnouncedRef.current = state.lastClear
      announceClear(state.lastClear, { muted: sfxMuted, volume: sfxVolume })
      if (!sfxMuted) sfxEngine.playClearFanfare(state.lastClear.count)
    }
  }, [state.lastClear, sfxMuted, sfxVolume])

  // Play the same "thud" sound on every piece lock — whether the piece
  // landed from ordinary gravity or was hard-dropped. useTetris bumps
  // lockSeq exactly once per lock, so this fires uniformly for both.
  useEffect(() => {
    if (state.lockSeq !== lastLockSeqRef.current) {
      lastLockSeqRef.current = state.lockSeq
      if (!sfxMuted) sfxEngine.playHardDrop()
    }
  }, [state.lockSeq, sfxMuted])

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
  // just muted) any time we leave active play — back to the start screen
  // (fresh load, Restart, or applying new rules), paused, or game over —
  // and only (re)starts once the status becomes 'playing'. That means it
  // starts when the pre-game countdown finishes, not when the countdown
  // begins, and restarts from the top of the (possibly newly-selected)
  // track each time gameplay begins. On game over specifically, cutting
  // the music lets the game-over sting (above) stand on its own instead
  // of playing underneath the loop.
  useEffect(() => {
    const prev = prevStatusRef.current
    if (state.status !== prev) {
      if (state.status === 'ready' || state.status === 'paused' || state.status === 'gameover') {
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

  // From the game-over screen, Enter resets the board and jumps straight
  // into the countdown (skipping the ready/start screen) for a fast
  // "one more try" loop.
  function handleRestartFromGameOver() {
    musicEngine.unlock()
    actions.restartAndStart()
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (settingsOpen) return

      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (state.status === 'ready') {
          e.preventDefault()
          handleStart()
        } else if (state.status === 'gameover') {
          e.preventDefault()
          handleRestartFromGameOver()
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
          {state.settings.holdEnabled && <PiecePreview type={state.hold} label="Hold" />}
          <div className="controls-hint">
            <h3>Controls</h3>
            <ul>
              <li><kbd>&larr;</kbd> <kbd>&rarr;</kbd> move</li>
              <li><kbd>&darr;</kbd> soft drop</li>
              <li><kbd>Space</kbd> hard drop</li>
              <li><kbd>&uarr;</kbd> / <kbd>X</kbd> rotate CW</li>
              <li><kbd>Z</kbd> rotate CCW</li>
              {state.settings.holdEnabled && <li><kbd>C</kbd> hold</li>}
              <li><kbd>P</kbd> pause &nbsp; <kbd>R</kbd> restart</li>
            </ul>
          </div>
        </aside>

        <section
          className="board-wrap"
          style={{
            background: levelTheme(state.level).frame,
            '--level-line': levelTheme(state.level).line,
            '--level-panel': levelTheme(state.level).panel,
          }}
        >
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
            <button className="btn primary" onClick={() => actions.togglePause()}>
              {state.status === 'paused' ? 'Resume' : 'Pause'}
            </button>
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
            <button className="btn ghost" onClick={() => setSettingsOpen(true)}>
              Rules
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
