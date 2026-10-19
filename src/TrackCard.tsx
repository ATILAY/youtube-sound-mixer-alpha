import type { PlayerApi } from './useYouTubePlayer'
import { useYouTubePlayer } from './useYouTubePlayer'
import type { Track } from './types'
import { thumbnailUrl } from './youtube'

interface Props {
  track: Track
  master: number
  onChange: (id: string, patch: Partial<Track>) => void
  onRemove: (id: string) => void
  register: (id: string, api: Pick<PlayerApi, 'play' | 'pause' | 'stop'> | null) => void
}

export default function TrackCard({ track, master, onChange, onRemove, register }: Props) {
  const { containerRef, ready, playing, error, play, pause } = useYouTubePlayer(
    {
      videoId: track.videoId,
      volume: track.volume,
      muted: track.muted,
      loop: track.loop,
      onTitle: (title) => { if (title !== track.title) onChange(track.id, { title }) },
    },
    master,
    register,
    track.id,
  )

  const disabled = !ready || !!error

  return (
    <li className="pop-in rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow">
      <div className="flex gap-3">
        <img src={thumbnailUrl(track.videoId)} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium" title={track.title}>{track.title}</h3>
          {error
            ? <p role="alert" className="text-sm text-rose-400">{error}</p>
            : <p className="text-sm text-slate-400">{!ready ? 'Loading player…' : playing ? 'Playing' : 'Paused'}</p>}
        </div>
        <button
          onClick={() => onRemove(track.id)}
          aria-label={`Remove ${track.title}`}
          className="h-10 w-10 shrink-0 rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
        >✕</button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={playing ? pause : play}
          disabled={disabled}
          aria-label={playing ? 'Pause' : 'Play'}
          className="h-11 w-11 shrink-0 rounded-full bg-indigo-500 transition active:scale-95 disabled:opacity-40"
        >{playing ? '❚❚' : '▶'}</button>
        <button
          onClick={() => onChange(track.id, { muted: !track.muted })}
          aria-pressed={track.muted}
          aria-label={track.muted ? 'Unmute' : 'Mute'}
          className={`h-11 w-11 shrink-0 rounded-full transition ${track.muted ? 'bg-rose-600' : 'bg-slate-800'}`}
        >{track.muted ? '🔇' : '🔊'}</button>
        <input
          type="range" min={0} max={100} value={track.volume}
          onChange={(e) => onChange(track.id, { volume: Number(e.target.value) })}
          aria-label="Volume" className="slider min-w-0 flex-1"
        />
        <span className="w-9 shrink-0 text-right text-sm tabular-nums">{track.volume}</span>
        <button
          onClick={() => onChange(track.id, { loop: !track.loop })}
          aria-pressed={track.loop} aria-label="Loop"
          className={`h-11 w-11 shrink-0 rounded-full transition ${track.loop ? 'bg-indigo-500' : 'bg-slate-800'}`}
        >🔁</button>
      </div>

      <div ref={containerRef} className="mt-2 h-0 w-0 overflow-hidden opacity-0 [&_iframe]:h-[90px] [&_iframe]:w-[160px]" aria-hidden />
    </li>
  )
}
