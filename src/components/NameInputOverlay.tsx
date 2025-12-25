import { useState, useMemo, useCallback } from 'react'

interface NameInputOverlayProps {
  show: boolean
  onSubmit: (name: string, isGift: boolean) => void
}

export function NameInputOverlay({ show, onSubmit }: NameInputOverlayProps) {
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)

  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${(i * 8.5) % 100}%`,
      delay: (i * 1.1) % 4,
      symbol: i % 4 === 0 ? '♥' : i % 3 === 0 ? '★' : '✦',
      size: 0.7 + (i % 3) * 0.35,
    })), []
  )

  const handleGift = useCallback(async () => {
    if (!name.trim()) return
    const shareUrl = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(name.trim())}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('复制此链接分享给TA:', shareUrl)
    }
  }, [name])

  const handlePreview = useCallback(() => {
    if (!name.trim()) return
    onSubmit(name.trim(), false)
  }, [name, onSubmit])

  const isEnglishOnly = /^[a-zA-Z\s]+$/.test(name)
  const containsForbidden = /薇|wei/i.test(name)

  return (
    <>
      <style>{`
        @keyframes float-up-fade {
          0% { transform: translateY(110vh) scale(0); opacity: 0; }
          15% { opacity: 0.5; transform: translateY(80vh) scale(1); }
          85% { opacity: 0.35; }
          100% { transform: translateY(-10vh) scale(0.5); opacity: 0; }
        }
        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .name-input::placeholder {
          color: rgba(255, 215, 0, 0.4);
        }
        .name-input:focus {
          outline: none;
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }
        .action-btn {
          padding: 12px 28px;
          font-size: 16px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .gift-btn {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #1a1a2e;
        }
        .gift-btn:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
        }
        .preview-btn {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .preview-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
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
          zIndex: 200,
          opacity: show ? 1 : 0,
          pointerEvents: show ? 'auto' : 'none',
          transition: 'opacity 0.6s ease',
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
              color: p.symbol === '♥' ? 'rgba(255, 182, 193, 0.4)' : 'rgba(255, 255, 240, 0.5)',
              animation: show ? `float-up-fade ${9 + p.delay}s linear infinite` : 'none',
              animationDelay: `-${p.delay * 2.5}s`,
              textShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
            }}
          >
            {p.symbol}
          </div>
        ))}

        <div style={{
          textAlign: 'center',
          padding: '40px',
          borderRadius: '20px',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 215, 0, 0.1)',
        }}>
          <h2 style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: '#FFD700',
            marginBottom: '30px',
            fontWeight: 300,
            letterSpacing: '0.1em',
            animation: 'gentle-pulse 3s ease-in-out infinite',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
          }}>
            送给谁呢？
          </h2>

          <input
            type="text"
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入名字..."
            maxLength={20}
            style={{
              width: '280px',
              padding: '14px 20px',
              fontSize: '1.2rem',
              fontFamily: isEnglishOnly ? '"Dancing Script", cursive' : '"Noto Serif SC", serif',
              fontWeight: isEnglishOnly ? 700 : 300,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              color: '#FFD700',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
          />

          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '30px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              className="action-btn gift-btn"
              onClick={handleGift}
              disabled={!name.trim() || containsForbidden}
              style={{ minWidth: '130px' }}
            >
              {containsForbidden ? '无法生成哟！' : copied ? '已复制!' : '赠送给TA'}
            </button>
            <button
              className="action-btn preview-btn"
              onClick={handlePreview}
              disabled={!name.trim()}
            >
              仅预览
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
