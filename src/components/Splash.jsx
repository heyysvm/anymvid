import { useState, useEffect } from 'react'

export default function Splash({ onDone }) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setGone(true)
      setTimeout(() => onDone?.(), 900)
    }, 1400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`splash${gone ? ' gone' : ''}`}>
      <div className="splash-content">
        <span className="splash-dot" />
        <span className="splash-title">anymvid</span>
      </div>
      <div className="splash-sub">anonymous video rooms</div>
    </div>
  )
}
