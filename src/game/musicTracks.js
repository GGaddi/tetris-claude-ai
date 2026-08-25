// Background-music track data for MusicEngine (game/musicEngine.js) and
// for the Music dropdown in SettingsPanel. Each track is [note, beats]
// pairs (`null` note = rest) played at `tempo` beats-per-minute.
// "Korobeiniki" is a 19th-century Russian folk song in the public domain
// — its melody (not any particular game's recording or arrangement) is
// what's associated with "Tetris style" music, so it's safe to reproduce
// here as an original square-wave arrangement.
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
  // Three more original compositions written to capture the general mood
  // of a bouncy kart-racing tune, an epic mid-tempo driving theme, and a
  // tense back-and-forth battle tune, respectively — none transcribe or
  // arrange any specific existing copyrighted melody.
  sprintCircuit: {
    label: 'Sprint Circuit (Racing)',
    tempo: 165,
    melody: [
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 0.5],
      ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5],
      ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['D6', 0.5],
      ['A5', 0.5], ['F5', 0.5], ['D5', 0.5], ['F5', 0.5],
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 0.5],
      ['B5', 0.5], ['G5', 0.5], ['E5', 0.5], ['D5', 0.5],
      ['C5', 1.5], [null, 0.5],
    ],
    bass: [
      ['C3', 1], ['G2', 1], ['C3', 1], ['G2', 1],
      ['D3', 1], ['A2', 1], ['D3', 1], ['A2', 1],
      ['C3', 1], ['G2', 1], ['F2', 1], ['G2', 1],
      ['C3', 2],
    ],
  },
  dutysCall: {
    label: "Duty's Call (Epic)",
    tempo: 145,
    melody: [
      ['E5', 1], ['D5', 0.5], ['E5', 0.5], ['G5', 1], [null, 0.5], ['F5', 0.5],
      ['E5', 1], ['D5', 0.5], ['C5', 0.5], ['D5', 1.5], [null, 0.5],
      ['A4', 1], ['C5', 0.5], ['E5', 0.5], ['D5', 1], [null, 0.5], ['C5', 0.5],
      ['B4', 1.5], ['A4', 0.5], ['G4', 1], [null, 1],
    ],
    bass: [
      ['E2', 1], ['E2', 0.5], ['E2', 0.5], ['G2', 1], ['E2', 1],
      ['D2', 1], ['D2', 0.5], ['D2', 0.5], ['A2', 2],
      ['A2', 1], ['A2', 0.5], ['A2', 0.5], ['E2', 1], ['A2', 1],
      ['G2', 1.5], ['E2', 0.5], ['E2', 1], [null, 1],
    ],
  },
  rivalShowdown: {
    label: 'Rival Showdown (Battle)',
    tempo: 160,
    melody: [
      ['G4', 0.5], ['G4', 0.5], ['C5', 0.5], ['G4', 0.5], ['E5', 0.5], ['C5', 0.5], ['G4', 0.5], [null, 0.5],
      ['A4', 0.5], ['A4', 0.5], ['D5', 0.5], ['A4', 0.5], ['F5', 0.5], ['D5', 0.5], ['A4', 0.5], [null, 0.5],
      ['E5', 0.5], ['F5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 1], ['D5', 1],
      ['G4', 0.5], ['B4', 0.5], ['D5', 0.5], ['G5', 1.5], [null, 0.5],
    ],
    bass: [
      ['C3', 1], ['C3', 1], ['C3', 1], ['C3', 1],
      ['D3', 1], ['D3', 1], ['D3', 1], ['D3', 1],
      ['C3', 1], ['C3', 1], ['G2', 2],
      ['G2', 1], ['G2', 1], ['C3', 2],
    ],
  },
}
