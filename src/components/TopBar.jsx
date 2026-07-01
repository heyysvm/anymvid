export default function TopBar({ view, setView }) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot" />
        anymvid
      </div>
      <div className="tabs">
        <button className={`tab${view === 'home' ? ' active' : ''}`} onClick={() => setView('home')}>
          Connect
        </button>
        <button className={`tab${view === 'active' ? ' active' : ''}`} onClick={() => setView('active')}>
          Active
        </button>
      </div>
    </div>
  )
}
