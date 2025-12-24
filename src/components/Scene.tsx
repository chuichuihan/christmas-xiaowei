import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Scene() {
  const movingLightRef = useRef<THREE.SpotLight>(null)

  useFrame(({ clock }) => {
    if (movingLightRef.current) {
      const t = clock.elapsedTime
      movingLightRef.current.position.x = Math.sin(t * 0.3) * 12
      movingLightRef.current.position.z = Math.cos(t * 0.3) * 12
    }
  })

  return (
    <>
      {/* Global Ambient Fill - Deep night blue for Christmas night */}
      <ambientLight intensity={0.4} color="#001133" />

      {/* Hemisphere Light - Deep Night Blue Sky vs Warm Snow Ground */}
      <hemisphereLight args={['#001133', '#2a0a18', 1.5]} position={[0, 50, 0]} />

      {/* Main Spotlight - Warm Golden Light from top-right (Moon/Star glow) */}
      <spotLight
        position={[10, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={18}
        color="#fff4e0"
        castShadow
      />

      {/* Moving Rim Light - Cool blue magical edge */}
      <spotLight
        ref={movingLightRef}
        position={[-10, 10, -10]}
        angle={0.5}
        penumbra={1}
        intensity={10}
        color="#4080ff"
      />

      {/* Fill light - Warm red/orange from side (Fireplace glow) */}
      <pointLight position={[-8, 5, -8]} intensity={5} color="#ff4500" distance={20} />

      {/* Warm golden accent from front */}
      <pointLight position={[5, 8, 12]} intensity={6} color="#ffcc00" distance={25} />

      {/* Soft center glow - Warm orange gold */}
      <pointLight position={[0, 6, 0]} intensity={4} color="#ffaa00" distance={15} decay={2} />
    </>
  )
}
