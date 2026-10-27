#!/usr/bin/env python3
"""Deterministic taste gates on a COMPOSED storyboard (no render needed).

Compiles the measurable half of references/taste.md into code, so the weak model gets a
hard yes/no instead of eyeballing: palette contrast, <=2 type families, and the title-fit
floor (a title too long to read at >=48px is a slop signal the fit math would silently shrink).
Pixel-area gates that need a frame (accent budget, air) live in scripts/lint_frame.py.

Usage:  python3 scripts/lint_taste.py storyboard.json
Exit 0 if every gate passes; exit 1 and print JSON {fails,warns} otherwise.
"""
import json, re, sys
from pathlib import Path

def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def _lum(hexcol):
    h = hexcol.lstrip('#')
    if len(h) == 3: h = ''.join(ch * 2 for ch in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)

def contrast(a, b):
    la, lb = _lum(a), _lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def _family(stack):
    if not stack: return None
    first = stack.split(',')[0].strip().strip('"\'')
    return first.lower()

def lint(spec):
    fails, warns, checks = [], [], {}
    bg = spec.get('background', '#101710'); fg = spec.get('textColor', '#F3F1E9'); ac = spec.get('accent', '#D7FF64')

    # Gate 2 (taste.md): focal text clears ~4.5:1 on its background.
    c_text = contrast(fg, bg); checks['contrast_text_bg'] = round(c_text, 2)
    if c_text < 4.5:
        fails.append(f'text/background contrast {c_text:.2f}:1 < 4.5:1 (body text unreadable)')

    # Accent must be visible as the one highlight (rule/eyebrow). Warn, not fail (mono themes tie).
    c_acc = contrast(ac, bg); checks['contrast_accent_bg'] = round(c_acc, 2)
    if c_acc < 3.0 and ac.lower() != fg.lower():
        warns.append(f'accent/background contrast {c_acc:.2f}:1 < 3.0:1 (accent barely visible)')
    if ac.lower() == bg.lower():
        fails.append('accent equals background (no accent at all)')

    # Gate 4: <= 2 type families. Count distinct primary families across spec + any per-scene override.
    fams = set()
    for key in ('displayFont', 'textFont', 'fontFamily'):
        f = _family(spec.get(key))
        if f and f not in ('monospace', 'arial,sans-serif'): fams.add(f)
    for s in spec.get('scenes', []):
        f = _family((s.get('props') or {}).get('fontFamily'))
        if f: fams.add(f)
    checks['type_families'] = sorted(fams)
    if len(fams) > 2:
        fails.append(f'{len(fams)} type families {sorted(fams)} > 2 (restraint gate)')

    # Gate 6 (fit floor): a title the fit math would shrink below ~48px display is too long to read.
    W, H = spec.get('width', 1920), spec.get('height', 1080)
    unit = min(W / 1920, H / 1080)
    avail = (W - 2 * 120 * unit) * 0.96
    adv = max(0.54, spec.get('titleAdvance', 0.54))
    cap = 174 * unit
    floor = 48 * unit
    for i, s in enumerate(spec.get('scenes', [])):
        if s.get('kind') != 'title' or not s.get('title'): continue
        n = len(s['title'])
        fit = avail / max(1, n * adv)
        size = s.get('titleSize', min(cap, fit))
        if s.get('titleSize') and size * n * adv > avail:
            fails.append(f'scene[{i}] title overflows: titleSize {size:.0f}px * {n} chars > frame width')
        elif size < floor:
            fails.append(f'scene[{i}] title "{s["title"][:40]}" fits only at {size:.0f}px (< {floor:.0f}px floor) — shorten it')
    return {'ok': not fails, 'fails': fails, 'warns': warns, 'checks': checks}

def main():
    if len(sys.argv) != 2:
        print('usage: lint_taste.py storyboard.json', file=sys.stderr); sys.exit(2)
    spec = json.loads(Path(sys.argv[1]).read_text())
    r = lint(spec)
    print(json.dumps(r, indent=2, ensure_ascii=False))
    sys.exit(0 if r['ok'] else 1)

if __name__ == '__main__':
    main()
