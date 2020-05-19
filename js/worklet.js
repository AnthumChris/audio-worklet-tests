// This worklet receives decoded PCM from Worker and plays audio
import { DecodedSamplePool } from './modules/DecodedSamplePool.js'

class MyWorklet extends AudioWorkletProcessor {
  _samples  // DecodedSamplePool from Worker

  constructor() {
    super()
    this._samples = new DecodedSamplePool(this.port)
  }

  process(inputs, outputs) {
    if (!this._samples.outputStereo(outputs[0])) {
      console.log('AudioWorklet ended')
      return false
    }

    return true
  }
}

registerProcessor('worklet', MyWorklet)
