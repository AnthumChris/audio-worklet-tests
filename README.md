
# Run

Deployed at https://dev.anthum.com/audio-worklet/

```bash
$ python3 -m http.server
```

# Architecture

The main goal is to offload all network and decoding to the Worker thread.  The AudioWorklet and Worker will use a circular `SharedArrayBuffer` to reduce memory footprint in the AudioWorklet for low latency.

![Audio Worklet Design](https://user-images.githubusercontent.com/10064176/82397890-783abb00-9a1f-11ea-84a8-53345de465ea.png)
