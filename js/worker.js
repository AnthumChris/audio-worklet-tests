// This worker handles networking, download progress updates,
// and sends audio bytes to Audio Worklet

let workletPort

self.onmessage = e => {
  initWorkletPort(e.data)
}

// set Worklet message port if received and not yet set
async function initWorkletPort({ port }) {
  if (!workletPort && port) {
    workletPort = port
  
    // process mono channel for now
    const pcmBuffer = await fetch('/audio/decoded-left.raw').then(r => r.arrayBuffer())
    // const pcmBuffer = await fetch('audio/decoded-stereo.raw').then(r => r.arrayBuffer())

    status('ready')
    workletPort.postMessage({ pcmBuffer }, [pcmBuffer])
  }
}

function status(status) {
  self.postMessage({ status })
}
