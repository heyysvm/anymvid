import { useCallback, useRef, useState } from 'react'
import Peer from 'peerjs'
import { randSuffix, ICE_SERVERS, getMediaConstraints } from '../utils'

// first joiner = host (peer id == room code), rest connect as guests
// host sends member list via data channel, new guest dials everyone → full mesh

export function useCall({ onToast }) {
  const [active, setActive] = useState(false)
  const [code, setCode] = useState(null)
  const [status, setStatus] = useState('connecting…')
  const [tiles, setTiles] = useState([]) // [{id, stream, label, mine}]
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const [canSwitchCam, setCanSwitchCam] = useState(false)
  const [switchingCam, setSwitchingCam] = useState(false)

  const facingModeRef = useRef('user')

  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const mediaConnsRef = useRef(new Map()) // peerId -> MediaConnection
  const hostDataConnsRef = useRef(new Map()) // (host only) peerId -> DataConnection
  const memberSetRef = useRef(new Set()) // (host only) authoritative member ids
  const myDataConnRef = useRef(null) // (guest only) connection to host

  // cap bitrate so weak uplinks don't stutter
  const capBitrate = useCallback(call => {
    try {
      const pc = call?.peerConnection
      if (!pc) return
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video')
      if (!sender) return
      const params = sender.getParameters()
      if (!params.encodings) params.encodings = [{}]
      params.encodings[0].maxBitrate = 1_200_000 // 1.2Mbps
      sender.setParameters(params).catch(() => {})
    } catch (e) {}
  }, [])

  const updateStatus = useCallback(() => {
    const n = mediaConnsRef.current.size
    setStatus(n === 0 ? 'waiting for others…' : `${n + 1} in call`)
  }, [])

  const addTile = useCallback((id, stream, label, mine = false) => {
    setTiles(prev => {
      const filtered = prev.filter(t => t.id !== id)
      return [...filtered, { id, stream, label, mine }]
    })
  }, [])

  const removeTile = useCallback(id => {
    setTiles(prev => prev.filter(t => t.id !== id))
  }, [])

  // auto-redial on ICE drop
  const watchConnectionHealth = useCallback((call, remoteId, redial) => {
    const pc = call?.peerConnection
    if (!pc) return
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setTimeout(() => {
          if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
            mediaConnsRef.current.delete(remoteId)
            removeTile(remoteId)
            redial?.(remoteId)
          }
        }, 3000)
      }
    }
  }, [removeTile])

  const dialPeer = useCallback(remoteId => {
    const peer = peerRef.current
    if (!peer || !localStreamRef.current) return
    if (mediaConnsRef.current.has(remoteId)) return
    const call = peer.call(remoteId, localStreamRef.current)
    if (!call) return
    mediaConnsRef.current.set(remoteId, call)
    call.on('stream', remoteStream => {
      addTile(remoteId, remoteStream, 'Guest')
      updateStatus()
      capBitrate(call)
      watchConnectionHealth(call, remoteId, dialPeer)
    })
    call.on('close', () => {
      removeTile(remoteId)
      mediaConnsRef.current.delete(remoteId)
      updateStatus()
    })
    call.on('error', () => {
      removeTile(remoteId)
      mediaConnsRef.current.delete(remoteId)
      updateStatus()
    })
  }, [addTile, removeTile, updateStatus, capBitrate, watchConnectionHealth])

  const wireIncomingCalls = useCallback(peer => {
    peer.on('call', incoming => {
      incoming.answer(localStreamRef.current)
      mediaConnsRef.current.set(incoming.peer, incoming)
      incoming.on('stream', remoteStream => {
        addTile(incoming.peer, remoteStream, 'Guest')
        updateStatus()
        capBitrate(incoming)
        watchConnectionHealth(incoming, incoming.peer, dialPeer)
      })
      incoming.on('close', () => {
        removeTile(incoming.peer)
        mediaConnsRef.current.delete(incoming.peer)
        updateStatus()
      })
    })
  }, [addTile, removeTile, updateStatus, capBitrate, watchConnectionHealth, dialPeer])

  const wireHostConnections = useCallback(peer => {
    peer.on('connection', dataConn => {
      dataConn.on('open', () => {
        hostDataConnsRef.current.set(dataConn.peer, dataConn)
        // send existing members before adding this one
        dataConn.send({ type: 'members', members: Array.from(memberSetRef.current) })
        memberSetRef.current.add(dataConn.peer)
      })
      dataConn.on('close', () => {
        memberSetRef.current.delete(dataConn.peer)
        hostDataConnsRef.current.delete(dataConn.peer)
      })
      dataConn.on('error', () => {
        memberSetRef.current.delete(dataConn.peer)
        hostDataConnsRef.current.delete(dataConn.peer)
      })
    })
  }, [])

  const startAsGuest = useCallback((roomCode, myId) => {
    const peer = new Peer(myId, { debug: 0, config: { iceServers: ICE_SERVERS } })
    peerRef.current = peer

    peer.on('open', () => {
      const dataConn = peer.connect(roomCode, { reliable: true })
      myDataConnRef.current = dataConn

      dataConn.on('data', payload => {
        if (payload?.type === 'members') {
          payload.members.forEach(id => {
            if (id !== myId) dialPeer(id)
          })
          updateStatus()
        }
      })

      dataConn.on('error', () => {
        onToast?.('Could not reach that room — check the code and try again')
      })
    })

    wireIncomingCalls(peer)

    peer.on('error', err => {
      console.error(err)
      if (err.type === 'peer-unavailable') {
        onToast?.('No active room with that code')
        peer.destroy()
        setActive(false)
      } else {
        onToast?.(`Connection issue: ${err.type}`)
      }
    })
  }, [wireIncomingCalls, dialPeer, updateStatus, onToast])

  const enterRoom = useCallback(async roomCode => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getMediaConstraints(facingModeRef.current))
      localStreamRef.current = stream
    } catch (e) {
      onToast?.('Camera/mic access is needed to connect')
      return
    }

    // multi-cam check
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices.filter(d => d.kind === 'videoinput')
      setCanSwitchCam(videoInputs.length > 1)
    } catch (e) {}

    setCode(roomCode)
    setActive(true)
    setStatus('connecting…')
    setTiles([{ id: 'me', stream: localStreamRef.current, label: 'You', mine: true }])

    // try claiming room id; if taken → join as guest
    const probe = new Peer(roomCode, { debug: 0, config: { iceServers: ICE_SERVERS } })
    let settled = false

    probe.on('open', () => {
      settled = true
      peerRef.current = probe
      memberSetRef.current.add(roomCode)
      wireIncomingCalls(probe)
      wireHostConnections(probe)
      probe.on('error', err => {
        console.error(err)
        onToast?.(`Connection issue: ${err.type}`)
      })
      setStatus('waiting for others…')
    })

    probe.on('error', err => {
      if (err.type === 'unavailable-id' && !settled) {
        settled = true
        probe.destroy()
        startAsGuest(roomCode, `${roomCode}-${randSuffix()}`)
      } else if (!settled) {
        settled = true
        console.error(err)
        onToast?.(`Connection issue: ${err.type}`)
      }
    })
  }, [wireIncomingCalls, wireHostConnections, startAsGuest, onToast])

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current || switchingCam) return
    setSwitchingCam(true)
    const nextFacing = facingModeRef.current === 'user' ? 'environment' : 'user'
    try {
      const newStream = await navigator.mediaDevices.getUserMedia(getMediaConstraints(nextFacing))
      const newVideoTrack = newStream.getVideoTracks()[0]
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0]

      // swap track on live calls
      mediaConnsRef.current.forEach(call => {
        const pc = call?.peerConnection
        if (!pc) return
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video')
        if (sender) sender.replaceTrack(newVideoTrack).catch(() => {})
      })

      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack)
        oldVideoTrack.stop()
      }
      localStreamRef.current.addTrack(newVideoTrack)
      newVideoTrack.enabled = !camOff
      facingModeRef.current = nextFacing

      // refresh local preview
      addTile('me', localStreamRef.current, 'You', true)
    } catch (e) {
      onToast?.('Could not switch camera')
    } finally {
      setSwitchingCam(false)
    }
  }, [switchingCam, camOff, addTile, onToast])

  const leaveCall = useCallback(() => {
    if (myDataConnRef.current) {
      try { myDataConnRef.current.close() } catch (e) { /* ignore */ }
      myDataConnRef.current = null
    }
    hostDataConnsRef.current.forEach(c => {
      try { c.close() } catch (e) { /* ignore */ }
    })
    hostDataConnsRef.current.clear()
    memberSetRef.current.clear()
    mediaConnsRef.current.forEach(c => {
      try { c.close() } catch (e) { /* ignore */ }
    })
    mediaConnsRef.current.clear()
    if (peerRef.current) {
      try { peerRef.current.destroy() } catch (e) { /* ignore */ }
      peerRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
    setActive(false)
    setTiles([])
    setMuted(false)
    setCamOff(false)
    setCode(null)
    setCanSwitchCam(false)
    facingModeRef.current = 'user'
  }, [])

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return
    setMuted(prev => {
      const next = !prev
      localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = !next))
      return next
    })
  }, [])

  const toggleCam = useCallback(() => {
    if (!localStreamRef.current) return
    setCamOff(prev => {
      const next = !prev
      localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = !next))
      return next
    })
  }, [])

  return {
    active, code, status, tiles, muted, camOff, canSwitchCam, switchingCam,
    enterRoom, leaveCall, toggleMute, toggleCam, switchCamera,
  }
}
