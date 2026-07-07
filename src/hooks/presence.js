// room presence via shared storage, no-op without window.storage

const hasStorage = () => typeof window !== 'undefined' && window.storage

export async function registerPresence(code, peerId) {
  if (!hasStorage()) return
  try {
    await window.storage.set(`room:${code}:${peerId}`, JSON.stringify({ ts: Date.now() }), true)
  } catch (e) {
    console.error(e)
  }
}

export async function removePresence(code, peerId) {
  if (!hasStorage()) return
  try {
    await window.storage.delete(`room:${code}:${peerId}`, true)
  } catch (e) {
    /* ignore */
  }
}

export async function getRoomPeers(code) {
  if (!hasStorage()) return []
  try {
    const res = await window.storage.list(`room:${code}:`, true)
    if (!res || !res.keys) return []
    const now = Date.now()
    const ids = []
    for (const k of res.keys) {
      try {
        const item = await window.storage.get(k, true)
        const data = JSON.parse(item.value)
        if (now - data.ts < 20000) ids.push(k.split(':').slice(2).join(':'))
      } catch (e) {
        /* skip */
      }
    }
    return ids
  } catch (e) {
    return []
  }
}

export async function getActiveRooms() {
  if (!hasStorage()) return []
  try {
    const res = await window.storage.list('room:', true)
    if (!res || !res.keys || res.keys.length === 0) return []
    const now = Date.now()
    const rooms = {}
    for (const k of res.keys) {
      const code = k.split(':')[1]
      if (!rooms[code]) rooms[code] = 0
      try {
        const item = await window.storage.get(k, true)
        const data = JSON.parse(item.value)
        if (now - data.ts < 20000) rooms[code]++
      } catch (e) {
        /* skip */
      }
    }
    return Object.entries(rooms)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
  } catch (e) {
    return []
  }
}
