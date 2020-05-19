const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const ctx = new AudioContext({
  latencyHint: 'playback'
})
ctx.suspend()

initWorklet()
document.addEventListener('DOMContentLoaded', initDom)

async function initWorklet() {
  console.log('initWorklet()')

  const worker = new Worker('js/worker.js')
  worker.onmessage = onWorkerMessage

  await ctx.audioWorklet.addModule('js/worklet.js')
  const workletNode = new AudioWorkletNode(ctx, 'worklet', {
    outputChannelCount: [2]  // stereo
  })
  workletNode.connect(ctx.destination)

  // Worklet cannot directly create/use a Worker.
  // Instead, transfer worklet's port to Worker
  const { port } = workletNode
  worker.postMessage({ port }, [port])
}

function initDom() {
  console.log('initDom()')
  $('#play').onclick = () => ctx.resume()
  $('#pause').onclick = () => ctx.suspend()
  $('#reset').onclick = () => document.location.reload()
}

function onWorkerMessage({ data }) {
  const { status } = data
  if (status === 'ready') {
    console.log('ready')
    $$('button[disabled]').forEach(el => el.disabled = false)
    $('#status').innerText = ''
  }
}
