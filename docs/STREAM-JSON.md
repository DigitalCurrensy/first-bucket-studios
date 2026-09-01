# Stream-JSON

One JSON object per line on stdout. Same *shape of pipe* as Claude Code’s `--output-format stream-json`. Different *types*. This is the ninety-second loop, not an MCP agent.

NDJSON. Flush every line. No pretty indent. `jq` can eat it.

## Why a stream

`npm run test:demo` used to dump one blob at the end. A booth, a CI job, or a wrapper wants beats *as they land*.

```bash
npm run test:demo | jq -c 'select(.type=="result")'
```

## Lines

| `type` | When | Fields |
| --- | --- | --- |
| `system` | Start | `subtype: "init"`, `studio: "first-bucket"`, `version: 1`, `at` |
| `beat` | First hit of a funnel beat | `beat`, `ms`, optional `note` |
| `walk` | Certificate known | `id`, `live` (false = house pin) |
| `result` | End | `ok`, `ms`, `walk`, `funnel`, optional `error` |

Beats: `home` `rip` `room` `foil` `lock` `card` `tray` `save` `copy` `open`.

Example:

```
{"type":"system","subtype":"init","version":1,"studio":"first-bucket","at":1788300094231}
{"type":"beat","beat":"home","ms":0}
{"type":"beat","beat":"rip","ms":400}
{"type":"beat","beat":"card","ms":7000,"note":"v1.LAC.04-defense.even.17.…"}
{"type":"walk","id":"v1.LAC.04-defense.even.17.…","live":true}
{"type":"result","ok":true,"ms":8200,"walk":"/walk/v1.LAC.…","funnel":{"sent":true}}
```

`live: false` means the eval collapsed to the house Thunder pin. That is a fail.

## Not Claude’s protocol

| Claude stream-json | This studio |
| --- | --- |
| `assistant` / `user` / `stream` deltas | `beat` |
| `control` + MCP tools | none |
| `result.total_cost_usd` | `result.ms` + `funnel` |
| `--verbose` required | always on |
| Bidirectional stdin | stdout only |

We borrowed the **pipe**, not the **agent**. Encode / decode: [`src/lib/stream-json.ts`](../src/lib/stream-json.ts).

Foreign lines (`assistant`, another `studio`) fail closed.

## Walk certificate

The walk **id** inside a `walk` line is still:

```
v1.{ABBR}.{era}.{luck}.{wins}.{id~id~id~id~id}
```

That URL is the save file. Stream-JSON is how the *eval* talks. See [WALK.md](WALK.md).
