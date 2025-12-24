import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera } from 'three'

export function ResponsiveCamera() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const controls = useThree((state) => state.controls) as any
  const size = useThree((state) => state.size)
  const lastAspect = useRef(0)

  useLayoutEffect(() => {
    if (!controls) return

    const TREE_V_EXTENT = 7
    const TREE_H_EXTENT = 5.5

    // 自适应边距：手机紧凑(1.1)，桌面宽松(1.45)
    const MOBILE_PADDING = 1.1
    const DESKTOP_PADDING = 1.45
    const MOBILE_ASPECT = 0.6
    const DESKTOP_ASPECT = 1.6

    const aspect = size.width / size.height
    const t = MathUtils.clamp((aspect - MOBILE_ASPECT) / (DESKTOP_ASPECT - MOBILE_ASPECT), 0, 1)
    const padding = MathUtils.lerp(MOBILE_PADDING, DESKTOP_PADDING, t * t * (3 - 2 * t))

    const fov = (camera.fov ?? 50) * (Math.PI / 180)

    const distV = TREE_V_EXTENT / Math.tan(fov / 2)
    const distH = TREE_H_EXTENT / (Math.tan(fov / 2) * aspect)
    const finalDist = Math.max(distV, distH) * padding

    // 仅在初始化或窗口尺寸变化时调整相机位置
    // 避免切换状态时重置用户的缩放调整
    if (Math.abs(aspect - lastAspect.current) > 0.001) {
      camera.position.z = finalDist
      camera.updateProjectionMatrix()
      lastAspect.current = aspect
    }

    controls.minDistance = finalDist * 0.5
    controls.maxDistance = finalDist * 2.0
    controls.update()
  }, [camera, controls, size.width, size.height])

  return null
}
