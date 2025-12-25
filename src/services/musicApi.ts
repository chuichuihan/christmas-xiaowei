import type { MusicTrack, NeteaseSearchResponse, NeteaseSongUrlResponse } from '../types/music'

const API_BASE = 'https://api.tunefree.fun'
const TIMEOUT_MS = 15000

const FALLBACK_SONGS: MusicTrack[] = [
  { id: 1804289790, name: 'Jingle Bells', artists: ['Christmas'] },
  { id: 28408582, name: 'All I Want for Christmas Is You', artists: ['Mariah Carey'] },
  { id: 189530, name: 'Last Christmas', artists: ['Wham!'] },
]

const urlCache = new Map<number, string>()

async function fetchWithTimeout<T>(url: string, timeout = TIMEOUT_MS): Promise<T> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(id)
  }
}

export async function searchChristmasSongs(keywords = '圣诞', limit = 20): Promise<MusicTrack[]> {
  try {
    const url = `${API_BASE}/search?keywords=${encodeURIComponent(keywords)}&type=1&limit=${limit}`
    const data = await fetchWithTimeout<NeteaseSearchResponse>(url)
    if (data.code !== 200 || !data.result?.songs?.length) return FALLBACK_SONGS
    return data.result.songs.map((s) => ({
      id: s.id,
      name: s.name,
      artists: (s.artists || s.ar)?.map((a) => a.name),
    }))
  } catch {
    return FALLBACK_SONGS
  }
}

export async function getSongUrl(id: number): Promise<string | null> {
  const cached = urlCache.get(id)
  if (cached) return cached
  try {
    const data = await fetchWithTimeout<NeteaseSongUrlResponse>(`${API_BASE}/song/url?id=${id}`)
    const rawUrl = data.data?.[0]?.url
    if (!rawUrl) return null
    const url = rawUrl.replace(/^http:/, 'https:')
    urlCache.set(id, url)
    return url
  } catch {
    return null
  }
}

export async function preloadFirstSong(): Promise<{ track: MusicTrack; url: string; playlist: MusicTrack[] } | null> {
  const songs = await searchChristmasSongs()
  if (!songs.length) return null
  for (const track of songs) {
    const url = await getSongUrl(track.id)
    if (url) return { track, url, playlist: songs }
  }
  return null
}
