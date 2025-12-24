import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Preload, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { CineonToneMapping, Vector2 } from 'three'
import { Scene } from './components/Scene'
import { ChristmasTree } from './components/ChristmasTree'
import { Background } from './components/Background'
import { Overlay } from './components/Overlay'
import { GreetingOverlay } from './components/GreetingOverlay'
import { NameInputOverlay } from './components/NameInputOverlay'
import { Snow } from './components/Snow'
import { ResponsiveCamera } from './components/ResponsiveCamera'
import { LoadingScreen } from './components/LoadingScreen'
import { ThreeBoot } from './components/ThreeBoot'
import { ProjectInfo } from './components/ProjectInfo'

function isLowMemoryIPad(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIPad = /\biPad\b/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (!isIPad) return false
  const min = Math.min(window.screen.width, window.screen.height)
  const max = Math.max(window.screen.width, window.screen.height)
  return min === 810 && max === 1080
}

function PostProcessing({ lowMemory }: { lowMemory: boolean }) {
  const gl = useThree((s) => s.gl)
  const samples = lowMemory ? 0 : Math.min(8, gl.capabilities.maxSamples ?? 0)
  const effects = (
    <>
      <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={1.5} radius={0.8} mipmapBlur />
      <Bloom luminanceThreshold={1.0} intensity={0.6} radius={1.2} mipmapBlur />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new Vector2(0.0015, 0.0015)} radialModulation modulationOffset={0.5} />
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.15} darkness={0.85} />
    </>
  )
  if (samples === 0) {
    return (
      <EffectComposer multisampling={0}>
        <SMAA />
        {effects}
      </EffectComposer>
    )
  }
  return <EffectComposer multisampling={samples}>{effects}</EffectComposer>
}

export default function App() {
  const [isTreeShape, setIsTreeShape] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [threeReady, setThreeReady] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [recipientName, setRecipientName] = useState<string | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const lowMemory = useMemo(() => isLowMemoryIPad(), [])

  const { progress } = useProgress()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nameFromUrl = params.get('to')
    if (nameFromUrl) {
      setRecipientName(nameFromUrl)
    }
  }, [])

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
    if (isLoading || !recipientName) return
    const dist = Math.hypot(
      e.clientX - pointerRef.current.x,
      e.clientY - pointerRef.current.y
    )
    if (dist < 5) setIsTreeShape((prev) => !prev)
  }

  const handleNameSubmit = useCallback((name: string) => {
    setRecipientName(name)
  }, [])

  const handleBack = useCallback(() => {
    setRecipientName(null)
    setIsTreeShape(false)
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 4, 18], [])
  const orbitTarget = useMemo<[number, number, number]>(() => [0, 4, 0], [])

  return (
    <div
      style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        dpr={lowMemory ? [1, 1.5] : [1, 2]}
        gl={{
          toneMapping: CineonToneMapping,
          toneMappingExposure: 1.2,
          antialias: !lowMemory,
          powerPreference: 'high-performance',
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

          <PostProcessing lowMemory={lowMemory} />

          <ThreeBoot onReady={() => setThreeReady(true)} />
          <Preload all />
        </Suspense>
      </Canvas>

      <LoadingScreen visible={isLoading} progress={progress} />
      <NameInputOverlay show={!isLoading && !recipientName} onSubmit={handleNameSubmit} />
      {recipientName && (
        <>
          <GreetingOverlay show={!isTreeShape && !isLoading} name={recipientName} />
          {!isLoading && <Overlay />}
          {!isLoading && (
            <>
              <div
                style={{
                  position: 'fixed',
                  bottom: '40px',
                  left: '20px',
                  zIndex: 100,
                }}
              >
                <button
                  onClick={handleBack}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.7)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(4px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  Back
                </button>
              </div>
              <div
                style={{
                  position: 'fixed',
                  bottom: '40px',
                  right: '20px',
                  zIndex: 100,
                }}
              >
                <ProjectInfo />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
