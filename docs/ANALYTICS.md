# Demo analytics

This is a booth demo, not a growth dashboard. We measure the ninety-second loop.

No accounts. No third-party pixel. No “telemetry” as a service — [`src/lib/telemetry.ts`](../src/lib/telemetry.ts) is **season math** (why a five projects 42 wins), not product analytics.

Product analytics live in [`src/lib/demo-funnel.ts`](../src/lib/demo-funnel.ts). Local. Foldable. Readable in Playwright as `window.__fbsDemo`.

## The funnel

| Beat | Player action | If this dies |
| --- | --- | --- |
| `home` | Desk loads | They never saw the pack. |
| `rip` | Rip the pack | CTA missed. |
| `room` | Franchise / era / luck landed | Spin failed. |
| `foil` | Tear the foil | Second rip confused them. |
| `lock` | Five names locked | Draft tax. |
| `card` | Number on the lithograph | Walk never finished. |
| `tray` | More ways to send | They opened the tray. |
| `save` | Save the card / Post to X | File or social. |
| `copy` | Copy the walk | URL is the certificate. |
| `open` | Open the walk | Revisit. Optional. |

`save` **or** `copy` is a **send**. That is the north star.

## What a game-demo expert actually watches

1. **Time to card.** Home → `card`. Target: under 90s. Reduced-motion eval should be well under 20s.
2. **Send rate.** Sessions with `card` that also hit `save` or `copy`. If they see the poster and bounce, the tray is the bug.
3. **Live ≠ house.** The walk id must not be the Thunder pin on a cold rip. Same franchise every time is a shuffle bug, not “brand.”
4. **Drop beat.** First missing beat in `home → rip → room → foil → lock → card → tray → send`. Fix that beat, not a new mode.
5. **Replay.** `rip` after `card` without a reload. One-tap “Pull again.”

Booth numbers that do not matter here: DAU, session length past two minutes, shop conversion, sign-up.

## How to read a session

In the browser console, after a pull:

```js
window.__fbsDemo.funnel
```

```
{
  order: ["home", "rip", "room", "foil", "lock", "card", "tray", "copy"],
  missing: ["save", "open"],
  toCardMs: 18000,
  toTrayMs: 21000,
  toSendMs: 24000,
  sent: true
}
```

Copy without Save still counts. The URL is the certificate.

## Honest host limits

Inside a nested preview, the host may swallow `<a download>`. Funnel will show `tray` and maybe `copy`, not `save`. That is the host, not a lying button. Test Save in a top-level tab.

## What we will not add

- Amplitude, GA, Mixpanel, or any off-device sink
- User ids
- Heatmaps that record the card

The studio file (`fbs.v1`) already keeps walks on-device. The demo log is a second, smaller file for the loop.
