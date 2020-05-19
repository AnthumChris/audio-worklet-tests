// This worklet receives bytes from Worker and plays audio

class MyWorklet extends AudioWorkletProcessor {
  _inputSampleIdx = 0
  _inputSamples = null

  constructor() {
    super()
    this.port.onmessage = this.onMessage.bind(this)
  }

  onMessage(e) {
    const { pcmBuffer } = e.data;
    if (!this._inputSamples && pcmBuffer) {
      this._inputSamples = new Float32Array(pcmBuffer)
    }
  }

  process(inputs, outputs) {
    if (this._inputSamples) {
      return this.setOutputSamples(outputs[0][0])
    } else {
      return true;
    }
  }

  setOutputSamples(output) {
    const startIdx = this._inputSampleIdx
    const endIdx = Math.min(startIdx+output.length, this._inputSamples.length)
    const totalSamplesOut = endIdx - startIdx
    this._inputSampleIdx+= totalSamplesOut

    if (totalSamplesOut > 0) {
      output.set(this._inputSamples.subarray(startIdx, endIdx))
      return true
    } else {
      console.log('finished')
      return false
    }
  }
}

registerProcessor('worklet', MyWorklet)
