export function Overlay() {
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
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '30px',
            backdropFilter: 'blur(4px)',
          }}
        >
          Click anywhere
        </div>
      </div>
  )
}
