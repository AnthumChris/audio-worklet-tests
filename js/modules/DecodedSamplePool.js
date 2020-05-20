// Maintains decoded cample pool by communicating with Worker.
// SharedArrayBuffer is shared with Worker to decode on a circular buffer..
// Worklet's process() calls outputStereo() to play sound.

export class DecodedSamplePool {
  _decodeWorkerPort                 // Worker Message Port

  // min samples to keep decoded, max to decode
  // new samples are decoded when min is reached
  _minDecodedSamples = sampleRate * 2.0  // 2s per channel
  _maxDecodedSamples = 297910  // static test, play all samples in one iteration
  
  // TODO, use circular buffer with multiple decode() calls
  // _maxDecodedSamples = sampleRate * 4.0  // 4s per channel


  // left/right decoded channels. Shared with Worker
  _decodedSamplesL = new Float32Array(
    new SharedArrayBuffer(this._maxDecodedSamples * Float32Array.BYTES_PER_ELEMENT)
  )
  _decodedSamplesR = new Float32Array(
    new SharedArrayBuffer(this._maxDecodedSamples * Float32Array.BYTES_PER_ELEMENT)
  )

  // start/end indexes of unplayed, decoded samples on SharedArrayBuffer
  _unplayedStart = 0
  _unplayedEnd = 0

  // _decodedSamples = null  // left/right PCM samples to read from
  _inputSampleIdx = 0   // read index/offset

  constructor(port) {
    this._decodeWorkerPort = port
    port.addEventListener('message', this.onWorkerMessage.bind(this))    
    port.start()  // required for addEventListener
    this.decodeInit()
  }

  decodeInit() {
    this._decodeWorkerPort.postMessage({
      decodeInit: {
        left: this._decodedSamplesL,
        right: this._decodedSamplesR,
      }
    })
  }

  decode() {
    this._decodeWorkerPort.postMessage({
      decode: {
        start: this._unplayedStart,
        length: this._maxDecodedSamples - (this._unplayedEnd - this._unplayedStart)
      }
    })
  }

  onDecoded({ length, isDone }) {
    this._unplayedEnd += length
  }

  onWorkerMessage({ data }) {
    if (data.decoderReady) {
      this.decode()
    } else if (data.decoded) {
      this.onDecoded(data.decoded)
    }
  }

  outputStereo([ outLeft, outRight ]) {
    // no samples added yet
    if (this._unplayedEnd === 0)
      return true

    // TODO, handle circular buffer overflow
    const startIdx = this._unplayedStart
    const endIdx = Math.min(startIdx+outLeft.length, this._unplayedEnd)
    const totalSamplesOut = endIdx - startIdx
    this._unplayedStart += totalSamplesOut

    if (totalSamplesOut > 0) {
      outLeft.set(this._decodedSamplesL.subarray(startIdx, endIdx))
      outRight.set(this._decodedSamplesR.subarray(startIdx, endIdx))
      return true
    } else {
      return false
    }
  }
}
