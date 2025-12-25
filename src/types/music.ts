export interface MusicTrack {
  id: number
  name: string
  artists?: string[]
}

export interface NeteaseSearchResponse {
  code: number
  result?: {
    songs?: {
      id: number
      name: string
      artists?: { name: string }[]
      ar?: { name: string }[]
    }[]
  }
}

export interface NeteaseSongUrlResponse {
  code: number
  data?: { id: number; url: string | null }[]
}
