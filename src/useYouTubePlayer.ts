import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from './youtube'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<any> | null = null
function loadApi(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      document.head.appendChild(s)
    })
  }
  return apiPromise
}

export interface PlayerOptions {
  videoId: string
  volume: number
  muted: boolean
  loop: boolean
  onTitle?: (title: string) => void
}

export interface PlayerApi {
  containerRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
  playing: boolean
  error: string | null
  play: () => void
  pause: () => void
  stop: () => void
}

/** One YouTube IFrame Player per hook instance. Volume = track volume * master volume. */
export function useYouTubePlayer(
  opts: PlayerOptions,
  masterVolume: number,
  register?: (id: string, api: Pick<PlayerApi, 'play' | 'pause' | 'stop'> | null) => void,
  trackId?: string,
): PlayerApi {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const optsRef = useRef(opts)
  const masterRef = useRef(masterVolume)
  useEffect(() => {
    optsRef.current = opts
    masterRef.current = masterVolume
  })

  useEffect(() => {
    let cancelled = false
    let player: any
    loadApi().then((YT) => {
      if (cancelled || !containerRef.current) return
      const el = document.createElement('div')
      containerRef.current.appendChild(el)
      player = new YT.Player(el, {
        videoId: optsRef.current.videoId,
        width: '160',
        height: '90',
        playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: () => {
            if (cancelled) return
            playerRef.current = player
            const o = optsRef.current
            player.setVolume(Math.round(o.volume * masterRef.current / 100))
            if (o.muted) player.mute()
            else player.unMute()
            const title = player.getVideoData?.().title
            if (title) o.onTitle?.(title)
            setReady(true)
          },
          onStateChange: (e: any) => {
            if (cancelled) return
            setPlaying(e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING)
            if (e.data === YT.PlayerState.ENDED && optsRef.current.loop) {
              player.seekTo(0, true)
              player.playVideo()
            }
            const title = player.getVideoData?.().title
            if (title) optsRef.current.onTitle?.(title)
          },
          onError: (e: any) => {
            if (cancelled) return
            setError(errorMessage(e.data))
            setPlaying(false)
          },
        },
      })
    })
    return () => {
      cancelled = true
      playerRef.current = null
      try { player?.destroy() } catch { /* ignore */ }
    }
  }, [opts.videoId])

  useEffect(() => {
    const p = playerRef.current
    if (!ready || !p) return
    p.setVolume(Math.round(opts.volume * masterVolume / 100))
    if (opts.muted) p.mute()
    else p.unMute()
  }, [ready, opts.volume, opts.muted, masterVolume])

  const play = useCallback(() => { playerRef.current?.playVideo() }, [])
  const pause = useCallback(() => { playerRef.current?.pauseVideo() }, [])
  const stop = useCallback(() => {
    playerRef.current?.stopVideo()
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!register || !trackId) return
    register(trackId, { play, pause, stop })
    return () => register(trackId, null)
  }, [register, trackId, play, pause, stop])

  return { containerRef, ready, playing, error, play, pause, stop }
}
