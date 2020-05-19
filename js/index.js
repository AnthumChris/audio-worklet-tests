const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const worker = new Worker('js/worker.js')
worker.onmessage = onWorkerMessage

const ctx = new AudioContext({
  latencyHint: 'playback'
})
ctx.suspend()

initWorklet()

async function initWorklet() {
  await ctx.audioWorklet.addModule('js/worklet.js')
  const workletNode = new AudioWorkletNode(ctx, 'worklet', {
    outputChannelCount: [1]
  })
  workletNode.connect(ctx.destination)
  const { port } = workletNode 
  worker.postMessage({ port }, [port])
}

function pause() {
  ctx.suspend()
}

function play() {
  ctx.resume()
}

function onWorkerMessage({ data }) {
  const { status } = data
  if (status === 'ready') {
    document.querySelectorAll('button[disabled]').forEach(el => el.disabled = false)
    document.querySelector('#status').innerText = ''
  }
}
