#!/usr/bin/env python
"""Remove the Gemini sparkle watermark (bottom-right corner) from element images.

Writes a cleaned COPY next to each original: name.ext -> name1.ext, so a sorted file
listing interleaves original, copy, original, copy for side-by-side review.

Only the bottom-right corner sparkle is changed: we crop that corner, run the LaMa
inpainting model on it, then composite *only the masked pixels* (feathered) back onto a
copy of the original. Everything outside the small mask box stays identical.
"""
import os
import glob
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# --- Watermark mask box, anchored to the bottom-right corner in PIXELS. ---
# The Gemini sparkle sits at a fixed pixel inset from the corner, NOT a fixed
# fraction, so a fractional box drifts off it on non-4:3 aspect ratios (the site
# mixes 0.81, 1.49, 1.79, 2.36 ratios). Anchoring in px covers it on every size.
WM_W, WM_H = 210, 175   # box reaches this many px left / up from the corner
WM_MARGIN = 6           # leave a few px at the very edge
PAD = 150        # px of real context around the box that LaMa sees (not changed)
FEATHER = 3      # px feather on the composite edge to avoid a seam
QUALITY = 98     # JPEG quality for the saved copy (high, near-lossless)

ROOT = "public/images/elements"
EXTS = ("*.jpg", "*.jpeg", "*.png")


def is_copy(path):
    """True if this file is a generated copy (stem ends '1' and the de-suffixed
    sibling exists). Lets us re-run safely without reprocessing copies."""
    d = os.path.dirname(path)
    stem, ext = os.path.splitext(os.path.basename(path))
    return stem.endswith("1") and os.path.exists(os.path.join(d, stem[:-1] + ext))


def out_path(path):
    stem, ext = os.path.splitext(path)
    return stem + "1" + ext


def mask_box(w, h):
    return (max(0, w - WM_W), max(0, h - WM_H), w - WM_MARGIN, h - WM_MARGIN)


def list_originals():
    files = []
    for e in EXTS:
        files += glob.glob(os.path.join(ROOT, "**", e), recursive=True)
    files = [f.replace("\\", "/") for f in files]
    return sorted(f for f in files if not is_copy(f))


def make_overlay(path, dst):
    """Draw the mask box on a downscaled preview so coverage can be eyeballed."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    x0, y0, x1, y1 = mask_box(w, h)
    ImageDraw.Draw(im).rectangle([x0, y0, x1 - 1, y1 - 1],
                                 outline=(255, 0, 0), width=max(2, w // 300))
    im.thumbnail((1000, 1000))
    im.save(dst, quality=90)


def clean_one(lama, path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    x0, y0, x1, y1 = mask_box(w, h)
    cx0, cy0 = max(0, x0 - PAD), max(0, y0 - PAD)
    cx1, cy1 = min(w, x1 + PAD), min(h, y1 + PAD)
    crop = im.crop((cx0, cy0, cx1, cy1))

    m = Image.new("L", crop.size, 0)
    ImageDraw.Draw(m).rectangle([x0 - cx0, y0 - cy0, x1 - cx0 - 1, y1 - cy0 - 1], fill=255)

    filled = lama(crop, m)
    if filled.size != crop.size:
        filled = filled.resize(crop.size)

    # Composite: only the (feathered) masked area comes from LaMa; rest = original crop.
    alpha = np.asarray(m.filter(ImageFilter.GaussianBlur(FEATHER)), np.float32)[..., None] / 255.0
    blended = (np.asarray(filled, np.float32) * alpha
               + np.asarray(crop, np.float32) * (1 - alpha)).astype(np.uint8)

    out = im.copy()
    out.paste(Image.fromarray(blended), (cx0, cy0))
    op = out_path(path)
    out.save(op, quality=QUALITY, subsampling=0)
    return op


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", nargs="*", help="write mask-overlay previews to scripts/_calib and exit")
    ap.add_argument("--only", nargs="*", help="process only these files")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if args.overlay is not None:
        os.makedirs("scripts/_calib", exist_ok=True)
        for p in args.overlay:
            dst = "scripts/_calib/" + os.path.basename(os.path.dirname(p)) + "__" + os.path.basename(p)
            make_overlay(p, dst)
            print("overlay:", dst)
        return

    from simple_lama_inpainting import SimpleLama
    lama = SimpleLama()

    files = args.only if args.only else list_originals()
    if args.limit:
        files = files[:args.limit]
    print(f"processing {len(files)} files", flush=True)
    for i, p in enumerate(files, 1):
        op = clean_one(lama, p)
        print(f"[{i}/{len(files)}] {p} -> {op}", flush=True)


if __name__ == "__main__":
    main()
