import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fireflyVertexShader, fireflyFragmentShader } from '../shaders/fireflyRiver'

const PARTICLE_COUNT = 1600

interface FireflyRiverProps {
  mixRef: { current: number }
}

export function FireflyRiver({ mixRef }: FireflyRiverProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null)

  const { geometry, uniforms } = useMemo(() => {
    const offsets = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const positions = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offsets[i] = Math.random()
      speeds[i] = 0.4 + Math.random() * 0.4
      sizes[i] = 0.6 + Math.random() * 1.2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

    // Set bounding sphere to prevent frustum culling issues
    // (GPU computes actual positions, not CPU)
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 6, 0), 15)

    return {
      geometry: geo,
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
        uCameraPos: { value: new THREE.Vector3() }
      }
    }
  }, [])

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime
      shaderRef.current.uniforms.uMix.value = mixRef.current
      shaderRef.current.uniforms.uCameraPos.value.copy(state.camera.position)
    }
  })

  return (
    <points geometry={geometry} renderOrder={999}>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={fireflyVertexShader}
        fragmentShader={fireflyFragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
