export interface MusicTrack {
  id: string
  name: string
  artists?: string[]
  platform?: string
}

export interface TuneHubSearchResponse {
  code: number
  message?: string
  data?: {
    keyword: string
    total: number
    results: {
      id: string
      name: string
      artist: string
      album?: string
      platform: string
    }[]
  }
}
