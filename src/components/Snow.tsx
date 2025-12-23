import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SNOW_COUNT = 1500

export function Snow() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Initial positions and speeds
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < SNOW_COUNT; i++) {
      const x = (Math.random() - 0.5) * 50
      const y = Math.random() * 40
      const z = (Math.random() - 0.5) * 50
      const factor = 0.3 + Math.random() * 0.7
      const speed = 0.2 + (factor * 0.8) + Math.random() * 0.3
      const swaySpeed = 0.2 + Math.random() * 0.4
      const swayAmplitutde = 0.5 + Math.random() * 1.5 // How far it sways
      temp.push({ x, y, z, speed, factor, swaySpeed, swayAmplitutde, initialX: x, initialZ: z })
    }
    return temp
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.elapsedTime

    particles.forEach((particle, i) => {
      // Update Y position (falling)
      particle.y -= particle.speed * 0.02
      
      // Reset if too low
      if (particle.y < -5) {
        particle.y = 35 + Math.random() * 10
        particle.x = (Math.random() - 0.5) * 50
        particle.z = (Math.random() - 0.5) * 50
        particle.initialX = particle.x
        particle.initialZ = particle.z
      }

      // Add sway movement
      const xOffset = Math.sin(t * particle.swaySpeed + i) * particle.swayAmplitutde
      const zOffset = Math.cos(t * particle.swaySpeed * 0.8 + i) * particle.swayAmplitutde * 0.5

      dummy.position.set(
        particle.initialX + xOffset,
        particle.y,
        particle.initialZ + zOffset
      )
      
      // Rotate snowflake slightly
      dummy.rotation.set(
        Math.sin(t + i) * 0.5,
        Math.cos(t * 0.8 + i) * 0.5,
        Math.sin(t * 0.5 + i) * 0.5
      )

      dummy.scale.setScalar(particle.factor)
      dummy.updateMatrix()
      
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SNOW_COUNT]}>
      {/* Simple diamond/star shape for snow */}
      <octahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
