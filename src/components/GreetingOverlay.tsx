import { useMemo } from 'react'

interface GreetingOverlayProps {
  show: boolean
}

export function GreetingOverlay({ show }: GreetingOverlayProps) {
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${(i * 7) % 100}%`,
      delay: (i * 1.2) % 5,
      symbol: i % 4 === 0 ? '♥' : i % 3 === 0 ? '★' : '✦',
      size: 0.8 + (i % 3) * 0.4,
    })), []
  )

  return (
    <>
      <style>{`
        @keyframes float-dreamy {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float-up-fade {
          0% { transform: translateY(110vh) scale(0); opacity: 0; }
          15% { opacity: 0.6; transform: translateY(80vh) scale(1); }
          85% { opacity: 0.4; }
          100% { transform: translateY(-10vh) scale(0.5); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden={!show}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 90,
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(1.1)',
          filter: show ? 'blur(0)' : 'blur(10px)',
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), filter 1.2s ease-out',
          overflow: 'hidden',
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              bottom: '-20px',
              fontSize: `${p.size}rem`,
              color: p.symbol === '♥' ? 'rgba(255, 182, 193, 0.5)' : 'rgba(255, 255, 240, 0.6)',
              animation: show ? `float-up-fade ${8 + p.delay}s linear infinite` : 'none',
              animationDelay: `-${p.delay * 2}s`,
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          >
            {p.symbol}
          </div>
        ))}

        <div style={{
          textAlign: 'center',
          animation: show ? 'float-dreamy 5s ease-in-out infinite' : 'none',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140%',
            height: '140%',
            background: 'radial-gradient(circle, rgba(255, 192, 203, 0.15) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(30px)',
            zIndex: -1
          }} />

          <h1
            style={{
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 300,
              fontSize: 'clamp(4rem, 12vw, 8rem)',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '0.05em',
              color: '#FFD700',
              textShadow: '0 0 15px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 180, 0, 0.3)',
            }}
          >
            小薇
          </h1>
          <h2
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              color: '#FFD700',
              margin: '-0.1em 0 0 0',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textShadow: '0 0 15px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 180, 0, 0.3)',
            }}
          >
            Merry Christmas
          </h2>
        </div>
      </div>
    </>
  )
}
