// Shared Web Audio API context. Music and SFX are on independent gain
// channels (see musicEngine.js / sfxEngine.js) but both hang off this same
// AudioContext, so everything mixes and the browser only ever spins up one
// audio graph.
let sharedCtx = null

export function getContext() {
  if (!sharedCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    sharedCtx = new Ctx()
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume()
  return sharedCtx
}
