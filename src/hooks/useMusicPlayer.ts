import { useCallback, useEffect, useRef, useState } from 'react'
import { getSongUrl } from '../services/musicApi'
import type { MusicTrack } from '../types/music'

interface UseMusicPlayerOptions {
  preloadedUrl?: string
  fadeInMs?: number
}

const clampVolume = (v: number) => Math.max(0, Math.min(1, v))

export function useMusicPlayer(playlist: MusicTrack[], options: UseMusicPlayerOptions = {}) {
  const { preloadedUrl, fadeInMs = 3000 } = options

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeRafRef = useRef<number>(0)
  const hasFadedRef = useRef(false)
  const targetVolumeRef = useRef(1)
  const mountedRef = useRef(true)
  const switchIdRef = useRef(0)

  const currentTrack = playlist[currentIndex] ?? null

  useEffect(() => {
    mountedRef.current = true
    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = clampVolume(0)
    audioRef.current = audio

    if (preloadedUrl) {
      audio.src = preloadedUrl
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => { setIsLoading(false); setIsPlaying(false) }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    return () => {
      mountedRef.current = false
      cancelAnimationFrame(fadeRafRef.current)
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [preloadedUrl])

  const fadeIn = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    cancelAnimationFrame(fadeRafRef.current)
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / fadeInMs)
      audio.volume = clampVolume(targetVolumeRef.current * t)
      if (t < 1) fadeRafRef.current = requestAnimationFrame(step)
      else hasFadedRef.current = true
    }
    fadeRafRef.current = requestAnimationFrame(step)
  }, [fadeInMs])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio?.src) return
    try {
      if (!hasFadedRef.current) audio.volume = clampVolume(0)
      await audio.play()
      if (!hasFadedRef.current) fadeIn()
    } catch { /* autoplay blocked */ }
  }, [fadeIn])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, pause, play])

  const switchTrack = useCallback(async (index: number) => {
    const track = playlist[index]
    if (!track) return
    setCurrentIndex(index)
    setIsLoading(true)
    const url = getSongUrl(track.id, track.platform)
    const audio = audioRef.current
    if (!audio) {
      setIsLoading(false)
      return
    }

    const currentSwitchId = ++switchIdRef.current
    const wasPlaying = !audio.paused

    const handleCanPlay = async () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      if (!mountedRef.current || switchIdRef.current !== currentSwitchId) return
      setIsLoading(false)
      if (wasPlaying) {
        audio.volume = clampVolume(hasFadedRef.current ? targetVolumeRef.current : 0)
        try {
          await audio.play()
          if (mountedRef.current && switchIdRef.current === currentSwitchId && !hasFadedRef.current) {
            fadeIn()
          }
        } catch { /* blocked */ }
      }
    }

    const handleError = () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      if (!mountedRef.current || switchIdRef.current !== currentSwitchId) return
      setIsLoading(false)
    }

    audio.addEventListener('canplay', handleCanPlay, { once: true })
    audio.addEventListener('error', handleError, { once: true })

    audio.src = url
    audio.load()

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleCanPlay()
    }
  }, [playlist, fadeIn])

  return {
    isPlaying,
    isLoading,
    currentTrack,
    currentIndex,
    play,
    pause,
    toggle,
    switchTrack,
    audio: audioRef.current,
  }
}
