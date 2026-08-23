import { useState, useEffect, useRef } from 'react'

export default function GetIt() {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState(null)
  const ref = useRef(null)

  // capture native install prompt
  useEffect(() => {
    const h = e => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  // close on outside tap
  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', h)
    return () => document.removeEventListener('pointerdown', h)
  }, [open])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
    setOpen(false)
  }

  // hide when already installed
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) return null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <div className="getit" ref={ref}>
      <button className="getit-trigger" onClick={() => setOpen(p => !p)}>Get it</button>

      {open && (
        <div className="getit-menu">
          <div className="getit-heading">Install anymvid</div>

          {prompt ? (
            <button className="getit-item clickable" onClick={install}>
              <span>📲</span>
              <div>
                <div className="getit-name">Install now</div>
                <div className="getit-desc">Add to your home screen</div>
              </div>
            </button>
          ) : isIOS ? (
            <div className="getit-item">
              <span>🍎</span>
              <div>
                <div className="getit-name">iPhone / iPad</div>
                <div className="getit-desc">Safari → Share ↗ → Add to Home Screen</div>
              </div>
            </div>
          ) : (
            <>
              <div className="getit-item">
                <span>🖥️</span>
                <div>
                  <div className="getit-name">Windows / Mac / Linux</div>
                  <div className="getit-desc">Chrome → ⋮ → Install anymvid</div>
                </div>
              </div>
              <div className="getit-item">
                <span>📱</span>
                <div>
                  <div className="getit-name">Android</div>
                  <div className="getit-desc">Chrome → ⋮ → Add to Home screen</div>
                </div>
              </div>
              <div className="getit-item">
                <span>🍎</span>
                <div>
                  <div className="getit-name">iPhone / iPad</div>
                  <div className="getit-desc">Safari → Share ↗ → Add to Home Screen</div>
                </div>
              </div>
            </>
          )}

          <div className="getit-note">Works offline like a native app</div>
        </div>
      )}
    </div>
  )
}
