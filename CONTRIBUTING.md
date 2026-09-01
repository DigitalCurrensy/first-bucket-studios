# Contributing

You are welcome here. The loop is small. Keep the patch small.

Read [NOTICE](NOTICE) first if your change touches names, crests, or plates.

## Before you write code

1. Play it. [HOW-TO-PLAY.md](HOW-TO-PLAY.md). Ninety seconds.
2. If it is an idea, not a bug: open a **Discussion** (Ideas) before a PR.
3. If it is a bug: open an issue with the walk URL and the browser. [SUPPORT.md](SUPPORT.md).

## First-time map

| You want to… | Start here |
| --- | --- |
| Copy the loop into another sport | [FORK.md](FORK.md) |
| Fix copy, stills, or how-to | `HOW-TO-PLAY.md`, `docs/stills` |
| Touch the mixer / house pin | Stop. See “Do not” below. |
| Change foil, tray, or the card | One of those rooms. [docs/STUDIO.md](docs/STUDIO.md) |
| Add a test | [docs/TESTING.md](docs/TESTING.md) |

## Run it

```bash
npm install
npm run dev
npm run test:pin
```

Node 22. Auth off. Database unused.

House pin must stay green:

```
v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

## Pull requests

- One room per PR. Mixer + UI + a new mode is three PRs.
- Title the loop, not the ticket. “Tray copies the walk” beats “fix share.”
- Run `npm run test:pin`.
- If the face of the loop changed, run `npm run capture` and commit stills + tape.
- Leave `public/__grok/` alone.
- Do not add a shop, accounts, or a tracker that leaves the device.

Use the PR template. Check the pin box.

## Do not

- Retune `mulberry32`, `deriveSeed`, or the house table so the pin “looks better.”
- Paste league marks into `public/emblems`.
- Swap plates for likenesses.
- Fake a download, a share, or a restriction.
- Make every pull Thunder 51.

## Tone

Be decent. Names in the book are game tokens, not targets. No harassment, no bigotry, no “gotcha” PRs that break the pin on purpose.

Security reports: [SECURITY.md](SECURITY.md), not a public issue.
