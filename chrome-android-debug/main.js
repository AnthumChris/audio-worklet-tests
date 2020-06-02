/* Simple AudioWorklet audio playback of fetched URL */

// fetch stereo audio to play
const url = 'https://opus-bitrates.anthum.com/audio/debug-64.opus'
const sampleRate = 48000
const latencyHint = 'playback'

const ctx = new AudioContext({ sampleRate, latencyHint })
const elStatus = document.querySelector('#status')
const elButton = document.querySelector('button')

init().catch(showError)

async function init() {
  ctx.suspend() // start paused

  // fetch and decode audio
  const decoded = await ctx.decodeAudioData(
    await (await fetch(url)).arrayBuffer()
  )

  // init AudioWorklet
  await ctx.audioWorklet.addModule('worklet-audio-loop.js')
  const workletNode = new AudioWorkletNode(ctx, 'worklet-audio-loop', {
    outputChannelCount: [2]  // stereo
  })
  workletNode.connect(ctx.destination)

  // transfer decoded audio to worklet
  const [left, right] = [
    decoded.getChannelData(0),
    decoded.getChannelData(1)
  ] 
  workletNode.port.postMessage(
    { left, right },
    [left.buffer, right.buffer]
  )

  // init DOM controls
  elButton.addEventListener('click', onBtnClick)
  onBtnClick(null, true)
  status('')
  elButton.hidden = false
}

// set button text
async function onBtnClick(evt, isForcedPause) {
  if (isForcedPause || ctx.state === 'running') {
    await ctx.suspend()
    elButton.innerText = 'Play'
  } else if (ctx.state === 'suspended') {
    await ctx.resume()
    elButton.innerText = 'Pause'
  }
}

function status(msg) {
  elStatus.innerText = msg
}

function showError(e) {
  status(`ERROR: ${e}`)
}
