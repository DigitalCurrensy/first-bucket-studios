# Benchmarks

Two benches. Neither is a leaderboard.

## 1. Pin (mixer)

House Thunder 51–31, same five, same nights.

```
v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

`npm run test:pin` — GitHub Action on every push. If this goes red you retuned the mixer. Revert.

Live packs must **not** collapse to that id. That assert lives in `npm run test:demo`.

## 2. Visual loop (VL)

Not [VLMEvalKit](https://github.com/open-compass/VLMEvalKit). Not MMBench, MMMU, or VQA. Those score **vision-language models** answering questions about images.

This studio is a **game**. VL here means **visual loop**: home, foil, card, tray, tape.

```bash
npm run test:vl
```

| Check | Pass |
| --- | --- |
| Four stills exist | JPEG, over a size floor |
| Tape exists | `docs/tape/demo.mp4`, `ftyp` |
| Night stock | Mean luminance Y < 80 (ffmpeg, when present) |

Cream paper on the card fails. A 1×1 downscale of `03-result.jpg` should sit around Y 20, not Y 200.

Stills are in `docs/stills`. Recapture with `npm run capture` if the face of the loop changed.

## What we will not add

- VLMEvalKit / `run.py` / 80 multimodal datasets
- Pixel-diff of live packs (every pull is a new franchise)
- Off-device scoring

Funnel budgets (card in under 90s, a send after the tray) live in [ANALYTICS.md](ANALYTICS.md) and [TESTING.md](TESTING.md).
