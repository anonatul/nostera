# afterimage

> some memories never leave.

A single-page, fullscreen ambient memory wall. Press anywhere, and five slow streams of
half-remembered photographs drift past a quiet centerline while a soft room-tone fades in.

Built with React, Vite, CSS and a small amount of Framer Motion. No backend, no routes, no
database, no tracking.

## Run it

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## What is here

```text
src/
├── components/
│   ├── Intro.jsx
│   ├── MemoryWall.jsx
│   ├── ImageRow.jsx
│   ├── CenterStage.jsx
│   ├── Controls.jsx
│   └── AmbientAudio.jsx
├── data/
│   └── memories.js
├── App.jsx
└── index.css
public/
├── images/          local, licensed photography
└── audio/           optional ambient.mp3
```

The experience is intentionally one viewport, one page. There is nothing to scroll through
and nowhere else to go.

## Replacing the photographs

All wall imagery is local and data-driven. Drop new files into `public/images`, then update
`src/data/memories.js`:

```js
{
  file: "2000s-01.webp",
  alt: "A CRT television glowing in a childhood bedroom.",
  ratio: 1.5,       // frame width / height
  soft: false,      // extra distance and blur
  focus: "50% 50%"  // object-position
}
```

Each collection holds nine frames. The wall repeats and reorders them automatically, so a
collection can be swapped without touching any component.

Photography currently comes from [Pexels](https://www.pexels.com/license/) and is credited
in [`IMAGE_CREDITS.md`](./IMAGE_CREDITS.md). Replace it with your own archive whenever you
like.

## Audio

The experience ships with a quiet, procedurally generated room tone: filtered rain/hiss, a
low CRT hum, a distant warm drone, and a little tape crackle. It starts only after the first
interaction, obeys the sound toggle, and fades in and out.

To use a real recording instead, add a file at:

```text
public/audio/ambient.mp3
```

If that file exists, it is used automatically. If it does not, the procedural room tone
takes over. Nothing breaks either way.

## Details

- Five overlapping rows, each with its own direction, drift speed, height, opacity and
  vertical offset.
- Seamless CSS-transform marquees. No layout thrash, no scroll listeners.
- Subtle pointer parallax on desktop, disabled for touch and reduced-motion visitors.
- Responsive down to one column and three rows on phones.
- `prefers-reduced-motion` pauses the wall and removes decorative movement.
- Keyboard support on the intro and controls.
