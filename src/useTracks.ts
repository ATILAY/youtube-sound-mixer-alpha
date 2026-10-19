import { useCallback, useEffect, useState } from 'react'
import type { Preset, Track } from './types'
import { MAX_TRACKS, parseYouTubeId } from './youtube'

const TRACKS_KEY = 'ysm.tracks'
const MASTER_KEY = 'ysm.master'
const PRESETS_KEY = 'ysm.presets'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}
const uid = () => Math.random().toString(36).slice(2, 10)
const clamp = (n: unknown) => Math.min(100, Math.max(0, Number(n) || 0))

function sanitize(list: unknown): Track[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((t) => t && typeof t.videoId === 'string' && parseYouTubeId(t.videoId))
    .slice(0, MAX_TRACKS)
    .map((t) => ({
      id: uid(), videoId: t.videoId, title: typeof t.title === 'string' ? t.title : t.videoId,
      volume: clamp(t.volume), muted: !!t.muted, loop: !!t.loop,
    }))
}

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>(() => sanitize(load(TRACKS_KEY, [])))
  const [master, setMaster] = useState<number>(() => clamp(load(MASTER_KEY, 100)))
  const [presets, setPresets] = useState<Preset[]>(() => load<Preset[]>(PRESETS_KEY, []))

  useEffect(() => save(TRACKS_KEY, tracks), [tracks])
  useEffect(() => save(MASTER_KEY, master), [master])
  useEffect(() => save(PRESETS_KEY, presets), [presets])

  /** Returns an error message, or null on success. */
  const add = useCallback((input: string): string | null => {
    const videoId = parseYouTubeId(input)
    if (!videoId) return "That doesn't look like a valid YouTube link."
    if (tracks.length >= MAX_TRACKS) return `You can mix up to ${MAX_TRACKS} tracks. Remove one first.`
    if (tracks.some((t) => t.videoId === videoId)) return 'That video is already in your mix.'
    setTracks((ts) => [...ts, { id: uid(), videoId, title: 'Loading…', volume: 70, muted: false, loop: false }])
    return null
  }, [tracks])

  const update = useCallback((id: string, patch: Partial<Track>) => {
    setTracks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])
  const remove = useCallback((id: string) => setTracks((ts) => ts.filter((t) => t.id !== id)), [])
  const clear = useCallback(() => setTracks([]), [])

  const savePreset = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    const snapshot = tracks.map(({ id: _id, ...rest }) => rest)
    setPresets((ps) => [...ps.filter((p) => p.name !== n), { name: n, tracks: snapshot }])
  }, [tracks])
  const loadPreset = useCallback((name: string) => {
    const p = presets.find((x) => x.name === name)
    if (p) setTracks(sanitize(p.tracks))
  }, [presets])
  const deletePreset = useCallback((name: string) => setPresets((ps) => ps.filter((p) => p.name !== name)), [])

  return { tracks, master, setMaster, presets, add, update, remove, clear, savePreset, loadPreset, deletePreset }
}
