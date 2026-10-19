import { useCallback, useRef } from 'react'
import AddLinkForm from './AddLinkForm'
import MasterControls from './MasterControls'
import TrackCard from './TrackCard'
import { useTracks } from './useTracks'
import type { PlayerApi } from './useYouTubePlayer'
import { MAX_TRACKS } from './youtube'

type Ctl = Pick<PlayerApi, 'play' | 'pause' | 'stop'>

export default function App() {
  const t = useTracks()
  const players = useRef(new Map<string, Ctl>())
  const register = useCallback((id: string, api: Ctl | null) => {
    if (api) players.current.set(id, api)
    else players.current.delete(id)
  }, [])
  const all = (fn: keyof Ctl) => () => players.current.forEach((p) => p[fn]())

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <header className="space-y-3 p-4">
        <h1 className="text-xl font-bold">YouTube Sound Mixer</h1>
        <AddLinkForm onAdd={t.add} />
        <p className="text-xs text-slate-500">{t.tracks.length}/{MAX_TRACKS} tracks</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {t.tracks.length === 0 ? (
          <div className="mt-16 text-center text-slate-400">
            <div className="text-5xl">🎧</div>
            <p className="mt-3 text-lg">Paste a YouTube link to start mixing</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {t.tracks.map((tr) => (
              <TrackCard
                key={tr.id} track={tr} master={t.master}
                onChange={t.update} onRemove={t.remove} register={register}
              />
            ))}
          </ul>
        )}
      </main>

      <div className="-mx-0">
        <MasterControls
          master={t.master} onMaster={t.setMaster} trackCount={t.tracks.length}
          onPlayAll={all('play')} onPauseAll={all('pause')} onStopAll={all('stop')} onClear={t.clear}
          presets={t.presets} onSavePreset={t.savePreset} onLoadPreset={t.loadPreset} onDeletePreset={t.deletePreset}
        />
      </div>
    </div>
  )
}
