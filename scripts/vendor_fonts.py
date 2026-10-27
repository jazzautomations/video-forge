#!/usr/bin/env python3
"""Vendor OFL/Apache fonts from local .ttf into the repo as subsetted .woff2.

Fully local: converts installed TTFs (no network). Subsets to a Latin range that
covers Portuguese/Spanish/English + common typographic punctuation, so files stay
tiny while every accented glyph pt-BR narration/titles need survives.

Also prints a measured upper-bound glyph advance (fraction of em) at each DISPLAY
font's title weight, so EditorialTitle's deterministic fit math stays safe per font.
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools import varLib
from fontTools.varLib.instancer import instantiateVariableFont

OUT = Path(sys.argv[1])  # assets/fonts
OUT.mkdir(parents=True, exist_ok=True)

I = "/usr/share/fonts/truetype"
# (slug, weight, source ttf, variable-instance axes or None)
JOBS = [
    ("inter", 400, f"{I}/inter-zorin-os/Inter-Regular.ttf", None),
    ("inter", 600, f"{I}/inter-zorin-os/Inter-SemiBold.ttf", None),
    ("inter", 700, f"{I}/inter-zorin-os/Inter-Bold.ttf", None),
    ("inter", 800, f"{I}/inter-zorin-os/Inter-ExtraBold.ttf", None),
    ("space-grotesk", 400, f"{I}/space-grotesk-zorin-os/SpaceGrotesk-Regular.ttf", None),
    ("space-grotesk", 500, f"{I}/space-grotesk-zorin-os/SpaceGrotesk-Medium.ttf", None),
    ("space-grotesk", 700, f"{I}/space-grotesk-zorin-os/SpaceGrotesk-Bold.ttf", None),
    ("jetbrains-mono", 400, f"{I}/jetbrains-mono-zorin-os/JetBrainsMono-Regular.ttf", None),
    ("jetbrains-mono", 500, f"{I}/jetbrains-mono-zorin-os/JetBrainsMono-Medium.ttf", None),
    ("jetbrains-mono", 700, f"{I}/jetbrains-mono-zorin-os/JetBrainsMono-Bold.ttf", None),
    ("noto-serif", 400, f"{I}/noto/NotoSerif-Regular.ttf", None),
    ("noto-serif", 700, f"{I}/noto/NotoSerif-Bold.ttf", None),
    ("noto-serif-display", 400, f"{I}/noto/NotoSerifDisplay-Regular.ttf", None),
    ("noto-serif-display", 600, f"{I}/noto/NotoSerifDisplay-SemiBold.ttf", None),
    ("noto-serif-display", 700, f"{I}/noto/NotoSerifDisplay-Bold.ttf", None),
    ("bricolage-grotesque", 500, "/home/h/.fonts/BricolageGrotesque.ttf", {"wght": 500, "opsz": 96, "wdth": 100}),
    ("bricolage-grotesque", 800, "/home/h/.fonts/BricolageGrotesque.ttf", {"wght": 800, "opsz": 96, "wdth": 100}),
]

# Unicode coverage: Basic Latin + Latin-1 Supplement + Latin Extended-A + key punctuation.
UNI = (list(range(0x0000, 0x0100)) + list(range(0x0100, 0x0180)) +
       [0x2010,0x2011,0x2012,0x2013,0x2014,0x2015,0x2018,0x2019,0x201A,0x201C,0x201D,0x201E,
        0x2020,0x2021,0x2022,0x2026,0x2030,0x2039,0x203A,0x2044,0x20AC,0x2122,0x2190,0x2192,0x2212])

# chars a title/hero line can hold — advance upper bound measured over these
TITLE_CHARS = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 "
               "ÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç—–:·,.!?&%")

def subset_to_woff2(font, dst):
    opts = Options()
    opts.flavor = "woff2"
    opts.desubroutinize = True
    opts.name_IDs = ['*']
    opts.name_legacy = True
    opts.name_languages = ['*']
    opts.recalc_bounds = True
    opts.layout_features = ['*']
    ss = Subsetter(options=opts)
    ss.populate(unicodes=UNI)
    ss.subset(font)
    font.flavor = "woff2"
    font.save(dst)

def measure_advance(ttf_path, axes):
    f = TTFont(ttf_path)
    if axes:
        instantiateVariableFont(f, axes, inplace=True)
    upm = f['head'].unitsPerEm
    cmap = f.getBestCmap()
    hmtx = f['hmtx']
    widths = []
    for ch in TITLE_CHARS:
        gid = cmap.get(ord(ch))
        if gid and gid in hmtx.metrics:
            widths.append(hmtx[gid][0] / upm)
    widths.sort()
    return max(widths), widths[int(len(widths)*0.95)]  # (max, p95)

display_adv = {}
for slug, wght, src, axes in JOBS:
    f = TTFont(src)
    if axes:
        instantiateVariableFont(f, axes, inplace=True)
    dst = OUT / f"{slug}-{wght}.woff2"
    subset_to_woff2(f, dst)
    kb = dst.stat().st_size / 1024
    print(f"  {dst.name:34s} {kb:6.1f} KB")

# advances at the weight each display font sets titles in (nearest to EditorialTitle's 850)
for slug, src, axes in [("inter", f"{I}/inter-zorin-os/Inter-ExtraBold.ttf", None),
                        ("space-grotesk", f"{I}/space-grotesk-zorin-os/SpaceGrotesk-Bold.ttf", None),
                        ("jetbrains-mono", f"{I}/jetbrains-mono-zorin-os/JetBrainsMono-Bold.ttf", None),
                        ("noto-serif-display", f"{I}/noto/NotoSerifDisplay-Bold.ttf", None),
                        ("bricolage-grotesque", "/home/h/.fonts/BricolageGrotesque.ttf", {"wght":800,"opsz":96,"wdth":100})]:
    mx, p95 = measure_advance(src, axes)
    display_adv[slug] = (mx, p95)
print("\nDISPLAY advances (max, p95) — use ~max as titleAdvance for a safe fit:")
for slug, (mx, p95) in display_adv.items():
    print(f"  {slug:22s} max={mx:.3f}  p95={p95:.3f}")
