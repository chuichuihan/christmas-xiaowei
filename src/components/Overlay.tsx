interface OverlayProps {
  isTreeShape: boolean
}

export function Overlay({ isTreeShape }: OverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.8)',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '30px',
          backdropFilter: 'blur(4px)',
        }}
      >
        {isTreeShape ? 'Click anywhere' : 'Click anywhere'}
      </div>
    </div>
  )
}
