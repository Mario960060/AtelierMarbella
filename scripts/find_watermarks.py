#!/usr/bin/env python
"""Flag cleaned copies that still seem to carry the Gemini sparkle.

Heuristic: in the bottom-right corner band, the sparkle is a small, near-white,
low-saturation, compact blob. Detect such blobs (OpenCV connected components),
print candidates, and tile zoomed crops (detected blob boxed) for visual confirm.
"""
import os
import glob
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw

ROOT = "public/images/elements"
OUT = "scripts/_wm"

# Search ONLY the corner region the watermark actually occupies (pixel inset),
# so we measure real residuals, not bright objects further into the frame.
CORNER_W, CORNER_H = 235, 205
# blob acceptance
MINCH = 200          # min of R,G,B to count as "near white"
MAXSPREAD = 45       # max(R,G,B)-min(R,G,B) -> low saturation
AREA_MIN, AREA_MAX = 12, 1400
SIDE_MIN, SIDE_MAX = 5, 80
FILL_MIN, FILL_MAX = 0.12, 0.92


def copies():
    out = []
    for f in glob.glob(os.path.join(ROOT, "**", "*.jpg"), recursive=True):
        f = f.replace("\\", "/")
        s, e = os.path.splitext(os.path.basename(f))
        d = os.path.dirname(f)
        if s.endswith("1") and os.path.exists(os.path.join(d, s[:-1] + e)):
            out.append(f)
    return sorted(out)


def detect(path):
    im = cv2.imread(path)  # BGR
    h, w = im.shape[:2]
    rx0, ry0 = max(0, w - CORNER_W), max(0, h - CORNER_H)
    region = im[ry0:h, rx0:w]
    b, g, r = region[..., 0].astype(int), region[..., 1].astype(int), region[..., 2].astype(int)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    mask = ((mn > MINCH) & ((mx - mn) < MAXSPREAD)).astype(np.uint8)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(mask, connectivity=8)
    best = None
    for i in range(1, n):
        x, y, ww, hh, area = stats[i]
        if not (AREA_MIN <= area <= AREA_MAX):
            continue
        if not (SIDE_MIN <= ww <= SIDE_MAX and SIDE_MIN <= hh <= SIDE_MAX):
            continue
        fill = area / float(ww * hh)
        if not (FILL_MIN <= fill <= FILL_MAX):
            continue
        ar = ww / float(hh)
        if not (0.45 <= ar <= 2.2):
            continue
        score = area
        if best is None or score > best[0]:
            best = (score, rx0 + x, ry0 + y, ww, hh)
    return (w, h, best)


def main():
    os.makedirs(OUT, exist_ok=True)
    files = copies()
    cands = []
    for f in files:
        w, h, best = detect(f)
        if best:
            cands.append((f, w, h, best))
    print(f"{len(cands)} / {len(files)} flagged as possible residual watermark")
    for f, w, h, best in cands:
        _, x, y, ww, hh = best
        print(f"  {f}  blob@({x},{y}) {ww}x{hh}  relpos=({x/w:.3f},{y/h:.3f})")

    # montage: tight window centred on each detected blob, upscaled & boxed.
    CELL, LBL, COLS, RPP, HALF = 330, 22, 3, 3, 120
    per = COLS * RPP
    for p in range(math.ceil(len(cands) / per)):
        chunk = cands[p * per:(p + 1) * per]
        rows = math.ceil(len(chunk) / COLS)
        sheet = Image.new("RGB", (COLS * CELL, rows * (CELL + LBL)), (0, 0, 0))
        dd = ImageDraw.Draw(sheet)
        for i, (f, w, h, best) in enumerate(chunk):
            _, x, y, ww, hh = best
            cxc, cyc = x + ww // 2, y + hh // 2
            wx0, wy0 = max(0, cxc - HALF), max(0, cyc - HALF)
            wx1, wy1 = min(w, cxc + HALF), min(h, cyc + HALF)
            win = Image.open(f).convert("RGB").crop((wx0, wy0, wx1, wy1))
            cw, ch = win.size
            win = win.resize((CELL, CELL))
            d = ImageDraw.Draw(win)
            sx, sy = CELL / cw, CELL / ch
            d.rectangle([(x - wx0 - 5) * sx, (y - wy0 - 5) * sy,
                         (x + ww - wx0 + 5) * sx, (y + hh - wy0 + 5) * sy],
                        outline=(255, 40, 40), width=2)
            r, c = divmod(i, COLS)
            sheet.paste(win, (c * CELL, r * (CELL + LBL) + LBL))
            dd.text((c * CELL + 4, r * (CELL + LBL) + 5), os.path.basename(f), fill=(255, 255, 0))
        op = f"{OUT}/cand{p+1}.jpg"
        sheet.save(op, quality=90)
        print("wrote", op)


if __name__ == "__main__":
    main()
