// Note-name ("C5", "A#3", ...) to frequency conversion, shared by the
// music engine (melody/bass playback) and the sfx engine (line-clear
// fanfare arpeggios) so both read off the same tuning table.
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

export function noteToFrequency(note) {
  if (!note) return null // rest
  const match = /^([A-G]#?)(\d)$/.exec(note)
  if (!match) return null
  const [, pitch, octaveStr] = match
  const octave = Number(octaveStr)
  return NOTE_FREQUENCIES[pitch] * Math.pow(2, octave - 4)
}
