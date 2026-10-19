export interface Track {
  id: string
  videoId: string
  title: string
  volume: number
  muted: boolean
  loop: boolean
}
export interface Preset {
  name: string
  tracks: Omit<Track, 'id'>[]
}
