// --- Line-clear voice announcer ---------------------------------------------
// Speaks "single/double/triple/tetris" via the browser's SpeechSynthesis
// API whenever useTetris reports a new line clear. Independent of the SFX
// gain channel (musicEngine.js/sfxEngine.js) since SpeechSynthesis doesn't
// route through Web Audio — volume/mute are applied manually per call.

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
