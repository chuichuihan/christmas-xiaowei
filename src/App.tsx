import { useState, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { CineonToneMapping, Vector2 } from 'three'
import { Scene } from './components/Scene'
import { ChristmasTree } from './components/ChristmasTree'
import { Background } from './components/Background'
import { Overlay } from './components/Overlay'
import { Snow } from './components/Snow'
import { ResponsiveCamera } from './components/ResponsiveCamera'

export default function App() {
  const [isTreeShape, setIsTreeShape] = useState(false)
  const pointerRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const dist = Math.hypot(
      e.clientX - pointerRef.current.x,
      e.clientY - pointerRef.current.y
    )
    if (dist < 5) setIsTreeShape((prev) => !prev)
  }

  // 记忆化静态配置，防止重渲染时相机重置
  const cameraPosition = useMemo<[number, number, number]>(() => [0, 4, 18], [])
  const orbitTarget = useMemo<[number, number, number]>(() => [0, 4, 0], [])

  return (
    <div
      style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        gl={{
          toneMapping: CineonToneMapping,
          toneMappingExposure: 1.2,
          antialias: true,
        }}
        style={{ background: '#050a14' }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        <ResponsiveCamera />
        <OrbitControls
          makeDefault
          target={orbitTarget}
          minDistance={10}
          maxDistance={25}
          enablePan={true}
          screenSpacePanning={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />

        <Scene />
        <Background />
        <Snow />
        <ChristmasTree isTreeShape={isTreeShape} />

        <EffectComposer multisampling={8}>
          {/* Primary bloom - catches bright baubles and lights */}
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            intensity={1.5}
            radius={0.8}
            mipmapBlur
          />
          {/* Secondary subtle bloom for softer glow */}
          <Bloom
            luminanceThreshold={1.0}
            intensity={0.6}
            radius={1.2}
            mipmapBlur
          />
          {/* Chromatic aberration - cinema lens effect */}
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new Vector2(0.0015, 0.0015)}
            radialModulation={true}
            modulationOffset={0.5}
          />
          {/* Film grain for texture */}
          <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
          {/* Vignette for dramatic framing */}
          <Vignette offset={0.15} darkness={0.85} />
        </EffectComposer>
      </Canvas>

      <Overlay isTreeShape={isTreeShape} />
    </div>
  )
}
