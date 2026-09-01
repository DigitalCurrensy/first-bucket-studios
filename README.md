# First Bucket Studios

**Rip a pack. Five names. Eighty-two nights. Send the card.**

Private repo (log in as DigitalCurrensy):

**https://github.com/DigitalCurrensy/first-bucket-studios**

Not the older `first-bucket-studio` (no *s*). This one.

A browser basketball pack. Not a shop. Not a sportsbook. Not the NBA.

[MIT](LICENSE) · [How to play](HOW-TO-PLAY.md) · [Fork the loop](FORK.md)

---

## How to play

About ninety seconds. Full sheet: [HOW-TO-PLAY.md](HOW-TO-PLAY.md).

**1. Rip the pack.** A franchise, an era, and a luck lane land. No two pulls match.

![Home](docs/stills/01-home.jpg)

**2. Tear the foil.** Ten cards. Tap five.

![Foil](docs/stills/02-foil.jpg)

**3. Lock five.** The season walks. The number on the card is that walk.

![The card](docs/stills/03-result.jpg)

**4. Send the card.** Save the PNG. Copy the walk. The URL is the certificate.

![Send](docs/stills/04-tray.jpg)

Tape of one pull: [docs/tape/demo.mp4](docs/tape/demo.mp4)

### The buttons

| You click | What it does |
| --- | --- |
| **Rip the pack** | Deals a new room. New ten. |
| **Lock five** | Walks 82 nights from those names. |
| **Send the card** | Opens the tray. |
| **Save the card** | Downloads `first-bucket-{team}-{wins}.png`. |
| **Copy the walk** | Copies `/walk/v1.…` — paste it anywhere. |
| **Open the walk** | Same five, same nights, forever. |

There is no “copy image.” The file is the card. The URL is the walk.

### House job (optional)

Thunder · Positionless · Even is pinned as a known certificate:

```
/walk/v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

51–31. Playoff lock. Same five every time. It hangs on The Wall. The main pack is live.

---

## What this is

A single loop you can fork.

- **Live packs** shuffle (Fisher–Yates + mulberry32). New franchise, new ten, new walk.
- **House pack** is a table, not a shuffle. [`src/lib/house-pack.ts`](src/lib/house-pack.ts).
- Nights recompute from ids. The walk URL is the certificate, not a replay file.
- Saves live on this device. Export a studio file if you want the desk to travel.

## What this is not

| It is not | Why |
| --- | --- |
| A company | No shop. No raise. No accounts. |
| An NBA product | [NOTICE](NOTICE). MIT is the code, not the names. |
| A sportsbook | Games and tools only. |
| A sports-card marketplace | One pack. One PNG. One URL. |

## Run it

```bash
npm install
npm run dev
```

Node 22. Auth off. Database unused.

```bash
npm run typecheck
node --experimental-strip-types --test src/lib/house-pack.test.ts src/lib/nba.test.ts src/lib/walk.test.ts
```

The house pin must stay green:

```
v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

## Stack

TanStack Start · React 19 · Tailwind v4. Foil is a small WebGL layer. Share is the Web Share API with a file tray fallback.

## Legal

Read [NOTICE](NOTICE) before you ship a fork with names on it.

Plates, initials, and house crests are mitigations. They are not a license.

Built with Grok. Leave `public/__grok/` in place.

## License

[MIT](LICENSE). Invite the rip — [FORK.md](FORK.md).
