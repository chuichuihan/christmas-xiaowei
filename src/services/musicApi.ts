import type { MusicTrack, TuneHubSearchResponse } from '../types/music'

const API_BASE = 'https://music-dl.sayqz.com/api'
const TIMEOUT_MS = 15000

const FALLBACK_SONGS: MusicTrack[] = [
  { id: '1804289790', name: 'Jingle Bells', artists: ['Christmas'], platform: 'netease' },
  { id: '28408582', name: 'All I Want for Christmas Is You', artists: ['Mariah Carey'], platform: 'netease' },
  { id: '189530', name: 'Last Christmas', artists: ['Wham!'], platform: 'netease' },
]

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
    const url = `${API_BASE}/?type=aggregateSearch&keyword=${encodeURIComponent(keywords)}&limit=${limit}`
    const data = await fetchWithTimeout<TuneHubSearchResponse>(url)
    if (data.code !== 200 || !data.data?.results?.length) return FALLBACK_SONGS
    return data.data.results
      .filter((s) => s.platform === 'netease')
      .map((s) => ({
        id: s.id,
        name: s.name,
        artists: s.artist ? [s.artist] : undefined,
        platform: s.platform,
      }))
  } catch {
    return FALLBACK_SONGS
  }
}

export function getSongUrl(id: string, _platform = 'netease'): string {
  return `${API_BASE}/?source=netease&id=${id}&type=url&br=320k`
}

export async function preloadFirstSong(): Promise<{ track: MusicTrack; url: string; playlist: MusicTrack[] } | null> {
  const songs = await searchChristmasSongs()
  if (!songs.length) return null
  const track = songs[0]
  const url = getSongUrl(track.id, track.platform)
  return { track, url, playlist: songs }
}
