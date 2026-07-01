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
  return (
    <div className={`call-view${active ? ' active' : ''}`}>
      <div className="call-topbar">
        <div className="call-code-chip">
          <span className="pulse" />
          <span>{code}</span>
        </div>
        <div className="call-status">{status}</div>
      </div>

      <div className="video-grid" style={{ gridTemplateColumns: `repeat(${gridCols(tiles.length)}, 1fr)` }}>
        {tiles.map(t => (
          <VideoTile key={t.id} {...t} />
        ))}
      </div>

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
