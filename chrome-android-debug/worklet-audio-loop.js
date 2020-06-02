class AudioLoopPlayer extends AudioWorkletProcessor {
  pcmLeft       // decoded pcm samples left
  pcmRight      // decoded pcm samples right
  readIdx = 0   // wrap-around pointer for reading files and looping

  constructor() {
    super()

    // receive decoded audio
    this.port.onmessage = ({ data: { left, right }}) => {
      if (left && right) {
        [this.pcmLeft, this.pcmRight] = [left, right]
        this.readIdx = 0
      }
    }
  }

  process(inputs, [[ outLeft, outRight ]]) {
    // play audio if received & set
    if (this.pcmLeft && this.pcmRight) {
      for (let i=0; i < outLeft.length; i++, this.readIdx++) {
        // wrap around and loop at end
        if (this.readIdx === this.pcmLeft.length) {
          this.readIdx = 0
        }

        outLeft[i] = this.pcmLeft[this.readIdx]
        outRight[i] = this.pcmRight[this.readIdx]
      }
    }

    return true
  }
}

registerProcessor('worklet-audio-loop', AudioLoopPlayer)
