export const MAX_TRACKS = 8

const ID_RE = /^[A-Za-z0-9_-]{11}$/

/** Extracts a video ID from watch, youtu.be, shorts, embed, live or bare-ID inputs. */
export function parseYouTubeId(input: string): string | null {
  const text = input.trim()
  if (!text) return null
  if (ID_RE.test(text)) return text
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  let id: string | null = null
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'watch') id = url.searchParams.get('v')
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) id = parts[1] ?? null
  }
  return id && ID_RE.test(id) ? id : null
}

export function thumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
}

export function errorMessage(code: number): string {
  switch (code) {
    case 2: return 'Invalid video ID.'
    case 5: return 'This video cannot be played in an embedded player.'
    case 100: return 'Video not found, removed or private.'
    case 101:
    case 150: return 'The owner has disabled embedding for this video.'
    default: return 'This video could not be loaded.'
  }
}
