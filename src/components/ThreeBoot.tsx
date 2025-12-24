import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

interface ThreeBootProps {
  onReady: () => void
}

export function ThreeBoot({ onReady }: ThreeBootProps) {
  const { gl, scene, camera } = useThree()
  const done = useRef(false)
  const frame = useRef(0)

  useFrame(() => {
    if (done.current) return
    frame.current++

    if (frame.current === 1) {
      try {
        gl.compile(scene, camera)
      } catch {}
    }

    if (frame.current >= 3) {
      done.current = true
      onReady()
    }
  })

  return null
}
