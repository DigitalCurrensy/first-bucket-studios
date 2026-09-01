# Studio rooms

## Specialists

| Room | File | Job |
| --- | --- | --- |
| **Live pack** | `src/lib/nba.ts` `dealFrom` | Fisher–Yates on mulberry32. New franchise every pull. |
| **House pack** | `src/lib/house-pack.ts` | A table. Thunder 51–31. Never shuffle this. |
| **Walk** | `src/lib/walk.ts` | Certificate encode / decode. |
| **Stream-JSON** | `src/lib/stream-json.ts` | NDJSON eval pipe. Beats, walk, result. |
| **Season** | `src/lib/sim.ts` | 82 nights from five ids. |
| **Foil** | `src/components/foil-gl.tsx` | Small WebGL layer on the pack. CSS fallback. |
| **Lithograph** | `src/lib/share-card.ts` | 2D canvas PNG. Not WebGL. Night stock. |
| **Tray** | `src/components/file-tray.tsx` | Save / Copy / Open. Native `<a download>`. |
| **Plates** | `public/plates`, `src/lib/plates.ts` | Gym stills and initials. Not likenesses. |
| **Crests** | `public/emblems` | House marks. Not league marks. |

A good PR changes **one** room. Mixer + UI + new mode in one patch is three bugs.

## Themes

Night arena is the default. Light studio is the other.

| Theme | How |
| --- | --- |
| **Night arena** | `document.documentElement.dataset.theme` empty. Ink on night stock. |
| **Light studio** | `dataset.theme = "light"`. Paper desk. |

Toggle lives in the rail (“Night arena” / “Light studio”). Stored on the studio file as `theme`. Reduced motion (`prefers-reduced-motion: reduce`) skips the season ticker and shortens the foil tear. That is a theme of time, not of ink.

## Update flow

1. `git pull` on `main`.
2. `npm install` if `package-lock.json` moved.
3. `npm run test:pin` — house pin must stay green.
4. If you ship a walk format change, it is a **new prefix** (`v2.…`), never a silent rewrite of `v1`.
5. Studio file `VERSION` in `src/lib/studio-save.ts` goes up only with a `migrate()` branch.
6. Do not retune `freshEntropy` / `deriveSeed` / `mulberry32`. See [FORK.md](../FORK.md).

The house pin is the canary. If it changes, you did not “update.” You broke every certificate on The Wall.

## Performance

| Surface | Budget |
| --- | --- |
| First pack on screen | Instant. No auth gate. |
| Foil | One WebGL context. CSS foil if the context dies. |
| Share PNG | 2D canvas `toBlob`. Not the WebGL foil. |
| Season ticker | 110ms / night, 40ms if the book is long. Reduced-motion jumps to `onDone`. |
| Card file | Tens to low hundreds of KB. Night lithograph, not a photo dump. |

If the booth feels slow, look at click tax (foil should auto-turn the ten) and the ticker, not at adding a spinner.

## GitHub Action

[`.github/workflows/pin.yml`](../.github/workflows/pin.yml) runs `npm run test:pin` and `npm run test:vl` on push and pull request. Demo eval stays local because it needs a running studio.

## Demo evals

See [TESTING.md](TESTING.md). The eval that matters: live pack ≠ house pin, tray opens, card beat fires, Stream-JSON `result.ok` is true.
