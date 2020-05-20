export class MockAudioSource {
  ready = null  // Promise that resolves when decoder can provide PCM
  offset = 0     // index of bytes decoded

  constructor({ onReady }) {
    this.ready = Promise.all([
      fetch('../audio/decoded-left.raw').then(r => {
        return r.arrayBuffer().then(buffer => new Float32Array(buffer))
      }),
      fetch('../audio/decoded-right.raw').then(r => {
        return r.arrayBuffer().then(buffer => new Float32Array(buffer))
      }),
    ])
    .then(([left, right]) => {
      if ('function' === typeof onReady) {
        onReady()
      }
      return [left, right]
    })
  }

  async decode(length) {
    const [left, right] = await this.ready

    // restrict size
    const newOffset = Math.min(left.length, this.offset + length)

    const o = {
      left: left.subarray(this.offset, newOffset),
      right: right.subarray(this.offset, newOffset),
      isDone: this.offset === left.length
    }

    this.offset = newOffset

    return o
  }
}