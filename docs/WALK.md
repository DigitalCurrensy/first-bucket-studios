# Walk certificate

This is the studio’s wire format. Not a streaming JSON RPC. A walk URL **is** the save file.

Nights recompute from ids. There is no replay blob.

## Shape

```
/walk/v1.{ABBR}.{era}.{luck}.{wins}.{id~id~id~id~id}
```

Example (house pin):

```
/walk/v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga
```

| Field | Meaning |
| --- | --- |
| `v1` | Season-82 certificate. Frozen. |
| `ABBR` | Club code (`OKC`, `HOU`, `WAS`, …) |
| `era` | Slug of the era (`positionless`, `04-defense`) |
| `luck` | Slug of the luck lane (`even`, `grit`, `hot`) |
| `wins` | Nights won. Recomputed, then stored so the lithograph matches. |
| `ids` | Five player tokens, sorted, joined with `~` |

Other kinds:

| Prefix | Loop |
| --- | --- |
| `v1.…` | Season 82 (the door) |
| `v2.goat.{wins}.{ids}` | All-time five |
| `v2.playoff.{ABBR}.{era}.{luck}.{wins}.{ids}` | Sixteen |
| `v2.wnba.{ABBR}.{era}.{luck}.{wins}.{ids}` | Forty nights |

Encode / decode: [`src/lib/walk.ts`](../src/lib/walk.ts).

## Paste rules

- On a public host, `walkUrl` may prefix the origin.
- On localhost or a sandbox host, it returns the **path only**. Never burn a preview origin into a certificate someone else cannot open.
- `decodeWalk` must round-trip the house pin.

## Studio file (JSON)

The desk itself is `localStorage` key `fbs.v1` — theme, runs, walks, streak. Export from About. Versioned; `migrate()` fills new fields. This is the JSON you copy when the desk should travel. It is not the walk.

Demo funnel is a separate key, `fbs.demo`. See [ANALYTICS.md](ANALYTICS.md).

## Do not

- Swap mulberry32. Existing walks would lie.
- Put secrets in a walk. Walks are public.
- Treat the PNG as the certificate. The PNG is the lithograph. The URL is the lock.
