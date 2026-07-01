import { useState } from 'react'
import TopBar from './components/TopBar'
import Home from './components/Home'
import ActiveRooms from './components/ActiveRooms'
import CallView from './components/CallView'
import Footer from './components/Footer'
import Toast from './components/Toast'
import { useCall } from './hooks/useCall'
import { useToast } from './hooks/useToast'

export default function App() {
  const [view, setView] = useState('home')
  const { message, show, toast } = useToast()
  const call = useCall({ onToast: toast })

  const handleJoin = code => call.enterRoom(code)

  const handleLeave = () => {
    call.leaveCall()
    setView('home')
  }

  return (
    <div className="app">
      <TopBar view={view} setView={setView} />

      <Home active={view === 'home'} onStart={handleJoin} onJoin={handleJoin} toast={toast} />
      <ActiveRooms active={view === 'active'} onJoin={handleJoin} />

      <Footer />

      <CallView
        active={call.active}
        code={call.code}
        status={call.status}
        tiles={call.tiles}
        muted={call.muted}
        camOff={call.camOff}
        canSwitchCam={call.canSwitchCam}
        switchingCam={call.switchingCam}
        onLeave={handleLeave}
        onToggleMute={call.toggleMute}
        onToggleCam={call.toggleCam}
        onSwitchCamera={call.switchCamera}
      />

      <Toast message={message} show={show} />
    </div>
  )
}
