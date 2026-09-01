#!/usr/bin/env python3
"""Knock magenta (or near-black) from emblem JPGs into tight transparent PNGs."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path("/workspace/public/emblems")
SRC = Path("/workspace/artifacts/imagine_images")
OUT.mkdir(parents=True, exist_ok=True)


def knock_magenta(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA")).astype(np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    mag = (r > 140) & (b > 140) & (g < 170) & ((r + b) > (g * 1.65 + 70))
    a[mag] = 0
    fringe = (r > 100) & (b > 100) & (g < 190) & ((r + b) > (g * 1.4 + 30)) & ~mag
    dist = np.clip((g - 30) / 90.0, 0, 1)
    a[fringe] *= dist[fringe]
    arr[:, :, 3] = a
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def knock_dark(im: Image.Image, thresh: float = 38) -> Image.Image:
    arr = np.array(im.convert("RGBA")).astype(np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sat = arr[:, :, :3].max(axis=2) - arr[:, :, :3].min(axis=2)
    dark = (lum < thresh) & (sat < 28)
    a[dark] = 0
    fade = (lum < thresh + 18) & (sat < 40) & ~dark
    a[fade] *= np.clip((lum[fade] - (thresh - 8)) / 26.0, 0, 1)
    arr[:, :, 3] = a
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def tight(im: Image.Image, pad: float = 0.1, size: int = 640) -> Image.Image:
    alpha = np.array(im.split()[-1])
    ys, xs = np.where(alpha > 16)
    if len(xs) == 0:
        return im
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    crop = im.crop((x0, y0, x1 + 1, y1 + 1))
    w, h = crop.size
    side = int(max(w, h) * (1 + pad * 2))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(crop, ((side - w) // 2, (side - h) // 2), crop)
    if side != size:
        canvas = canvas.resize((size, size), Image.Resampling.LANCZOS)
    return canvas


def process(src: Path, slug: str, mode: str = "magenta") -> Path:
    im = Image.open(src)
    knocked = knock_magenta(im) if mode == "magenta" else knock_dark(im)
    out = tight(knocked)
    dest = OUT / f"{slug}.png"
    out.save(dest, "PNG", optimize=True)
    alpha = np.array(out.split()[-1])
    fill = float((alpha > 16).mean())
    print(f"{slug:16} {out.size} fill={fill:.2f}  {dest.name}")
    return dest


MAP = {
    "celtics": "bf162090-3f4f-4b03-834c-72eb940f2037.jpg",
    "nets": "ae2a9b9b-22a5-4441-8495-ac9e9201400f.jpg",
    "knicks": "4961d26f-50ea-4807-84c9-9d85f1897ce0.jpg",
    "76ers": "c0ef9e01-052a-4aa8-be48-7398e708d24b.jpg",
    "raptors": "38e18b04-90c9-49e1-b1b6-876526187016.jpg",
    "bulls": "c245e1bf-c54b-4165-9c25-0429681a9627.jpg",
    "cavaliers": "7f196df3-dd71-466c-912d-8fd2b3fc6432.jpg",
    "pistons": "25283c49-32c3-4a17-9c9f-e94762107b7f.jpg",
    "pacers": "223bc00e-9249-42c4-b02e-9a3a6d35d8c4.jpg",
    "bucks": "b579c584-c721-4274-8871-11ad838347b1.jpg",
    "hawks": "d8c58ccd-d7d3-4b87-b85c-45199bae6c1b.jpg",
    "hornets": "dfe9039d-8512-4ad9-9027-46ae747ce936.jpg",
    "heat": "d63e4c8b-fae6-4c99-b6ed-034d15363747.jpg",
    "magic": "6d00add8-b975-43b9-9bb8-30832d203c52.jpg",
    "wizards": "4acb7ae6-109d-49d1-a409-4672f548ff32.jpg",
    "nuggets": "7a4abdc1-b6aa-40da-abf2-9dd37c61c8da.jpg",
    "timberwolves": "a56b3459-a717-4741-9f05-ee82ca402c31.jpg",
    "thunder": "36fcb032-d5f0-464b-8bed-be7cf7e52911.jpg",
    "trail-blazers": "8a57ae82-93c1-4873-a808-e9c30237fb0a.jpg",
    "jazz": "667bdd5e-cb8c-43bd-a9f4-d74ece9fd51e.jpg",
    "warriors": "aba9440d-a530-441c-a6d4-d798b2b8bb59.jpg",
    "clippers": "49e4da3d-0d6d-4d6e-bf61-53e53d40a80f.jpg",
    "lakers": "a35b050a-8577-4a66-82ad-53d592db7246.jpg",
    "suns": "b9c2b7ba-5539-48be-b3e6-5f6a71ea07bc.jpg",
}

if __name__ == "__main__":
    extra = dict(arg.split("=", 1) for arg in sys.argv[1:] if "=" in arg)
    MAP.update(extra)
    for slug, fname in MAP.items():
        process(SRC / fname, slug)
