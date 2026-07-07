import { useState, useEffect } from 'react'
import VideoTile from './VideoTile'
import { MicIcon, CamIcon, LeaveIcon, SwitchCamIcon } from './Icons'

function gridCols(n) {
  if (n <= 1) return 1
  if (n <= 4) return 2
  return 3
}

export default function CallView({
  active, code, status, tiles, muted, camOff, canSwitchCam, switchingCam,
  onLeave, onToggleMute, onToggleCam, onSwitchCamera,
}) {
  const [focusedId, setFocusedId] = useState(null)

  // reset if focused tile disconnects
  useEffect(() => {
    if (focusedId && !tiles.find(t => t.id === focusedId)) setFocusedId(null)
  }, [tiles, focusedId])

  // reset on call end
  useEffect(() => {
    if (!active) setFocusedId(null)
  }, [active])

  const handleTap = id => setFocusedId(prev => prev === id ? null : id)

  const focusedTile = focusedId ? tiles.find(t => t.id === focusedId) : null
  const otherTiles = focusedId ? tiles.filter(t => t.id !== focusedId) : []

  return (
    <div className={`call-view${active ? ' active' : ''}`}>
      <div className="call-topbar">
        <div className="call-code-chip">
          <span className="pulse" />
          <span>{code}</span>
        </div>
        <div className="call-status">{status}</div>
      </div>

      {focusedTile ? (
        <div className="focused-layout">
          <div className="focused-main" onClick={() => handleTap(focusedTile.id)}>
            <VideoTile {...focusedTile} focused />
          </div>
          {otherTiles.length > 0 && (
            <div className="focused-strip">
              {otherTiles.map(t => (
                <div key={t.id} className="focused-thumb" onClick={() => handleTap(t.id)}>
                  <VideoTile {...t} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="video-grid" style={{ gridTemplateColumns: `repeat(${gridCols(tiles.length)}, 1fr)` }}>
          {tiles.map(t => (
            <div key={t.id} className="grid-tile-wrap" onClick={() => handleTap(t.id)}>
              <VideoTile {...t} />
            </div>
          ))}
        </div>
      )}

      <div className="controls">
        <button className={`ctrl-btn${muted ? ' off' : ''}`} onClick={onToggleMute} title="Mute">
          <MicIcon />
        </button>
        <button className={`ctrl-btn${camOff ? ' off' : ''}`} onClick={onToggleCam} title="Camera">
          <CamIcon />
        </button>
        {canSwitchCam && (
          <button className="ctrl-btn" onClick={onSwitchCamera} disabled={switchingCam} title="Switch camera">
            <SwitchCamIcon />
          </button>
        )}
        <button className="ctrl-btn leave" onClick={onLeave} title="Leave">
          <LeaveIcon />
        </button>
      </div>
    </div>
  )
}
