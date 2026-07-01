# anymvid

Anonymous, instant video rooms — connect with a 5-digit code. No sign-up, no names.

## Stack
- React 18 + Vite
- PeerJS (WebRTC) for audio/video, mesh-connected per room
- `window.storage` (shared) as a lightweight live "who's online" presence directory — works when deployed as a Claude artifact; falls back gracefully (Active list just stays empty) on a plain web host since that API won't exist there.

## Folder structure
```
anymvid/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx                # Root component, wires everything together
    ├── utils.js                # genCode / randSuffix helpers
    ├── styles/
    │   └── index.css          # design tokens + all component styles
    ├── hooks/
    │   ├── useCall.js          # PeerJS mesh call logic (join/leave/mute/cam)
    │   ├── useToast.js         # toast notification state
    │   └── presence.js         # shared-storage room directory helpers
    └── components/
        ├── Icons.jsx           # inline SVG icon set
        ├── TopBar.jsx          # brand + Connect/Active tabs
        ├── Home.jsx            # start/join room by code
        ├── ActiveRooms.jsx     # live list of active rooms
        ├── VideoTile.jsx       # single participant video tile
        ├── CallView.jsx        # full-screen call UI + controls
        ├── Footer.jsx          # social/portfolio/github links
        └── Toast.jsx           # toast UI
```

## Run locally
```bash
npm install
npm run dev
```

## Build for production
```bash
npm run build
npm run preview
```
