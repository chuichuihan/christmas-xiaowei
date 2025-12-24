interface LoadingScreenProps {
  visible: boolean
  progress: number
}

export function LoadingScreen({ visible, progress }: LoadingScreenProps) {
  const pct = Math.min(100, Math.max(0, progress || 0))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, rgba(255, 215, 0, 0.06), #050a14 60%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 600ms ease-out',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner { animation: none; }
          .loading-text { animation: none; }
        }
      `}</style>

      <div
        className="loading-spinner"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(255, 215, 0, 0.2)',
          borderTopColor: '#FFD700',
          animation: 'spin 1s linear infinite',
        }}
      />

      <div
        style={{
          marginTop: 24,
          width: 120,
          height: 4,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #FFD700, #ff6fb1)',
            transformOrigin: 'left',
            transform: `scaleX(${pct / 100})`,
            transition: 'transform 200ms ease',
          }}
        />
      </div>

      <div
        role="status"
        aria-live="polite"
        className="loading-text"
        style={{
          marginTop: 12,
          fontSize: 12,
          fontFamily: 'serif',
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.1em',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        Loading...
      </div>
    </div>
  )
}
