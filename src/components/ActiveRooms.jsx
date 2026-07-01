import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshIcon, EmptyIcon } from './Icons'
import { getActiveRooms } from '../hooks/presence'

export default function ActiveRooms({ active, onJoin }) {
  const [rooms, setRooms] = useState([])
  const [spinning, setSpinning] = useState(false)
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    const result = await getActiveRooms()
    setRooms(result)
  }, [])

  useEffect(() => {
    if (!active) return
    load()
    pollRef.current = setInterval(load, 6000)
    return () => clearInterval(pollRef.current)
  }, [active, load])

  const handleRefresh = async () => {
    setSpinning(true)
    await load()
    setTimeout(() => setSpinning(false), 300)
  }

  return (
    <div className={`view${active ? ' active' : ''}`}>
      <div className="section-title">
        <h2>Active rooms {rooms.length > 0 && <span className="count">{rooms.length}</span>}</h2>
        <button className="refresh-btn" onClick={handleRefresh}>
          <span className={spinning ? 'spin' : ''} style={{ display: 'flex' }}>
            <RefreshIcon />
          </span>
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="card empty-state">
          <EmptyIcon />
          <p>
            No active rooms right now.
            <br />
            Start one to be the first — or connect directly with a code from the Connect tab.
          </p>
        </div>
      ) : (
        <div className="room-list">
          {rooms.map(([code, count]) => (
            <div className="card room-item" key={code} onClick={() => onJoin(code)}>
              <div className="room-left">
                <span className="pulse" />
                <div>
                  <div className="room-code">{code}</div>
                  <div className="room-meta">{count} {count === 1 ? 'person' : 'people'} connected</div>
                </div>
              </div>
              <div className="room-join">Join</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
