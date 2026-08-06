// Self-contained game audio: a tiny Web Audio synthesizer for background
// music and short game sound effects, plus a speech-synthesis based
// line-clear announcer. Everything here is generated in the browser — no
// audio files are loaded, so it works fully offline with no network or
// npm-install dependency.
//
// Music and "everything else" (announcer voice + game sound effects) are
// deliberately kept on two independent gain channels sharing one
// AudioContext, so the player can mix/mute them separately.

let sharedCtx = null

function getContext() {
  if (!sharedCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    sharedCtx = new Ctx()
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume()
  return sharedCtx
}

const NOTE_FREQUENCIES = {
  C: 261.63,
  'C#': 277.18,
  D: 293.66,
  'D#': 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  G: 392.0,
  'G#': 415.3,
  A: 440.0,
  'A#': 466.16,
  B: 493.88,
}

function noteToFrequency(note) {
  if (!note) return null // rest
  const match = /^([A-G]#?)(\d)$/.exec(note)
  if (!match) return null
  const [, pitch, octaveStr] = match
  const octave = Number(octaveStr)
  return NOTE_FREQUENCIES[pitch] * Math.pow(2, octave - 4)
}

// Each track is [note, beats] pairs (`null` note = rest) played at `tempo`
// beats-per-minute. "Korobeiniki" is a 19th-century Russian folk song in
// the public domain — its melody (not any particular game's recording or
// arrangement) is what's associated with "Tetris style" music, so it's
// safe to reproduce here as an original square-wave arrangement.
export const MUSIC_TRACKS = {
  korobeiniki: {
    label: 'Korobeiniki (Folk)',
    tempo: 150,
    melody: [
      ['E5', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['C5', 0.5], ['B4', 0.5],
      ['A4', 1], ['A4', 0.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
      ['B4', 1.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
      ['C5', 1], ['A4', 1], ['A4', 1], [null, 1],
      ['D5', 1], ['F5', 0.5], ['A5', 1], ['G5', 0.5], ['F5', 0.5],
      ['E5', 1.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
      ['B4', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
      ['C5', 1], ['A4', 1], ['A4', 1], [null, 1],
    ],
    bass: [
      ['A2', 2], ['E3', 2], ['A2', 2], ['E3', 2],
      ['A2', 2], ['E3', 2], ['A2', 1], ['G2', 1], ['E2', 2],
      ['D3', 2], ['A2', 2], ['D3', 2], ['A2', 2],
      ['G2', 2], ['E2', 2], ['A2', 1], ['A2', 1], [null, 2],
    ],
  },
  arcade: {
    label: 'Arcade Loop',
    tempo: 140,
    melody: [
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5],
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5],
      ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['F5', 0.5],
      ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['F5', 0.5],
      ['B4', 0.5], ['D5', 0.5], ['G5', 0.5], ['D5', 0.5],
      ['B4', 0.5], ['D5', 0.5], ['G5', 0.5], ['D5', 0.5],
      ['C5', 1], ['G4', 1], ['C5', 1], [null, 1],
    ],
    bass: [
      ['C3', 2], ['C3', 2], ['D3', 2], ['D3', 2],
      ['G2', 2], ['G2', 2], ['C3', 3], [null, 1],
    ],
  },
  // Two more original square/triangle-wave compositions, written to sit in
  // the general chiptune-puzzle-game mood without copying any specific
  // commercial soundtrack's melody or arrangement.
  driftLevels: {
    label: 'Neon Drift (Ambient)',
    tempo: 108,
    melody: [
      ['D5', 1], [null, 0.5], ['C5', 0.5], ['A4', 1.5], [null, 0.5],
      ['G4', 1], ['A4', 0.5], ['C5', 1], [null, 1],
      ['D5', 1], [null, 0.5], ['E5', 0.5], ['D5', 1.5], [null, 0.5],
      ['C5', 1], ['A4', 0.5], ['G4', 1], [null, 1],
      ['F4', 1], ['A4', 0.5], ['C5', 1.5], [null, 0.5],
      ['D5', 1], ['C5', 0.5], ['A4', 1], [null, 1],
      ['E4', 1], ['G4', 0.5], ['B4', 1.5], [null, 0.5],
      ['A4', 1], ['G4', 0.5], ['E4', 1], [null, 2],
    ],
    bass: [
      ['D3', 4], ['G2', 4],
      ['D3', 4], ['C3', 4],
      ['F2', 4], ['D3', 4],
      ['E2', 4], ['A2', 4],
    ],
  },
  vectorRush: {
    label: 'Vector Rush (Classic)',
    tempo: 168,
    melody: [
      ['G4', 0.5], ['C5', 0.5], ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['G4', 1],
      ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['A4', 1],
      ['F4', 0.5], ['A4', 0.5], ['C5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 0.5], ['F4', 1],
      ['G4', 0.5], ['B4', 0.5], ['D5', 0.5], ['G5', 1], ['D5', 0.5], ['B4', 0.5],
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['B4', 1],
      ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 1], ['G5', 0.5], ['E5', 0.5],
      ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 2],
      [null, 1],
    ],
    bass: [
      ['C3', 2], ['G2', 2],
      ['A2', 2], ['E2', 2],
      ['F2', 2], ['C3', 2],
      ['G2', 1.5], ['D2', 1.5], ['G2', 1],
      ['C3', 2], ['B2', 2],
      ['A2', 2], ['E2', 2],
      ['F2', 1], ['G2', 1], ['C2', 2],
      ['C2', 1],
    ],
  },
}

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

  playGameOver() {
    const notes = [392.0, 349.23, 293.66, 261.63] // G4, F4, D4, C4 — descending
    notes.forEach((freq, i) => this._blip(freq, i * 0.18, 0.28, 'square'))
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

// --- Line-clear voice announcer ---------------------------------------------

let cachedVoice = null

function pickFemaleVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const femaleHint = /female|samantha|victoria|zira|susan|karen|moira|tessa|fiona|allison/i
  cachedVoice = voices.find((v) => femaleHint.test(v.name)) || voices.find((v) => v.lang?.startsWith('en')) || voices[0]
  return cachedVoice
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Voice list often loads asynchronously — clear the cache so the next
  // announcement can pick from the full list once it's ready.
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
  }
}

// Pitch/rate ramp up with how many lines were cleared, so a Tetris sounds
// noticeably more excited than a single — pushed up further for a hyped,
// arcade-announcer energy.
const ANNOUNCE_ENERGY = {
  1: { pitch: 1.3, rate: 1.15 },
  2: { pitch: 1.45, rate: 1.22 },
  3: { pitch: 1.6, rate: 1.3 },
  4: { pitch: 1.85, rate: 1.42 },
}

// `clear` is { count, label } (see useTetris's lastClear). Volume/muted
// come from the SFX channel, independent of the music channel.
export function announceClear(clear, { muted = false, volume = 1 } = {}) {
  if (muted || !clear || !clear.label) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const energy = ANNOUNCE_ENERGY[clear.count] || ANNOUNCE_ENERGY[1]
  const text = clear.count >= 4 ? `${clear.label.toUpperCase()}!!` : `${clear.label.toUpperCase()}!`
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickFemaleVoice()
  if (voice) utterance.voice = voice
  utterance.pitch = Math.min(2, energy.pitch)
  utterance.rate = energy.rate
  utterance.volume = Math.max(0, Math.min(1, volume))
  window.speechSynthesis.cancel() // don't let announcements stack up
  window.speechSynthesis.speak(utterance)
}

export function cancelAnnouncement() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
