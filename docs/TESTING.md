# E2E testing

The product is a ninety-second loop. Tests exist to keep that loop honest.

There is no staging account. There is no fake toast. A test that cannot fail is not a test.

## The layers

| Layer | What it proves | Command |
| --- | --- | --- |
| **1. Pin** | House Thunder 51–31 never moves. Mixer still mulberry32. Walks still decode. Stream-JSON round-trips. Foil stays compositor-synced. | `npm run test:pin` |
| **2. Funnel** | Beats fold in order. Save or copy counts as a send. | included in `test:pin` |
| **3. Visual loop** | Stills + tape exist. Card is night stock, not cream paper. | `npm run test:vl` |
| **4. Demo eval** | Playwright rips a **live** pack, not the house pin, and opens the tray. Prints Stream-JSON. | `npm run test:demo` |
| **5. Stills** | README pictures still match the loop. | `npm run capture` |

GitHub Action **Pin** runs layers 1 and 3 on every push to `main`. Layer 4 needs the studio running.

## What a live demo needs

| Piece | Status | Notes |
| --- | --- | --- |
| Home pack | Ready | Night stock + emblem. CSS hologram in a nested preview. |
| Live 82-0 pack | Ready | Random franchise. Tear. Ten plates. Not Thunder every time. |
| Player cards | Ready | One 5×7 face. Night plate. Pick five. Court back only when face-down. |
| House pin | Ready | Thunder 51–31, same walk every time. Optional. |
| Send PNG | Ready in a top-level tab | **Save the card** is a real `<a download>`. **Share** is Web Share, then the tray. |
| Social | Ready | X, Threads, Reddit, Facebook, TikTok, Snapchat, Discord. |
| Pins | Ready | Empty until the user pins. Thunder is not auto-pinned. |
| Pin tests | Must stay green | `npm run test:pin` then `npm run test:vl` |
| Public URL | Ready | [first-bucket-studios.vercel.app](https://first-bucket-studios.vercel.app). GitHub stays private. Domain later. |

### Host limits (not product bugs)

- **Save inside this nested preview** can be swallowed by the host. Open the live booth, then Save.
- **WebGL foil** stays off in a host iframe / sandbox so the pack is never a white rectangle. CSS hologram is the foil here. The live booth gets GL.

### Still missing for a named booth

1. A custom domain. The live URL is `first-bucket-studios.vercel.app` until you buy one.
2. One rip, not two. Home poster then 82-0 foil is the current door.
3. Save must be tested in a **top-level** tab (the live booth). Nested preview cannot prove the download.

Do not ship a cream pack, a Thunder-only live pull, stacked card faces, or a tray that toasts instead of saving.


## Layer 1 — the pin

[`src/lib/house-pack.test.ts`](../src/lib/house-pack.test.ts) is a lock, not a vibe check.

```
v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

If this goes red, you retuned the mixer or the house table. Revert. Do not “fix” the test.

## Layer 2 — the funnel

[`src/lib/demo-funnel.ts`](../src/lib/demo-funnel.ts) records beats on this device (`localStorage fbs.demo`). Nothing is sent off-machine.

```
home → rip → room → foil → lock → card → tray → save|copy
```

Playwright reads `window.__fbsDemo`. The eval *prints* those beats as [Stream-JSON](STREAM-JSON.md).

## Layer 3 — visual loop

[`scripts/vl-bench.mjs`](../scripts/vl-bench.mjs). JPEG stills, mp4 tape, mean luminance Y < 80 when ffmpeg is around. Cream paper fails. See [BENCHMARKS.md](BENCHMARKS.md).

## Layer 4 — demo eval

Studio must already be running.

```bash
npm run test:demo | jq -c 'select(.type=="result")'
```

It will fail if:

- the landed walk is the house Thunder pin
- the tray never opens
- the card beat never fires
- nobody saves or copies
- the loop takes more than two minutes with reduced motion

## Layer 5 — stills

```bash
npm run capture
```

Rewrites `docs/stills/01-home.jpg` … `04-tray.jpg` and `docs/tape/demo.mp4`. Commit them with the loop change they describe. Then `npm run test:vl`.

## What we do not test

- Fake downloads. Save is a native `<a download>`.
- League licenses. [NOTICE](../NOTICE) is the legal file.
- Auth. Auth is off.
- Shop. There is no shop.
- VLMEvalKit / MMBench. Those score language models, not this pack.

## Filing a bug from a failed loop

See [SUPPORT.md](../SUPPORT.md). Include the walk URL, browser, and whether you were in a nested preview.
