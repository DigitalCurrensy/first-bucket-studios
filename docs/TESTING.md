# E2E testing

The product is a ninety-second loop. Tests exist to keep that loop honest.

There is no staging account. There is no fake toast. A test that cannot fail is not a test.

## The four layers

| Layer | What it proves | Command |
| --- | --- | --- |
| **1. Pin** | House Thunder 51–31 never moves. Mixer still mulberry32. Walks still decode. | `npm run test:pin` |
| **2. Funnel** | Beats fold in order. Save or copy counts as a send. | included in `test:pin` |
| **3. Demo eval** | Playwright rips a **live** pack, not the house pin, and opens the tray. | `npm run test:demo` |
| **4. Stills** | The README pictures still match the loop. | `npm run capture` |

GitHub Action runs layer 1 on every push. Layers 3–4 need the studio running.

## Layer 1 — the pin

[`src/lib/house-pack.test.ts`](../src/lib/house-pack.test.ts) is a lock, not a vibe check.

```
v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

If this goes red, you retuned the mixer or the house table. Revert. Do not “fix” the test.

Walk tests prove `encodeWalk` / `decodeWalk` round-trip, and that sandbox hosts are not burned into a pasteable URL.

## Layer 2 — the funnel

[`src/lib/demo-funnel.ts`](../src/lib/demo-funnel.ts) records beats on this device (`localStorage fbs.demo`). Nothing is sent off-machine.

A full home-to-send order:

```
home → rip → room → foil → lock → card → tray → save|copy
```

Open is optional. Missing `save` and `copy` means the person saw the card and left — that is the drop-off that kills a booth demo.

Playwright reads `window.__fbsDemo`.

## Layer 3 — demo eval

Studio must already be running.

```bash
npm run test:demo
```

It will fail if:

- the landed walk is the house Thunder pin (live packs must shuffle)
- the tray never opens
- the card beat never fires
- the loop takes more than two minutes with reduced motion

This is the game-demo eval. Not a coverage number.

## Layer 4 — stills

```bash
npm run capture
```

Rewrites `docs/stills/01-home.jpg` … `04-tray.jpg` and `docs/tape/demo.mp4`. Commit them with the loop change they describe.

## What we do not test

- Fake downloads. Save is a native `<a download>`.
- League licenses. [NOTICE](../NOTICE) is the legal file, not a unit test.
- Auth. Auth is off.
- Shop. There is no shop.

## Filing a bug from a failed loop

See [SUPPORT.md](../SUPPORT.md). Include the walk URL, browser, and whether you were in a nested preview.
