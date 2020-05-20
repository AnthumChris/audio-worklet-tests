// This worker handles networking, download progress updates,
// and sends audio bytes to Audio Worklet

import { MockAudioSource } from './modules/MockAudioSource.js'
let workletPort

const audioSource = new MockAudioSource({ onReady: () => status('ready') })

// SharedArrayBuffer to put decoded PCM for Worklet
let samplesL, samplesR

self.onmessage = e => {
  initWorkletPort(e.data)
}

// set Worklet message port if received and not yet set
async function initWorkletPort({ port }) {
  if (!workletPort && port) {
    workletPort = port
  
    workletPort.addEventListener('message', onWorkletMessage)

    // required for addEventListener
    // see https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start
    workletPort.start()
  }
}

function onWorkletMessage({ data }) {
  if (data.status) {
    status(data.status)
  } else if (data.decodeInit) {
    decodeInit(data.decodeInit)
  } else if (data.decode) {
    decode(data.decode)
  }
}

// TODO, handle circular buffer overflow
async function decode({ start, length }) {
  const {left, right, isDone } = await audioSource.decode(length)
  samplesL.set(left, start)
  samplesR.set(right, start)
  workletPort.postMessage({
    decoded: {
      length: left.length,
      isDone
    }
  })
}

function decodeInit({ left, right }) {
  samplesL = left
  samplesR = right
  workletPort.postMessage({ decoderReady: {}})
}

// send status update to main thread
function status(status) {
  if (status) {
    self.postMessage({ status })
  }
}
