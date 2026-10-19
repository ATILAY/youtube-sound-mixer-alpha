import { useState } from 'react'

interface Props {
  onAdd: (input: string) => string | null
}

export default function AddLinkForm({ onAdd }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = onAdd(value)
    setError(err)
    if (!err) setValue('')
  }

  return (
    <form onSubmit={submit} className="space-y-2" noValidate>
      <div className="flex gap-2">
        <input
          type="url"
          inputMode="url"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null) }}
          placeholder="Paste a YouTube link…"
          aria-label="YouTube link"
          aria-invalid={!!error}
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
        />
        <button type="submit" className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400 active:scale-95">
          Add
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
    </form>
  )
}
