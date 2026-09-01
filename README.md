# First Bucket Studios

**Rip a pack. Five names. Eighty-two nights. Send the card.**

Basketball pack · NBA · WNBA · sports cards · holographic foil · WebGL · 82-0

A browser basketball pack you can fork. Not a shop. Not a sportsbook. Not the NBA.

**Live booth:** [first-bucket-studios.vercel.app](https://first-bucket-studios.vercel.app)  
(GitHub stays private. Domain later.)

[Play](HOW-TO-PLAY.md) · [Install](#install) · [Contribute](CONTRIBUTING.md) · [MIT](LICENSE)

Private: [github.com/DigitalCurrensy/first-bucket-studios](https://github.com/DigitalCurrensy/first-bucket-studios)  
(log in as DigitalCurrensy — not the older `first-bucket-studio`, no *s*)

---

## Play

Ninety seconds. [HOW-TO-PLAY.md](HOW-TO-PLAY.md) is the sheet.

**1. Rip the pack.** A franchise, an era, and a luck lane land. No two pulls match.

![Home](docs/stills/01-home.jpg)

**2. Tear the foil.** Ten cards. Tap five.

![Foil](docs/stills/02-foil.jpg)

**3. Lock five.** The season walks. The number on the card is that walk.

![The card](docs/stills/03-result.jpg)

**4. Send the card.** Save the PNG. Share it. Pin it if you want it on the rail.

![Send](docs/stills/04-tray.jpg)

Tape: [docs/tape/demo.mp4](docs/tape/demo.mp4)

| You click | What it does |
| --- | --- |
| **Rip the pack** | New room. New ten. |
| **Lock five** | 82 nights from those names. |
| **Save the card** | `first-bucket-{team}-{wins}.png` |
| **Share** | System share sheet, or the tray on desktop. |
| **Pin this walk** | Keeps it on the rail. Nothing is pinned until you pin it. |
| **X / TikTok / Snapchat / Reddit / Discord** | In the share tray. |
| **Copy the walk** | Public `/walk/v1.…` — paste it anywhere. |
| **Open the walk** | Same five, same nights, forever. |

There is no “copy image.” The file is the card. The URL is the walk.

The pinned walk (optional) is Thunder 51–31. The door is the live pack.

```
/walk/v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

---

## Install

Node 22. Auth off. Database unused.

```bash
git clone https://github.com/DigitalCurrensy/first-bucket-studios.git
cd first-bucket-studios
npm install
npm run dev
```

Then rip. If Save is swallowed, you are in a nested preview — open a top-level tab.

```bash
npm run test:pin    # mixer lock + walk + stream-json
npm run test:vl     # stills + tape are night stock
npm run test:demo   # live pack, studio already running
```

The house pin must stay green. That is the lock test.

---

## Documentation

| Doc | What it is |
| --- | --- |
| [HOW-TO-PLAY.md](HOW-TO-PLAY.md) | The ninety seconds |
| [docs/TESTING.md](docs/TESTING.md) | E2E layers |
| [docs/STREAM-JSON.md](docs/STREAM-JSON.md) | NDJSON eval pipe |
| [docs/BENCHMARKS.md](docs/BENCHMARKS.md) | Pin + visual loop (not VLMEvalKit) |
| [docs/ANALYTICS.md](docs/ANALYTICS.md) | Booth funnel. Local. |
| [docs/WALK.md](docs/WALK.md) | Walk certificate |
| [docs/STUDIO.md](docs/STUDIO.md) | Rooms, themes, updates, performance |
| [FORK.md](FORK.md) | Copy the loop. Swap the sport. |
| [NOTICE](NOTICE) | MIT is the code, not the names |
| [SUPPORT.md](SUPPORT.md) | How to ask |
| [SECURITY.md](SECURITY.md) | How to report a hole |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to land a patch |

**Update flow.** `git pull` → `npm install` if the lockfile moved → `npm run test:pin`. Walk `v1` is frozen. Mixer does not move.

**Themes.** Night arena (default) or light studio. Rail toggle. Reduced motion skips the ticker.

**Stream-JSON.** One object per line on stdout from `npm run test:demo`. Beats, then a walk, then a result. Same *pipe* as Claude’s stream-json. Different *types*. [docs/STREAM-JSON.md](docs/STREAM-JSON.md).

**Specialists.** Live pack, house pack, walk, foil, lithograph, tray, plates. One room per PR.

**GitHub Action.** [`.github/workflows/pin.yml`](.github/workflows/pin.yml) runs `test:pin` and `test:vl` on every push.

**Benchmarks.** Pin = Thunder 51–31. Visual loop = stills stay night stock (Y < 80). We do not run MMBench. [docs/BENCHMARKS.md](docs/BENCHMARKS.md).

---

## Community

Talk happens in **[GitHub Discussions](https://github.com/DigitalCurrensy/first-bucket-studios/discussions)**. There is no Discord.

| Category | Use it for |
| --- | --- |
| **Q&A** | Setup, Save / Copy / Open, “how do I” |
| **Ideas** | Proposals before any PR |
| **Show and tell** | Forks, other sports, stills |
| **Announcements** | Releases from the maintainers |

For a good Q&A answer fast, include the walk URL if you have one, your OS and browser, how you ran it, and whether Save was in a top-level tab or a nested preview. See [SUPPORT.md](SUPPORT.md). Bugs belong in issues. Security reports follow [SECURITY.md](SECURITY.md), never a public thread.

---

## Contributing

You are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), run `npm run test:pin`, open a focused pull request.

Do not retune the mixer. Do not paste league marks. Leave `public/__grok/` in place.

---

## License

[MIT](LICENSE). Invite the rip — [FORK.md](FORK.md).

Read [NOTICE](NOTICE) before you ship a fork with names on it. Plates, initials, and house crests are mitigations. They are not a license.

Built with Grok. Leave `public/__grok/` in place.
