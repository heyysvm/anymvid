import { useEffect, useRef } from 'react'

export default function VideoTile({ id, stream, label, mine, focused }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  return (
    <div className={`video-tile${mine ? ' mine' : ''}${focused ? ' focused' : ''}`}>
      <video ref={videoRef} autoPlay playsInline muted={mine} />
      <div className="tile-label">{label}</div>
    </div>
  )
}
