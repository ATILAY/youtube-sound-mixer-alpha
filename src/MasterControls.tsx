import { useState } from 'react'
import type { Preset } from './types'

interface Props {
  master: number
  onMaster: (v: number) => void
  onPlayAll: () => void
  onPauseAll: () => void
  onStopAll: () => void
  onClear: () => void
  trackCount: number
  presets: Preset[]
  onSavePreset: (name: string) => void
  onLoadPreset: (name: string) => void
  onDeletePreset: (name: string) => void
}

const btn = 'rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-40'

export default function MasterControls(p: Props) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState('')
  const empty = p.trackCount === 0

  return (
    <section className="border-t border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur" aria-label="Master controls">
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Master</span>
          <input
            type="range" min={0} max={100} value={p.master}
            onChange={(e) => p.onMaster(Number(e.target.value))}
            aria-label="Master volume" className="slider flex-1"
          />
          <span className="w-9 text-right text-sm tabular-nums">{p.master}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button className={`${btn} bg-indigo-500`} disabled={empty} onClick={p.onPlayAll}>Play All</button>
          <button className={`${btn} bg-slate-700`} disabled={empty} onClick={p.onPauseAll}>Pause All</button>
          <button className={`${btn} bg-slate-700`} disabled={empty} onClick={p.onStopAll}>Stop All</button>
          <button className={`${btn} bg-rose-700`} disabled={empty} onClick={p.onClear}>Clear all</button>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-slate-400">Presets</summary>
          <div className="mt-2 space-y-2">
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); p.onSavePreset(name); setName('') }}>
              <input
                value={name} onChange={(e) => setName(e.target.value)} placeholder="Rain + Lo-fi + Cafe"
                aria-label="Preset name"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
              <button className={`${btn} bg-slate-700`} disabled={empty || !name.trim()}>Save</button>
            </form>
            {p.presets.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Saved presets"
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="">Choose preset…</option>
                  {p.presets.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}
                </select>
                <button className={`${btn} bg-slate-700`} disabled={!selected} onClick={() => p.onLoadPreset(selected)}>Load</button>
                <button
                  className={`${btn} bg-slate-700`} disabled={!selected}
                  onClick={() => { p.onDeletePreset(selected); setSelected('') }}
                >Delete</button>
              </div>
            )}
          </div>
        </details>
      </div>
    </section>
  )
}
