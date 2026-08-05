// Self-contained game audio: a tiny Web Audio synthesizer for background
// music, plus a speech-synthesis based line-clear announcer. Everything
// here is generated in the browser — no audio files are loaded, so it
// works fully offline and has no network or npm-install dependency.

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
}

class MusicEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.trackId = 'none'
    this.volume = 0.5
    this.muted = false
    this.playing = false
    this.timeoutId = null
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      this.ctx = new Ctx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.muted ? 0 : this.volume
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  setVolume(v) {
    this.volume = v
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : v
  }

  setMuted(muted) {
    this.muted = muted
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : this.volume
  }

  setTrack(trackId) {
    if (trackId === this.trackId) return
    const wasPlaying = this.playing
    this.trackId = trackId
    if (wasPlaying) {
      this.stop()
      this.start()
    }
  }

  // Must be called from a user-gesture handler (browsers block audio
  // otherwise). Safe to call repeatedly — it no-ops if already playing.
  start() {
    if (this.playing) return
    if (this.trackId === 'none' || !MUSIC_TRACKS[this.trackId]) return
    if (!this.ensureContext()) return
    this.playing = true
    this._scheduleLoop(MUSIC_TRACKS[this.trackId])
  }

  stop() {
    this.playing = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  _playNote(freq, startTime, duration, type, gainScale) {
    if (!freq) return
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.22 * gainScale, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(startTime)
    osc.stop(startTime + duration)
  }

  _scheduleLoop(track) {
    const beatSeconds = 60 / track.tempo
    const totalBeats = track.melody.reduce((sum, [, beats]) => sum + beats, 0)
    const totalDuration = totalBeats * beatSeconds

    const playPass = () => {
      if (!this.playing) return
      const startAt = this.ctx.currentTime + 0.05

      let t = startAt
      track.melody.forEach(([note, beats]) => {
        const duration = beats * beatSeconds
        this._playNote(noteToFrequency(note), t, duration, 'square', 1)
        t += duration
      })

      let bt = startAt
      ;(track.bass || []).forEach(([note, beats]) => {
        const duration = beats * beatSeconds
        this._playNote(noteToFrequency(note), bt, duration, 'triangle', 0.8)
        bt += duration
      })

      this.timeoutId = setTimeout(playPass, totalDuration * 1000)
    }

    playPass()
  }
}

export const musicEngine = new MusicEngine()

// --- Line-clear voice announcer --------------------------------------------

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

export function announceClear(label, { muted = false, volume = 1 } = {}) {
  if (muted || !label) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(label.toUpperCase())
  const voice = pickFemaleVoice()
  if (voice) utterance.voice = voice
  utterance.pitch = 1.15
  utterance.rate = 1.05
  utterance.volume = Math.max(0, Math.min(1, volume))
  window.speechSynthesis.cancel() // don't let announcements stack up
  window.speechSynthesis.speak(utterance)
}
