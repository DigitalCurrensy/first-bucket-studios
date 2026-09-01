# Fork it

The loop is the thing. Copy it. Swap the sport. Keep it under two minutes.

This is how [2048](https://github.com/gabrielecirulli/2048) survived 17k forks: the original stayed the citation. Same idea as [Nicky Case’s explorables](https://ncase.me/) — public, playable, copies linked back.

## Two rooms

**Live packs** (the door): [`dealFrom`](src/lib/nba.ts) is Fisher–Yates on mulberry32. A pull lands a franchise, an era, and a luck lane. Ten face-down. Five you lock. Nights recompute from ids. The walk URL is the certificate.

**House pack** (the pin): [`src/lib/house-pack.ts`](src/lib/house-pack.ts) is a table, not a shuffle.

| Pin | Value |
| --- | --- |
| Room | Thunder · Positionless · Even |
| Ten | sga, jalenw, chet, dort, hartenstein, caruso, cason, og, herb, mcdaniels |
| Five | sga, jalenw, chet, dort, hartenstein |
| Walk | `v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga` |
| Record | 51–31 |

`walkHouse()` always returns that certificate. Do not retune it.

## Do not retune the mixer

```
freshEntropy  →  64-bit CSPRNG, padded to 16 hex
deriveSeed    →  xmur3 fold to uint32
mulberry32    →  the stream
streamRng     →  independent lanes off one key (`pull:`, `five:`)
hashSeed      →  FNV-1a, plates only, not a PRNG
```

If you swap mulberry32 for SplitMix32, or change the increment, or “improve” `deriveSeed`, every existing walk URL lies. The house pin above is a lock test in [`src/lib/house-pack.test.ts`](src/lib/house-pack.test.ts). Leave it red if you touch the mixer.

SplitMix32 is a better 32-bit counter. We kept mulberry32 on purpose. The certificate is the product.

## Swap the sport

1. Replace the book in `src/lib/book-current.ts` (names, positions, a few rates).
2. Keep `dealFrom` + `encodeWalk`. The URL shape stays.
3. Draw your own crests into `public/emblems`. Do not paste league marks.
4. Point the README live link at your build.

## Legal

[NOTICE](NOTICE) first. MIT is the code. MIT is not a league license. Plates and initials, not likenesses.
