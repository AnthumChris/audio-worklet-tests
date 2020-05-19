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
  
    // process left/right channels in stereo
    const [leftBuffer, rightBuffer] = await Promise.all([
      fetch('/audio/decoded-left.raw').then(r => r.arrayBuffer()),
      fetch('/audio/decoded-right.raw').then(r => r.arrayBuffer())
    ])

    status('ready')
    workletPort.postMessage({ leftBuffer, rightBuffer }, [leftBuffer, rightBuffer])
    workletPort.addEventListener('message', onWorkletMessage)

    // required for addEventListener
    // see https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start
    workletPort.start()

    return true
  }

  return false
}

function onWorkletMessage(e) {
  status(e.data.status)
}

function status(status) {
  if (status) {
    self.postMessage({ status })
  }
}
