# YouTube Sound Mixer

Play the audio of several YouTube videos at once and control each one's volume separately.
Built with React + TypeScript + Tailwind (Vite). No backend. Audio is played only through the
official YouTube IFrame Player API (one player per track, `setVolume()`); nothing is downloaded,
extracted or proxied.

## Setup

```bash
npm install
npm run dev      # development server
npm run build    # type-check + production build
npm test         # unit tests (URL parsing)
```

## Structure

```
src/
  App.tsx             layout: form on top, tracks in the middle, master controls at the bottom
  AddLinkForm.tsx     link input + validation errors
  TrackCard.tsx       thumbnail, title, play/pause, volume, mute, loop, remove, per-card error
  MasterControls.tsx  Play/Pause/Stop All, master volume, Clear all, presets
  useYouTubePlayer.ts IFrame API loader + one player per track (effective volume = track x master / 100)
  useTracks.ts        track state, localStorage persistence, duplicate/cap checks, presets
  youtube.ts          URL parsing (watch, youtu.be, shorts, embed, live), error messages
```

## Features

- Add watch / youtu.be / shorts / embed links; invalid, duplicate links and a cap of 8 tracks give friendly errors.
- Unavailable or embed-disabled videos show a clear error on their card.
- Playback only starts on a user click (autoplay restrictions).
- Tracks, volumes, mute/loop state, master volume and presets persist in localStorage.
- Players stay in the DOM in a hidden 0x0 container so playback works.

## Known limitations

- Mobile browsers (especially iOS Safari) may refuse simultaneous playback or pause audio when the tab is backgrounded or the screen locks.
- Some videos cannot be embedded; they show an error.
- Volume changes on iOS may be ignored by the system player.
- Titles are read from the player after load, so they show "Loading…" briefly.
