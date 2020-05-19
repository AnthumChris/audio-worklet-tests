// This worklet receives bytes from Worker and plays audio

class MyWorklet extends AudioWorkletProcessor {
  _inputSamples = null  // left/right PCM samples to read from
  _inputSampleIdx = 0   // read index/offset

  constructor() {
    super()
    this.port.onmessage = this.onMessage.bind(this)
  }

  onMessage(e) {
    const { leftBuffer, rightBuffer } = e.data;
    if (!this._inputSamples && leftBuffer && rightBuffer) {
      this._inputSamples = {
        left: new Float32Array(leftBuffer),
        right: new Float32Array(rightBuffer)
      }
    }
  }

  process(inputs, outputs) {
    if (this._inputSamples) {
      return this.setOutputSamples(outputs[0])
    } else {
      return true;
    }
  }

  setOutputSamples([outLeft, outRight]) {
    const startIdx = this._inputSampleIdx
    const endIdx = Math.min(startIdx+outLeft.length, this._inputSamples.left.length)
    const totalSamplesOut = endIdx - startIdx
    this._inputSampleIdx+= totalSamplesOut

    if (totalSamplesOut > 0) {
      outLeft.set(this._inputSamples.left.subarray(startIdx, endIdx))
      outRight.set(this._inputSamples.right.subarray(startIdx, endIdx))
      return true
    } else {
      console.log('finished')
      return false
    }
  }
}

registerProcessor('worklet', MyWorklet)
