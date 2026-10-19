import { describe, expect, it } from 'vitest'
import { parseYouTubeId } from './youtube'

describe('parseYouTubeId', () => {
  const id = 'dQw4w9WgXcQ'
  it.each([
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?t=3`,
    `https://youtube.com/shorts/${id}`,
    `https://m.youtube.com/watch?feature=x&v=${id}`,
    `youtube.com/embed/${id}`,
    id,
  ])('parses %s', (u) => expect(parseYouTubeId(u)).toBe(id))
  it.each(['', 'hello', 'https://example.com/watch?v=dQw4w9WgXcQ', 'https://youtube.com/watch?v=short'])(
    'rejects %s',
    (u) => expect(parseYouTubeId(u)).toBeNull(),
  )
})
