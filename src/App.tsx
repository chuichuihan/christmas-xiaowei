import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Preload, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { CineonToneMapping, Vector2 } from 'three'
import { Scene } from './components/Scene'
import { ChristmasTree } from './components/ChristmasTree'
import { Background } from './components/Background'
import { Overlay } from './components/Overlay'
import { GreetingOverlay } from './components/GreetingOverlay'
import { Snow } from './components/Snow'
import { ResponsiveCamera } from './components/ResponsiveCamera'
import { LoadingScreen } from './components/LoadingScreen'
import { ThreeBoot } from './components/ThreeBoot'

export default function App() {
  const [isTreeShape, setIsTreeShape] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [threeReady, setThreeReady] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const pointerRef = useRef({ x: 0, y: 0 })

  const { progress } = useProgress()

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => !cancelled && setFontsReady(true), 5000)

    Promise.all([
      document.fonts.load('300 16px "Noto Serif SC"'),
      document.fonts.load('700 16px "Dancing Script"'),
    ]).then(() => {
      if (!cancelled) setFontsReady(true)
    })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (fontsReady && threeReady) {
      const timer = setTimeout(() => setShowContent(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [fontsReady, threeReady])

  const isLoading = !showContent

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLoading) return
    pointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isLoading) return
    const dist = Math.hypot(
      e.clientX - pointerRef.current.x,
      e.clientY - pointerRef.current.y
    )
    if (dist < 5) setIsTreeShape((prev) => !prev)
  }

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

        <Suspense fallback={null}>
          <Scene />
          <Background />
          <Snow />
          <ChristmasTree isTreeShape={isTreeShape} />

          <EffectComposer multisampling={8}>
            <Bloom
              luminanceThreshold={0.6}
              luminanceSmoothing={0.9}
              intensity={1.5}
              radius={0.8}
              mipmapBlur
            />
            <Bloom
              luminanceThreshold={1.0}
              intensity={0.6}
              radius={1.2}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(0.0015, 0.0015)}
              radialModulation={true}
              modulationOffset={0.5}
            />
            <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
            <Vignette offset={0.15} darkness={0.85} />
          </EffectComposer>

          <ThreeBoot onReady={() => setThreeReady(true)} />
          <Preload all />
        </Suspense>
      </Canvas>

      <LoadingScreen visible={isLoading} progress={progress} />
      <GreetingOverlay show={!isTreeShape && !isLoading} />
      {!isLoading && <Overlay isTreeShape={isTreeShape} />}
    </div>
  )
}
