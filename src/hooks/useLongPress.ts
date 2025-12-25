import { useCallback, useRef } from 'react'
import type { PointerEventHandler, MouseEventHandler } from 'react'

export function useLongPress<T extends HTMLElement>(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<number>(0)
  const triggeredRef = useRef(false)

  const clear = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = 0
  }, [])

  const onPointerDown = useCallback<PointerEventHandler<T>>(
    (e) => {
      if (e.button !== 0) return
      e.stopPropagation()
      triggeredRef.current = false
      timerRef.current = window.setTimeout(() => {
        triggeredRef.current = true
        onLongPress()
      }, delay)
    },
    [delay, onLongPress]
  )

  const onPointerUp = useCallback<PointerEventHandler<T>>(
    (e) => {
      e.stopPropagation()
      clear()
    },
    [clear]
  )

  const onClickCapture = useCallback<MouseEventHandler<T>>((e) => {
    if (triggeredRef.current) {
      e.preventDefault()
      e.stopPropagation()
      triggeredRef.current = false
    }
  }, [])

  return { onPointerDown, onPointerUp, onPointerLeave: clear, onClickCapture }
}
