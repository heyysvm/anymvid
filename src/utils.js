export const genCode = () => String(Math.floor(10000 + Math.random() * 90000))
export const randSuffix = () => Math.random().toString(36).slice(2, 8)

// STUN handles most networks. TURN (relay) is the fallback for strict corporate/carrier
// NATs where a direct peer-to-peer path can't be punched through — without it, calls on
// those networks would just silently fail to connect. These openrelay.metered.ca
// credentials are a public, free TURN service commonly used for exactly this.
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:global.relay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:global.relay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

// Good defaults for a smooth call: 720p target (not 1080p, which just adds lag on
// average upload speeds), capped at 30fps, with audio processing on so voices stay
// clean instead of echoey/quiet.
export const getMediaConstraints = (facingMode = 'user') => ({
  video: {
    facingMode,
    width: { ideal: 1280, max: 1280 },
    height: { ideal: 720, max: 720 },
    frameRate: { ideal: 30, max: 30 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
})

