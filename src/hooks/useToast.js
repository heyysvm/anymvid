import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)
  const timerRef = useRef(null)

  const toast = useCallback((msg, ms = 2400) => {
    setMessage(msg)
    setShow(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShow(false), ms)
  }, [])

  return { message, show, toast }
}
