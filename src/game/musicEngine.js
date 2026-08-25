import { getContext } from './audioContext'
import { noteToFrequency } from './notes'
import { MUSIC_TRACKS } from './musicTracks'

// --- Background music channel -----------------------------------------------

class MusicEngine {
  constructor() {
    this.ctx = null
    this.gainNode = null
    this.trackId = 'none'
    this.volume = 0.5
    this.muted = false
    this.playing = false
    this.timeoutId = null
    this.activeNodes = [] // every oscillator/gain scheduled for the current pass
  }

  ensureGain() {
    const ctx = getContext()
    if (!ctx) return null
    this.ctx = ctx
    if (!this.gainNode) {
      this.gainNode = ctx.createGain()
      this.gainNode.gain.value = this.muted ? 0 : this.volume
      this.gainNode.connect(ctx.destination)
    }
    return ctx
  }

  setVolume(v) {
    this.volume = v
    if (this.gainNode) this.gainNode.gain.value = this.muted ? 0 : v
  }

  setMuted(muted) {
    this.muted = muted
    if (this.gainNode) this.gainNode.gain.value = muted ? 0 : this.volume
  }

  // Every place that changes the selected track also resets the game back
  // to the 'ready' status first, which already stops music via the
  // status-transition effect in App.jsx — so this just needs to update
  // which track will play next time start() is called.
  setTrack(trackId) {
    this.trackId = trackId
  }

  // Primes (creates/resumes) the shared AudioContext from a real user
  // gesture (e.g. clicking Start) without actually starting playback.
  // Browsers block audio that isn't tied to a gesture, so calling this
  // early means the later programmatic start() — fired once the pre-game
  // countdown finishes, not from a gesture — is allowed to make sound.
  unlock() {
    this.ensureGain()
  }

  // Must be called from (or shortly after) a user-gesture handler —
  // browsers block audio otherwise. Safe to call repeatedly; it no-ops if
  // already playing or the selected track is 'none'.
  start() {
    if (this.playing) return
    if (this.trackId === 'none' || !MUSIC_TRACKS[this.trackId]) return
    const ctx = this.ensureGain()
    if (!ctx) return
    this.playing = true
    this._scheduleLoop(ctx, MUSIC_TRACKS[this.trackId])
  }

  // Stops playback outright and immediately — including every note that
  // was already scheduled ahead of time for the rest of the current pass
  // (an entire melody+bass pass is scheduled up front, so just clearing
  // the next-pass timer isn't enough; it would let the current pass ring
  // out to its end). Calling start() again replays the track from the top.
  stop() {
    this.playing = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this._silenceActiveNodes()
  }

  _silenceActiveNodes() {
    const ctx = this.ctx
    const now = ctx ? ctx.currentTime : null
    this.activeNodes.forEach(({ osc, gain }) => {
      try {
        if (now !== null) {
          // Ramp to silence over ~15ms instead of cutting instantly, to
          // avoid an audible click, then stop the oscillator right after.
          gain.gain.cancelScheduledValues(now)
          gain.gain.setValueAtTime(gain.gain.value, now)
          gain.gain.linearRampToValueAtTime(0, now + 0.015)
          osc.stop(now + 0.02)
        } else {
          osc.stop()
        }
      } catch {
        // Already stopped/ended — nothing to do.
      }
    })
    this.activeNodes = []
  }

  _playNote(ctx, freq, startTime, duration, type, gainScale) {
    if (!freq) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.22 * gainScale, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95)
    osc.connect(gain)
    gain.connect(this.gainNode)
    const node = { osc, gain }
    this.activeNodes.push(node)
    osc.onended = () => {
      const i = this.activeNodes.indexOf(node)
      if (i !== -1) this.activeNodes.splice(i, 1)
    }
    osc.start(startTime)
    osc.stop(startTime + duration)
  }

  _scheduleLoop(ctx, track) {
    const beatSeconds = 60 / track.tempo
    const totalBeats = track.melody.reduce((sum, [, beats]) => sum + beats, 0)
    const totalDuration = totalBeats * beatSeconds

    const playPass = () => {
      if (!this.playing) return
      const startAt = ctx.currentTime + 0.05

      let t = startAt
      track.melody.forEach(([note, beats]) => {
        const duration = beats * beatSeconds
        this._playNote(ctx, noteToFrequency(note), t, duration, 'square', 1)
        t += duration
      })

      let bt = startAt
      ;(track.bass || []).forEach(([note, beats]) => {
        const duration = beats * beatSeconds
        this._playNote(ctx, noteToFrequency(note), bt, duration, 'triangle', 0.8)
        bt += duration
      })

      this.timeoutId = setTimeout(playPass, totalDuration * 1000)
    }

    playPass()
  }
}

export const musicEngine = new MusicEngine()
