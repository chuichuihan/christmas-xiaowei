import { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame, extend, type ThreeElement } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial, Billboard, Sparkles } from '@react-three/drei'
import { generateOrnamentPosition } from '../utils/math'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

interface OrnamentsProps {
  mixRef: { current: number }
}

// Color palettes - Traditional Christmas colors
const RED_COLORS = ['#d40000', '#ff0000', '#8b0000', '#b22222', '#dc143c']
const GOLD_COLORS = ['#ffd700', '#daa520', '#ffd400', '#f4c430']
const GREEN_COLORS = ['#006400', '#228b22', '#008000', '#32cd32']
const SILVER_COLORS = ['#c0c0c0', '#dcdcdc', '#f8f8ff', '#e0ffff']

function getRandomColor(type: 'red' | 'gold' | 'green' | 'silver'): string {
  const palette = type === 'red' ? RED_COLORS : type === 'gold' ? GOLD_COLORS : type === 'green' ? GREEN_COLORS : SILVER_COLORS
  return palette[Math.floor(Math.random() * palette.length)]
}

// Cinematic Bauble Shader - Glass-like with fresnel, iridescence, subsurface glow
const CinematicBaubleMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;
    varying vec3 vInstanceColor;

    void main() {
      vInstanceColor = instanceColor;
      
      vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;

      mat3 instanceNormalMatrix = mat3(modelMatrix * instanceMatrix);
      vNormal = normalize(instanceNormalMatrix * normal);

      vViewDir = normalize(cameraPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  // Fragment Shader - Cinematic Glass
  `
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;
    varying vec3 vInstanceColor;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDir);

      float NdotV = dot(viewDir, normal);
      float fresnel = pow(1.0 - max(NdotV, 0.0), 3.0);

      vec3 iridescence = 0.5 + 0.5 * cos(uTime * 0.3 + viewDir.yxz * 2.5 + vec3(0.0, 2.1, 4.2));
      float sss = smoothstep(0.0, 1.0, NdotV * 0.6 + 0.4);

      vec3 lightDir = normalize(vec3(1.0, 2.0, 1.5));
      vec3 halfVec = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfVec), 0.0), 64.0);

      vec3 baseColor = vInstanceColor;
      vec3 finalColor = baseColor * sss * 0.8;
      finalColor += iridescence * fresnel * 0.4;
      finalColor += vec3(1.0, 0.95, 0.9) * fresnel * 1.2;
      finalColor += vec3(1.0) * spec * 0.8;

      float noiseTime = uTime * 0.5;
      float shimmerWave = sin(vWorldPos.x * 8.0 + vWorldPos.y * 12.0 + noiseTime);
      float sparkle = step(0.97, hash(vWorldPos.xy * 10.0 + vec2(shimmerWave))) * fresnel;
      finalColor += vec3(1.0) * sparkle * 2.0;

      finalColor += baseColor * 0.15;

      gl_FragColor = vec4(finalColor, 0.92);
    }
  `
)

extend({ CinematicBaubleMaterial })

type CinematicBaubleMaterialElement = typeof CinematicBaubleMaterial

declare module '@react-three/fiber' {
  interface ThreeElements {
    cinematicBaubleMaterial: ThreeElement<CinematicBaubleMaterialElement>
  }
}

// Luxury Gift Shader - Velvet/Brocade with metallic ribbon
const LuxuryGiftMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color('#8b0000'), // Deep Christmas Red
    uRibbonColor: new THREE.Color('#d4af37'), // Gold Ribbon
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uRibbonColor;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDir);

      float ribbonWidth = 0.12;
      float isRibbonH = step(abs(vUv.x - 0.5), ribbonWidth);
      float isRibbonV = step(abs(vUv.y - 0.5), ribbonWidth);
      float isRibbon = max(isRibbonH, isRibbonV);

      float pattern1 = sin(vUv.x * 25.0) * cos(vUv.y * 25.0);
      float pattern2 = sin((vUv.x + vUv.y) * 15.0) * 0.5;
      float pattern = smoothstep(-0.5, 0.5, pattern1 + pattern2) * 0.15;

      float sheen = 1.0 - abs(dot(normal, viewDir));
      sheen = pow(sheen, 2.0);

      vec3 velvetColor = uBaseColor * (0.85 + pattern);
      velvetColor += vec3(0.4, 0.2, 0.3) * sheen * 0.6; 

      float ribbonCrease = sin(vUv.x * 80.0) * sin(vUv.y * 80.0) * 0.1;
      vec3 ribbonFinal = uRibbonColor * (0.9 + sheen * 0.3 + ribbonCrease);

      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      vec3 halfVec = normalize(lightDir + viewDir);
      float ribbonSpec = pow(max(dot(normal, halfVec), 0.0), 32.0);
      ribbonFinal += vec3(1.0) * ribbonSpec * isRibbon * 0.5;

      float sparkle = step(0.985, hash(vUv * 100.0 + floor(uTime * 2.0))) * (1.0 - isRibbon);
      velvetColor += vec3(1.0, 0.9, 0.95) * sparkle * 0.8;

      vec3 finalColor = mix(velvetColor, ribbonFinal, isRibbon);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ LuxuryGiftMaterial })

type LuxuryGiftMaterialElement = typeof LuxuryGiftMaterial

declare module '@react-three/fiber' {
  interface ThreeElements {
    luxuryGiftMaterial: ThreeElement<LuxuryGiftMaterialElement>
  }
}

// Baubles Component
function Baubles({ mixRef, count, scale }: { mixRef: { current: number }; count: number; scale: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const { treeData, scatterData, weights } = useMemo(() => {
    const tree: THREE.Vector3[] = []
    const scatter: THREE.Vector3[] = []
    const w: number[] = []
    for (let i = 0; i < count; i++) {
      const pos = generateOrnamentPosition('bauble')
      tree.push(pos.tree)
      scatter.push(pos.scatter)
      w.push(0.5 + Math.random() * 0.3)
    }
    return { treeData: tree, scatterData: scatter, weights: w }
  }, [count])

  useLayoutEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < count; i++) {
      const rand = Math.random()
      let colorType: 'red' | 'gold' | 'green' | 'silver' = 'red'
      if (rand < 0.4) colorType = 'red'
      else if (rand < 0.7) colorType = 'gold'
      else if (rand < 0.9) colorType = 'green'
      else colorType = 'silver'
      meshRef.current.setColorAt(i, new THREE.Color(getRandomColor(colorType)))
    }
    meshRef.current.instanceColor!.needsUpdate = true
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = mixRef.current
    const time = state.clock.elapsedTime
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
    }
    for (let i = 0; i < count; i++) {
      const tree = treeData[i]
      const scatter = scatterData[i]
      const weight = weights[i]
      const wave = Math.sin(time * 0.5 + i) * weight * (1 - t) * 0.5
      dummy.position.lerpVectors(scatter, tree, t)
      dummy.position.y += wave
      dummy.scale.setScalar(scale * (0.7 + 0.3 * t))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} renderOrder={1}>
      <sphereGeometry args={[1, 32, 32]} />
      <cinematicBaubleMaterial ref={materialRef} transparent depthWrite={true} />
    </instancedMesh>
  )
}

// Lights Component
function Lights({ mixRef, count }: { mixRef: { current: number }; count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const { treeData, scatterData } = useMemo(() => {
    const tree: THREE.Vector3[] = []
    const scatter: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      const pos = generateOrnamentPosition('light')
      tree.push(pos.tree)
      scatter.push(pos.scatter)
    }
    return { treeData: tree, scatterData: scatter }
  }, [count])

  useLayoutEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < count; i++) {
      const rand = Math.random()
      // Christmas lights: warm golden, red, green
      const color = rand < 0.7 ? '#ffd700' : (rand < 0.85 ? '#ff0000' : '#00ff00')
      meshRef.current.setColorAt(i, new THREE.Color(color))
    }
    meshRef.current.instanceColor!.needsUpdate = true
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = mixRef.current
    const time = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const tree = treeData[i]
      const scatter = scatterData[i]
      dummy.position.lerpVectors(scatter, tree, t)
      // Faster, more dramatic twinkling for Christmas lights
      const twinkle = 0.5 + 0.5 * Math.sin(time * 6 + i * 15.0)
      dummy.scale.setScalar(0.08 * twinkle)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const glowMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vColor;
      void main() {
        vColor = instanceColor;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor * 2.0, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    toneMapped: false
  }), [])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <primitive object={glowMaterial} attach="material" />
    </instancedMesh>
  )
}

// Diamonds Component
function Diamonds({ mixRef, count }: { mixRef: { current: number }; count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const { treeData, scatterData } = useMemo(() => {
    const tree: THREE.Vector3[] = []
    const scatter: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      const pos = generateOrnamentPosition('diamond')
      tree.push(pos.tree)
      scatter.push(pos.scatter)
    }
    return { treeData: tree, scatterData: scatter }
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = mixRef.current
    const time = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const tree = treeData[i]
      const scatter = scatterData[i]
      dummy.position.lerpVectors(scatter, tree, t)
      dummy.rotation.y = time * 0.5 + i
      dummy.rotation.x = time * 0.3
      dummy.scale.setScalar(0.2)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#e0ffff"
        metalness={0.1}
        roughness={0}
        transmission={0.9}
        thickness={0.5}
        clearcoat={1.0}
      />
    </instancedMesh>
  )
}

// Gifts Component - Luxury velvet with 3D Bows
function Gifts({ mixRef, count }: { mixRef: { current: number }; count: number }) {
  const boxRef = useRef<THREE.InstancedMesh>(null)
  const bowRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const dummyBox = useMemo(() => new THREE.Object3D(), [])
  const dummyBow = useMemo(() => new THREE.Object3D(), [])

  // Create a merged geometry for a perfect bow shape
  const bowGeometry = useMemo(() => {
    // 1. Center Knot
    const knotGeo = new THREE.SphereGeometry(0.12, 32, 16)
    
    // 2. Left Loop (Flattened Sphere)
    const leftGeo = new THREE.SphereGeometry(0.25, 32, 16)
    leftGeo.scale(1.0, 0.6, 0.4) // Flatten
    leftGeo.rotateZ(0.3) // Tilt
    leftGeo.translate(-0.22, 0.05, 0) // Shift left

    // 3. Right Loop (Flattened Sphere)
    const rightGeo = new THREE.SphereGeometry(0.25, 32, 16)
    rightGeo.scale(1.0, 0.6, 0.4) // Flatten
    rightGeo.rotateZ(-0.3) // Tilt
    rightGeo.translate(0.22, 0.05, 0) // Shift right

    const merged = BufferGeometryUtils.mergeGeometries([knotGeo, leftGeo, rightGeo])
    return merged
  }, [])

  const { treeData, scatterData, rotations, scales } = useMemo(() => {
    const tree: THREE.Vector3[] = []
    const scatter: THREE.Vector3[] = []
    const rot: THREE.Euler[] = []
    const sc: number[] = []

    for (let i = 0; i < count; i++) {
      const pos = generateOrnamentPosition('gift')
      tree.push(pos.tree)
      scatter.push(pos.scatter)
      rot.push(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI * 2, Math.random() * Math.PI))
      sc.push(0.8 + Math.random() * 0.4)
    }
    return { treeData: tree, scatterData: scatter, rotations: rot, scales: sc }
  }, [count])

  useFrame((state) => {
    if (!boxRef.current || !bowRef.current) return
    const t = mixRef.current
    const time = state.clock.elapsedTime

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
    }

    for (let i = 0; i < count; i++) {
      const tree = treeData[i]
      const scatter = scatterData[i]
      const r = rotations[i]
      const s = scales[i]

      // Interpolate position
      dummyBox.position.lerpVectors(scatter, tree, t)
      
      // Base rotation + gentle spin
      dummyBox.rotation.set(
        r.x + time * 0.1,
        r.y + time * 0.2,
        r.z
      )
      
      const currentScale = 0.35 * s * (0.6 + 0.4 * t)
      dummyBox.scale.setScalar(currentScale)
      dummyBox.updateMatrix()
      boxRef.current.setMatrixAt(i, dummyBox.matrix)

      // --- Update Bow ---
      dummyBow.position.copy(dummyBox.position)
      dummyBow.rotation.copy(dummyBox.rotation)
      dummyBow.scale.setScalar(currentScale)
      
      // Move bow to top of box (local Y)
      dummyBow.translateY(0.52 * currentScale) // Sit perfectly on top
      
      dummyBow.updateMatrix()
      bowRef.current.setMatrixAt(i, dummyBow.matrix)
    }
    
    boxRef.current.instanceMatrix.needsUpdate = true
    bowRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* Gift Boxes */}
      <instancedMesh ref={boxRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <luxuryGiftMaterial ref={materialRef} />
      </instancedMesh>
      
      {/* 3D Bows - Custom Merged Geometry */}
      <instancedMesh ref={bowRef} args={[bowGeometry, undefined, count]}>
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.4}
          metalness={0.3}
          emissive="#d4af37"
          emissiveIntensity={0.2}
        />
      </instancedMesh>
    </group>
  )
}

// Custom Orbiting Particles Component - Using Points for real "Light Dot" look
function OrbitingParticles({ count = 60, radius = 1.2 }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Random initial data
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * 1.5,
      radiusOffset: (Math.random() - 0.5) * 0.6,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * 100,
    }))
  }, [count])

  // Soft glowing dot texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32; canvas.height = 32
    const ctx = canvas.getContext('2d')!
    
    // Soft radial gradient
    const grad = ctx.createRadialGradient(16,16,0,16,16,16)
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
    grad.addColorStop(0.3, 'rgba(255, 255, 200, 0.8)')
    grad.addColorStop(0.6, 'rgba(255, 220, 100, 0.2)')
    grad.addColorStop(1, 'rgba(255, 200, 0, 0)')
    
    ctx.fillStyle = grad
    ctx.fillRect(0,0,32,32)
    
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [])

  // Initial positions buffer
  const positions = useMemo(() => new Float32Array(count * 3), [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.elapsedTime
    
    // We update the buffer attribute directly
    const posAttribute = pointsRef.current.geometry.attributes.position
    
    particles.forEach((p, i) => {
      // 1. Base Orbit
      const currentAngle = p.angle + time * p.speed
      
      // 2. Irregular Noise/Wobble
      // Superimpose sine waves for chaotic but smooth motion
      const wobbleX = Math.sin(time * 1.5 + p.offset) * 0.15
      const wobbleY = Math.cos(time * 2.0 + p.offset) * 0.15
      const wobbleZ = Math.sin(time * 2.5 + p.offset) * 0.15

      const r = radius + p.radiusOffset
      
      // Calculate position
      const x = Math.cos(currentAngle) * r + wobbleX
      const y = p.y + wobbleY
      const z = Math.sin(currentAngle) * r + wobbleZ

      // Update buffer
      posAttribute.setXYZ(i, x, y, z)
    })
    
    posAttribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.25} // Size of the dots
        sizeAttenuation={true}
        color="#fff" // Texture handles color, but this boosts brightness
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Ultimate Christmas Star Component - 5-Point Puffy "Cookie" Star
function Star({ mixRef }: { mixRef: { current: number } }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const { scatter, tree } = useMemo(() => generateOrnamentPosition('star'), [])

  // 5-Point Star Shape (Cookie Style)
  const starShape = useMemo(() => {
    const shape = new THREE.Shape()
    const points = 5 // <--- Back to 5 Points
    const outerRadius = 1 
    const innerRadius = 0.45 // Slightly adjusted for 5 points balance

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      // Rotate so first point (i=0) is straight UP (PI/2)
      const angle = (i * Math.PI) / points + Math.PI / 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    return shape
  }, [])

  // Extrude settings for "Puffy/Bulging" look
  const extrudeSettings = useMemo(() => ({
    depth: 0.1,          // Thin base layer
    bevelEnabled: true,
    bevelThickness: 0.4, // High bevel = Puffy/Dome-like center
    bevelSize: 0.35,     // Large inset = Sharpens the top, reducing flat area
    bevelSegments: 12    // Smooth rounded puffiness
  }), [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = mixRef.current
    const time = state.clock.elapsedTime

    groupRef.current.position.lerpVectors(scatter, tree, t)
    
    groupRef.current.rotation.y = 0
    
    // Breathing scale - Reduced base size to 0.75
    const pulse = 1 + Math.sin(time * 1.5) * 0.02
    groupRef.current.scale.setScalar(0.75 * (0.5 + 0.5 * t) * pulse)
  })

  return (
    <group ref={groupRef}>
      {/* Point Light */}
      <pointLight color="#ffaa00" intensity={4} distance={12} decay={2} />

      {/* 1. Core (Bright Center) */}
      <mesh position={[0,0,0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={[10, 10, 8]} toneMapped={false} /> 
      </mesh>

      {/* 2. Main Body - Puffy Gold Cookie */}
      <mesh position={[0, 0, -0.1]}> {/* Center Z based on (depth + bevelThickness)/2 approx */}
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={2.5} 
          toneMapped={false}      
          roughness={0.15}
          metalness={1.0}
        />
      </mesh>

      {/* 3. Orbiting Light Points */}
      <OrbitingParticles count={80} radius={1.2} />

    </group>
  )
}

// Sophisticated Snowflake Texture Generator - 6 distinct crystalline styles
function createSnowflakeTexture(style: number): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2

  ctx.clearRect(0, 0, size, size)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Ice blue glow effect
  ctx.shadowColor = 'rgba(160, 210, 235, 0.8)'
  ctx.shadowBlur = 8
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'

  const drawSymmetry = (drawFn: () => void) => {
    for (let i = 0; i < 6; i++) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((Math.PI / 3) * i)
      drawFn()
      ctx.restore()
    }
  }

  drawSymmetry(() => {
    ctx.beginPath()

    switch (style) {
      case 0: // Classic Dendrite (Fern-like)
        ctx.lineWidth = 4
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -size * 0.45)
        ctx.stroke()
        for (let j = 1; j <= 4; j++) {
          const y = -size * 0.1 * j
          const len = size * 0.15 * (1 - j / 5)
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(len, y - len)
          ctx.moveTo(0, y)
          ctx.lineTo(-len, y - len)
          ctx.stroke()
        }
        break

      case 1: // Hexagonal Plate with ridges
        ctx.lineWidth = 2
        ctx.moveTo(0, 0)
        ctx.lineTo(size * 0.1, -size * 0.4)
        ctx.lineTo(-size * 0.1, -size * 0.4)
        ctx.lineTo(0, 0)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, -size * 0.1)
        ctx.lineTo(0, -size * 0.3)
        ctx.stroke()
        break

      case 2: // Stellar Star (Sharp)
        ctx.lineWidth = 3
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(size * 0.05, -size * 0.1, 0, -size * 0.45)
        ctx.quadraticCurveTo(-size * 0.05, -size * 0.1, 0, 0)
        ctx.fill()
        break

      case 3: // Broad Fern with ellipse
        ctx.lineWidth = 2
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -size * 0.4)
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(0, -size * 0.25, size * 0.08, size * 0.15, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fill()
        break

      case 4: // Capped Column / Prism
        ctx.lineWidth = 3
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -size * 0.35)
        ctx.moveTo(0, -size * 0.35)
        ctx.lineTo(size * 0.05, -size * 0.45)
        ctx.lineTo(0, -size * 0.48)
        ctx.lineTo(-size * 0.05, -size * 0.45)
        ctx.lineTo(0, -size * 0.35)
        ctx.stroke()
        break

      case 5: // Fancy Sectored Plate
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(size * 0.15, -size * 0.4)
        ctx.lineTo(0, -size * 0.35)
        ctx.lineTo(-size * 0.15, -size * 0.4)
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.fill()
        ctx.stroke()
        break
    }
  })

  // Soft glowing center
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
  grad.addColorStop(0, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.5, 'rgba(160,210,235,0.4)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, 20, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// Custom Shader Material for sparkle & glow effect
const snowflakeShaderMaterial = {
  uniforms: {
    map: { value: null as THREE.Texture | null },
    time: { value: 0 },
    opacity: { value: 0.9 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      vec4 mvPosition = viewMatrix * worldPosition;
      vViewPosition = -mvPosition.xyz;
      vPos = worldPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D map;
    uniform float time;
    uniform float opacity;

    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vViewPosition;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec4 texColor = texture2D(map, vUv);
      if (texColor.a < 0.01) discard;

      vec3 viewDir = normalize(vViewPosition);
      float sparkleNoise = random(vPos.xy + floor(time * 5.0));
      float sparkle = pow(max(0.0, dot(viewDir, vec3(0.0, 0.0, 1.0))), 8.0);
      float twinkle = sin(time * 3.0 + vPos.x * 10.0 + vPos.y * 8.0) * 0.5 + 0.5;

      vec3 baseColor = vec3(0.9, 0.95, 1.0);
      vec3 iceBlue = vec3(0.63, 0.82, 0.92);
      vec3 softPink = vec3(1.0, 0.71, 0.76);
      vec3 tint = mix(baseColor, mix(iceBlue, softPink, sparkleNoise * 0.3), 0.2);

      vec3 finalColor = texColor.rgb * tint;
      finalColor += vec3(1.0) * sparkle * twinkle * 0.6;

      float alphaPulse = opacity * (0.75 + 0.25 * sin(time * 2.5 + vPos.y * 2.0));
      gl_FragColor = vec4(finalColor, texColor.a * alphaPulse);
    }
  `
}

// Snowflake Batch Component with custom shader
function SnowflakeBatch({ count, styleIndex, mixRef }: {
  count: number
  styleIndex: number
  mixRef: { current: number }
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const texture = useMemo(() => createSnowflakeTexture(styleIndex), [styleIndex])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const { treeData, scatterData, speeds, phases, scales } = useMemo(() => {
    const tData: THREE.Vector3[] = []
    const sData: THREE.Vector3[] = []
    const spd = new Float32Array(count)
    const ph = new Float32Array(count)
    const sc = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const pos = generateOrnamentPosition('snowflake')
      tData.push(pos.tree)
      sData.push(pos.scatter)
      spd[i] = 0.15 + Math.random() * 0.35
      ph[i] = Math.random() * Math.PI * 2
      sc[i] = 0.4 + Math.random() * 0.4
    }

    return { treeData: tData, scatterData: sData, speeds: spd, phases: ph, scales: sc }
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return
    const t = mixRef.current
    const smoothT = t * t * (3 - 2 * t) // smoothstep
    const time = clock.elapsedTime

    materialRef.current.uniforms.time.value = time

    for (let i = 0; i < count; i++) {
      const start = scatterData[i]
      const end = treeData[i]
      const speed = speeds[i]
      const phase = phases[i]
      const scale = scales[i]

      // Natural floating motion
      const floatY = Math.sin(time * speed + phase) * 0.2
      const floatX = Math.cos(time * speed * 0.7 + phase) * 0.15
      const windDrift = Math.sin(time * 0.3 + phase) * 0.1

      dummy.position.lerpVectors(start, end, smoothT)
      dummy.position.x += floatX * (1 - smoothT * 0.5)
      dummy.position.y += floatY
      dummy.position.z += windDrift * (1 - smoothT * 0.5)

      // Gentle tumbling rotation
      dummy.rotation.x = time * speed * 0.4 + phase
      dummy.rotation.y = time * speed * 0.3 + phase * 0.5
      dummy.rotation.z = Math.sin(time * speed * 0.5 + phase) * 0.3

      // Size with twinkle
      const twinkle = 1 + Math.sin(time * 2.5 + phase) * 0.15
      dummy.scale.setScalar(scale * twinkle)

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const shaderMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        time: { value: 0 },
        opacity: { value: 0.85 }
      },
      vertexShader: snowflakeShaderMaterial.vertexShader,
      fragmentShader: snowflakeShaderMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    return mat
  }, [texture])

  useLayoutEffect(() => {
    materialRef.current = shaderMaterial
  }, [shaderMaterial])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={shaderMaterial} attach="material" />
    </instancedMesh>
  )
}

// Snowflakes Component - 6 batches with different crystalline styles
function Snowflakes({ mixRef }: { mixRef: { current: number } }) {
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((style) => (
        <SnowflakeBatch key={style} count={25} styleIndex={style} mixRef={mixRef} />
      ))}
    </group>
  )
}

// Main Ornaments Component
export function Ornaments({ mixRef }: OrnamentsProps) {
  return (
    <group>
      <Star mixRef={mixRef} />
      <Baubles mixRef={mixRef} count={1400} scale={0.15} />
      <Baubles mixRef={mixRef} count={600} scale={0.09} />
      <Diamonds mixRef={mixRef} count={50} />
      <Gifts mixRef={mixRef} count={40} />
      <Lights mixRef={mixRef} count={600} />
      <Snowflakes mixRef={mixRef} />
    </group>
  )
}
