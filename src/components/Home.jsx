import { useState } from 'react'
import { genCode } from '../utils'

export default function Home({ active, onStart, onJoin, toast }) {
  const [myCode, setMyCode] = useState(genCode())
  const [joinValue, setJoinValue] = useState('')

  const handleStart = () => {
    onStart(myCode)
  }

  const handleJoin = () => {
    if (joinValue.trim().length !== 5) {
      toast('Enter a 5-digit code')
      return
    }
    onJoin(joinValue.trim())
  }

  return (
    <div className={`view${active ? ' active' : ''}`}>
      <div className="hero">
        <h1>Talk to anyone, anonymously.</h1>
        <p>No sign up. No names. Just a 5-digit code.</p>
      </div>

      <div className="card code-card">
        <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 4 }}>
          Your room code
        </div>
        <div className="code-display">{myCode}</div>
        <button className="btn btn-primary" onClick={handleStart}>
          Start a room
        </button>

        <div className="divider">or join one</div>

        <div className="join-row">
          <input
            className="code-input"
            maxLength={5}
            inputMode="numeric"
            placeholder="00000"
            value={joinValue}
            onChange={e => setJoinValue(e.target.value.replace(/\D/g, '').slice(0, 5))}
          />
          <button className="btn btn-ghost" onClick={handleJoin}>
            Join
          </button>
        </div>
        <div className="hint">Share your code, or enter someone else's to connect instantly.</div>
      </div>
    </div>
  )
}
