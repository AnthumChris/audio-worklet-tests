// Maintains decoded cample pool by communicating with Worker
// Worklet's process() calls outputStereo() to play sound

export class DecodedSamplePool {
  _port                 // Worker Message Port
  _inputSamples = null  // left/right PCM samples to read from
  _inputSampleIdx = 0   // read index/offset

  constructor(port) {
    this._port = port

    this._port.addEventListener('message', this.onWorkerMessage.bind(this))    
    port.start()
  }

  onWorkerMessage(e) {
    const { leftBuffer, rightBuffer } = e.data
    if (!this._inputSamples && leftBuffer && rightBuffer) {
      this._inputSamples = {
        left: new Float32Array(leftBuffer),
        right: new Float32Array(rightBuffer)
      }
    }
  }

  outputStereo([ outLeft, outRight ]) {
    if (!this._inputSamples)
      return true

    const startIdx = this._inputSampleIdx
    const endIdx = Math.min(startIdx+outLeft.length, this._inputSamples.left.length)
    const totalSamplesOut = endIdx - startIdx
    this._inputSampleIdx+= totalSamplesOut

    if (totalSamplesOut > 0) {
      outLeft.set(this._inputSamples.left.subarray(startIdx, endIdx))
      outRight.set(this._inputSamples.right.subarray(startIdx, endIdx))
      return true
    } else {
      return false
    }
  }
}
