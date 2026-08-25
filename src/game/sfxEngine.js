import { getContext } from './audioContext'
import { noteToFrequency } from './notes'

// --- Announcer + game sound-effects channel ---------------------------------

class SfxEngine {
  constructor() {
    this.gainNode = null
    this.volume = 0.6
    this.muted = false
  }

  ensureGain() {
    const ctx = getContext()
    if (!ctx) return null
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

  // Effective 0-1 volume for non-Web-Audio sounds (e.g. SpeechSynthesis),
  // which don't route through gainNode and so need their volume applied
  // manually.
  get effectiveVolume() {
    return this.muted ? 0 : this.volume
  }

  _blip(freq, startDelay, duration, type) {
    const ctx = this.ensureGain()
    if (!ctx) return
    const t0 = ctx.currentTime + startDelay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.linearRampToValueAtTime(0.3, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
    osc.connect(gain)
    gain.connect(this.gainNode)
    osc.start(t0)
    osc.stop(t0 + duration)
  }

  playHardDrop() {
    const ctx = this.ensureGain()
    if (!ctx) return
    const t0 = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(200, t0)
    osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.12)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.linearRampToValueAtTime(0.35, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16)
    osc.connect(gain)
    gain.connect(this.gainNode)
    osc.start(t0)
    osc.stop(t0 + 0.16)
  }

  // A short descending phrase followed by a low sustained note — a
  // self-contained "that's it" cadence, since it plays as the only sound
  // once the music has been stopped for game over.
  playGameOver() {
    const ctx = this.ensureGain()
    if (!ctx) return
    const notes = [392.0, 349.23, 293.66, 261.63] // G4, F4, D4, C4 — descending
    notes.forEach((freq, i) => this._blip(freq, i * 0.18, 0.3, 'square'))

    const finalDelay = notes.length * 0.18 + 0.05
    const t0 = ctx.currentTime + finalDelay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(130.81, t0) // C3
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.linearRampToValueAtTime(0.35, t0 + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.1)
    osc.connect(gain)
    gain.connect(this.gainNode)
    osc.start(t0)
    osc.stop(t0 + 1.1)
  }

  // Short original ascending arpeggio "sting" that plays alongside the
  // announcer voice on a line clear — more notes and a tighter, brighter
  // run the bigger the clear, for extra arcade-style celebration.
  playClearFanfare(count) {
    const notes = FANFARE_NOTES[count] || FANFARE_NOTES[1]
    const gap = count >= 4 ? 0.06 : 0.09
    notes.forEach((note, i) => {
      this._blip(noteToFrequency(note), i * gap, 0.2, 'square')
    })
    if (count >= 4) {
      // Tetris gets an extra triumphant chord stab on top of the run.
      const chord = ['C6', 'E6', 'G6']
      chord.forEach((note) => this._blip(noteToFrequency(note), notes.length * gap + 0.02, 0.4, 'triangle'))
    }
  }
}

const FANFARE_NOTES = {
  1: ['C5', 'E5'],
  2: ['C5', 'E5', 'G5'],
  3: ['C5', 'E5', 'G5', 'C6'],
  4: ['C5', 'E5', 'G5', 'C6', 'E6'],
}

export const sfxEngine = new SfxEngine()
