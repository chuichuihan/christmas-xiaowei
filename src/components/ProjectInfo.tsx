import { useState, useEffect } from 'react'

export function ProjectInfo() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isHovered ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(4px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          color: isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
        }}
        title="Project Info"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {isOpen && <InfoModal onClose={() => setIsOpen(false)} />}
    </>
  )
}

function InfoModal({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: 'min(90vw, 280px)',
          padding: '28px 24px',
          background: 'rgba(15, 15, 20, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          color: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
            Created by
          </p>
          <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 600, letterSpacing: '0.05em' }}>
            Han&Wei
          </p>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

        <a
          href="https://github.com/chuichuihan/christmas-xiaowei"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: linkHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'background 0.2s',
            width: '100%',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  )
}
