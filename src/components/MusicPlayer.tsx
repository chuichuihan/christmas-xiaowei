import { useState, useEffect } from 'react'
import { useLongPress } from '../hooks/useLongPress'
import { useMusicPlayer } from '../hooks/useMusicPlayer'
import type { MusicTrack } from '../types/music'

interface MusicPlayerProps {
  playlist: MusicTrack[]
  preloadedUrl?: string
  onReady?: () => void
}

export function MusicPlayer({ playlist, preloadedUrl, onReady }: MusicPlayerProps) {
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const { isPlaying, isLoading, currentIndex, toggle, switchTrack, play } = useMusicPlayer(playlist, { preloadedUrl })

  const longPress = useLongPress<HTMLButtonElement>(() => setShowModal(true), 500)

  useEffect(() => {
    if (preloadedUrl) {
      onReady?.()
      const timer = setTimeout(() => play(), 100)
      return () => clearTimeout(timer)
    }
  }, [preloadedUrl, onReady, play])

  useEffect(() => {
    if (!showModal) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showModal])

  const handleSelect = async (index: number) => {
    await switchTrack(index)
    setShowModal(false)
  }

  return (
    <>
      <style>{`
        @keyframes wave-bounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      <button
        {...longPress}
        onClick={toggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: isHovered ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(4px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
          outline: 'none',
        }}
        title="Music (long press for list)"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 14,
              background: 'currentColor',
              borderRadius: 2,
              transform: isPlaying ? undefined : 'scaleY(0.3)',
              animation: isPlaying ? `wave-bounce 0.8s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(90vw, 320px)',
              maxHeight: '60vh',
              background: 'rgba(15,15,20,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              color: 'white',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Christmas Playlist</h3>
            <div
              className="playlist-scroll"
              style={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.2) transparent',
              }}
            >
              {playlist.map((song, idx) => (
                <div
                  key={song.id}
                  onClick={() => handleSelect(idx)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: currentIndex === idx ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'background 0.2s',
                  }}
                >
                  {isLoading && currentIndex === idx ? (
                    <div style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : currentIndex === idx && isPlaying ? (
                    <span style={{ fontSize: 12 }}>♪</span>
                  ) : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.name}
                    </div>
                    {song.artists && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.artists.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .playlist-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .playlist-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .playlist-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
        .playlist-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </>
  )
}
