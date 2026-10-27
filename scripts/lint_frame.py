#!/usr/bin/env python3
"""Deterministic taste gates measured on a RENDERED frame (PNG from scripts/still.py).

Implements the pixel half of references/taste.md: the accent budget (<=~10-15% of frame
area — the 60/30/10 rule), real text/background contrast, title-safe air on every side, and
a not-blank check. Run it on a hero still BEFORE the human/model eyeball pass; a hard fail
means re-compose or re-anchor, don't ship.

Usage:  python3 scripts/lint_frame.py hero.png [--accent "#D7FF64"] [--storyboard sb.json]
--accent (or the storyboard's accent) enables the accent-area gate. Exit 1 on any fail.
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
from PIL import Image

def _lin(c):
    c = c / 255.0
    return np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def luminance(rgb):  # rgb: (...,3) uint8
    r, g, b = _lin(rgb[..., 0]), _lin(rgb[..., 1]), _lin(rgb[..., 2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def wcag(l1, l2):
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def hex2rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('png')
    ap.add_argument('--accent')
    ap.add_argument('--storyboard')
    ap.add_argument('--accent-max', type=float, default=0.15, help='max accent area fraction (default .15; taste.md target ~.10)')
    args = ap.parse_args()

    accent = args.accent
    if not accent and args.storyboard:
        accent = json.loads(Path(args.storyboard).read_text()).get('accent')

    im = Image.open(args.png).convert('RGB')
    a = np.asarray(im, dtype=np.uint8)
    h, w, _ = a.shape
    px = a.reshape(-1, 3)
    fails, warns, checks = [], [], {}

    # Dominant background: mode of a 16-level-quantized histogram.
    q = (px // 16).astype(np.int32)
    keys = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    order = np.argsort(counts)[::-1]
    def key2rgb(k): return np.array([(k // 65536) * 16 + 8, ((k // 256) % 256) * 16 + 8, (k % 256) * 16 + 8], dtype=np.float64)
    bg_rgb = key2rgb(vals[order[0]])
    bg_frac = counts[order[0]] / len(keys)
    checks['bg_frac'] = round(float(bg_frac), 3)

    # Blank: one color owns almost everything.
    if bg_frac > 0.99:
        fails.append(f'frame is {bg_frac*100:.1f}% one color — nearly blank')

    # Contrast: brightest significant cluster vs darkest significant cluster (text vs ground).
    lum = luminance(px.astype(np.float64))
    sig = counts / len(keys) > 0.002  # clusters covering >0.2% of the frame
    cluster_rgb = np.stack([key2rgb(k) for k in vals[sig]])
    cluster_lum = luminance(cluster_rgb)
    if len(cluster_lum) >= 2:
        c = wcag(float(cluster_lum.max()), float(cluster_lum.min()))
        checks['contrast_extremes'] = round(c, 2)
        if c < 4.5:
            fails.append(f'highest/lowest significant luminance contrast {c:.2f}:1 < 4.5:1 (focal text won\'t pop)')

    # Accent budget: fraction of pixels near the accent colour.
    if accent:
        ac = hex2rgb(accent)
        dist = np.sqrt(((px.astype(np.float64) - ac) ** 2).sum(axis=1))
        frac = float((dist < 48).mean())
        checks['accent_area'] = round(frac, 3)
        if frac > args.accent_max:
            fails.append(f'accent floods {frac*100:.1f}% of the frame > {args.accent_max*100:.0f}% (accent budget / 60-30-10)')

    # Title-safe air: outer 7% band on each side should be mostly clear (near background).
    band = max(1, int(round(0.07 * min(h, w))))
    bg_lum = float(luminance(bg_rgb.reshape(1, 3))[0])
    lum2d = luminance(a.astype(np.float64))
    ink = np.abs(lum2d - bg_lum) > 0.12  # pixels visibly different from the ground
    sides = {'top': ink[:band, :], 'bottom': ink[-band:, :], 'left': ink[:, :band], 'right': ink[:, -band:]}
    air = {}
    for name, region in sides.items():
        f = float(region.mean()); air[name] = round(f, 3)
        if f > 0.06:
            warns.append(f'{name} edge band has {f*100:.1f}% ink — content may be crowding the frame edge')
    checks['edge_ink'] = air

    r = {'ok': not fails, 'fails': fails, 'warns': warns, 'checks': checks}
    print(json.dumps(r, indent=2, ensure_ascii=False))
    sys.exit(0 if r['ok'] else 1)

if __name__ == '__main__':
    main()
