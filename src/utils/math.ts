import * as THREE from 'three'

// Generate scatter position (spherical uniform distribution)
export function generateScatterPosition(): THREE.Vector3 {
  const r = 14 * Math.cbrt(Math.random())
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)

  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta) + 6, // y offset +6
    r * Math.cos(phi)
  )
}

// Generate tree position (cone distribution)
export function generateTreePosition(forceBottom = false): THREE.Vector3 {
  let h: number, maxR: number, angle: number

  if (forceBottom) {
    // 8% particles forced to bottom edge
    h = 0
    maxR = 3.8
    angle = Math.random() * Math.PI * 2
  } else {
    h = 12 * (1 - Math.cbrt(Math.random())) // height 0-12, denser at bottom
    maxR = 3.8 * (1 - h / 12.5)
    angle = Math.random() * Math.PI * 2
  }

  const r = maxR * Math.sqrt(Math.random())

  return new THREE.Vector3(
    r * Math.cos(angle),
    h,
    r * Math.sin(angle)
  )
}

// Generate positions for foliage particles
export function generateFoliagePositions(count: number) {
  const scatterPositions = new Float32Array(count * 3)
  const treePositions = new Float32Array(count * 3)
  const randoms = new Float32Array(count)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const forceBottom = Math.random() < 0.08
    const scatter = generateScatterPosition()
    const tree = generateTreePosition(forceBottom)

    scatterPositions[i * 3] = scatter.x
    scatterPositions[i * 3 + 1] = scatter.y
    scatterPositions[i * 3 + 2] = scatter.z

    treePositions[i * 3] = tree.x
    treePositions[i * 3 + 1] = tree.y
    treePositions[i * 3 + 2] = tree.z

    randoms[i] = Math.random()
    sizes[i] = 0.8 + Math.random() * 0.4
  }

  return { scatterPositions, treePositions, randoms, sizes }
}

// Generate ornament positions based on type
export function generateOrnamentPosition(
  type: 'star' | 'bauble' | 'diamond' | 'gift' | 'light' | 'snowflake'
): { scatter: THREE.Vector3; tree: THREE.Vector3 } {
  const scatter = generateScatterPosition()
  let tree: THREE.Vector3

  switch (type) {
    case 'star':
      tree = new THREE.Vector3(0, 11.58, 0)
      break
    case 'diamond':
      // Middle layer h=3~9
      const dh = 3 + Math.random() * 6
      const dmaxR = 3.8 * (1 - dh / 12.5)
      const dangle = Math.random() * Math.PI * 2
      const dr = dmaxR * Math.sqrt(Math.random())
      tree = new THREE.Vector3(dr * Math.cos(dangle), dh, dr * Math.sin(dangle))
      break
    case 'gift':
      // Bottom stacking r=1.5~4.5
      const gangle = Math.random() * Math.PI * 2
      const gr = 1.5 + Math.random() * 3
      tree = new THREE.Vector3(gr * Math.cos(gangle), 0.15, gr * Math.sin(gangle))
      break
    case 'snowflake':
      // Outer sparse ring
      const sh = Math.random() * 10
      const smaxR = 4.5 * (1 - sh / 14)
      const sangle = Math.random() * Math.PI * 2
      tree = new THREE.Vector3(smaxR * Math.cos(sangle), sh + 1, smaxR * Math.sin(sangle))
      break
    default:
      // bauble, light - cone surface
      tree = generateTreePosition()
      break
  }

  return { scatter, tree }
}
