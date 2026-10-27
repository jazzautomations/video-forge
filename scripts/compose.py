#!/usr/bin/env python3
"""Variety engine: turn an archetype + theme (+ optional seed) into a ready, VALID storyboard.

Why this exists: the golden path used to copy ONE storyboard and only swap text, so every
video came out the same. compose.py instead composes a storyboard from:
  - an ARCHETYPE  (structure/pacing/scene mix)  -> assets/archetypes/*.json
  - a THEME       (palette/font/transition)     -> assets/themes.json
  - an optional SEED (re-arranges interchangeable scenes for extra variety)
5 archetypes x 9 themes = 45 distinct looks before you change a word. Themes flow into
built-in scenes and catalog components automatically. Output is validated before writing.

Usage:
  python3 scripts/compose.py themes
  python3 scripts/compose.py archetypes
  python3 scripts/compose.py components [query]
  python3 scripts/compose.py new --archetype kinetic-promo --theme sunset-warm \
      [--seed 7] [--brand "ACME"] --out ./storyboard.json
Then edit ONLY the text/narration/numbers in the JSON and render with scripts/run.py.
"""
import argparse, json, random, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
sys.path.insert(0, str(ROOT / 'scripts'))
from build_project import validate  # noqa: E402

def _load(p): return json.loads(Path(p).read_text())
THEMES = _load(ASSETS / 'themes.json')['themes']
SAFE = {i['id']: i for i in _load(ASSETS / 'safe-components.json')['items']}
ARCH_DIR = ASSETS / 'archetypes'
ARCHETYPES = sorted(p.stem for p in ARCH_DIR.glob('*.json'))

# Interchangeable scenes grouped by role. With a seed, a scene whose component is in a
# group may be swapped for a sibling, so repeated runs of the same archetype+theme differ.
SWAP_GROUPS = [
    ['rendercomp/kinetic-word-stack', 'rendercomp/gradient-text-sweep', 'rendercomp/wave-text'],
    ['rendercomp/starfield', 'rendercomp/bokeh-circles', 'onda/mesh-gradient'],
    ['rendercomp/bar-chart-anim', 'rendercomp/line-chart-anim', 'rendercomp/racing-chart', 'onda/bar-chart', 'onda/line-chart'],
    ['onda/stat-card', 'rendercomp/kpi-counter', 'onda/count-up'],
    ['onda/quote-card', 'rendercomp/pixel-typewriter-quote'],
    ['rendercomp/glitch-text', 'rendercomp/scramble-text', 'onda/matrix-decode', 'onda/rgb-glitch-text'],
    ['rendercomp/end-card', 'onda/end-card'],
    ['onda/chapter-card', 'rendercomp/chapter-title'],
    ['rendercomp/neon-sign', 'rendercomp/logo-split-reveal', 'onda/logo-sting'],
]
TRANSITIONS = ['wipe', 'push', 'fade', 'iris']

def _apply_theme(spec, theme, keep_transition=False):
    spec['background'] = theme['background']
    spec['textColor'] = theme['textColor']
    spec['accent'] = theme['accent']
    spec['fontFamily'] = theme['fontFamily']
    spec['titleAdvance'] = theme['titleAdvance']
    if not keep_transition:
        spec['transition'] = theme['transition']

def _stamp_component(scene, theme):
    meta = SAFE.get(scene.get('component'))
    if not meta:
        return
    tm = meta.get('theme')
    if isinstance(tm, dict):  # rendercomp: map theme colours onto this component's prop names
        cmap = {'bg': theme['background'], 'text': theme['textColor'], 'accent': theme['accent']}
        props = scene.setdefault('props', {})
        for prop, key in tm.items():
            props[prop] = cmap[key]
    # 'auto'/'onda'/None: the compiler already injects background/textColor/accent.

def _swap(scene, rng, used):
    comp = scene.get('component')
    for g in SWAP_GROUPS:
        if comp in g:
            fresh = [c for c in g if c not in used]  # avoid repeating a scene already in this video
            choice = rng.choice(fresh or g)
            if choice != comp:
                scene['component'] = choice
                scene.pop('props', None)  # content props may not transfer; defaults + theme fill in
            used.add(scene['component'])
            return
    used.add(comp)

def cmd_themes(_):
    for name, t in THEMES.items():
        print(f'{name:18s} {t["label"]}')

def cmd_archetypes(_):
    for name in ARCHETYPES:
        m = _load(ARCH_DIR / f'{name}.json').get('_meta', {})
        print(f'{name:16s} [{m.get("beats","?")} beats, default theme {m.get("defaultTheme","-")}] {m.get("feel","")}')

def cmd_components(args):
    q = (args.query or '').lower()
    rows = []
    for ident, meta in SAFE.items():
        hay = ident + ' ' + ' '.join(meta.get('tags', [])) + ' ' + meta.get('use', '')
        if q and q not in hay.lower():
            continue
        rows.append((not meta.get('featured'), ident, meta))
    for _, ident, meta in sorted(rows):
        star = '*' if meta.get('featured') else ' '
        use = meta.get('use', ' '.join(meta.get('tags', [])))
        print(f'{star} {ident:34s} {use}')
    print(f'\n{sum(1 for r in rows)} match; * = featured/ready. All render through build_project.py.')

def cmd_new(args):
    if args.archetype not in ARCHETYPES:
        sys.exit(f'unknown archetype {args.archetype!r}; choose from: {", ".join(ARCHETYPES)}')
    spec = _load(ARCH_DIR / f'{args.archetype}.json')
    theme_name = args.theme or spec.get('_meta', {}).get('defaultTheme', 'midnight-lime')
    if theme_name not in THEMES:
        sys.exit(f'unknown theme {theme_name!r}; choose from: {", ".join(THEMES)}')
    theme = THEMES[theme_name]
    rng = random.Random(args.seed) if args.seed is not None else None
    if rng:
        used = set()
        for s in spec['scenes']:
            if s.get('kind') == 'component':
                _swap(s, rng, used)
    _apply_theme(spec, theme, keep_transition=False)
    if rng:
        spec['transition'] = rng.choice(TRANSITIONS)
    if args.brand:
        spec['brand'] = args.brand
    for s in spec['scenes']:
        if s.get('kind') == 'component':
            _stamp_component(s, theme)
    spec['durationSeconds'] = round(sum(s['seconds'] for s in spec['scenes']), 4)
    spec.setdefault('_meta', {}).update({'theme': theme_name, 'seed': args.seed, 'archetype': args.archetype})
    errs = validate(spec)
    if errs:
        print('composed storyboard FAILED validation:', file=sys.stderr)
        for e in errs:
            print('  -', e, file=sys.stderr)
        sys.exit(1)
    out = Path(args.out)
    out.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + '\n')
    comps = [s['component'] for s in spec['scenes'] if s.get('kind') == 'component']
    print(f'wrote {out}')
    print(f'  archetype={args.archetype}  theme={theme_name}  seed={args.seed}  '
          f'scenes={len(spec["scenes"])}  duration={spec["durationSeconds"]}s')
    print(f'  components: {", ".join(comps) or "(built-in scenes only)"}')
    print('  next: edit ONLY text/narration/numbers, then  python3 scripts/run.py '
          f'{out} --out ./film')

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('themes').set_defaults(func=cmd_themes)
    sub.add_parser('archetypes').set_defaults(func=cmd_archetypes)
    pc = sub.add_parser('components'); pc.add_argument('query', nargs='?'); pc.set_defaults(func=cmd_components)
    pn = sub.add_parser('new')
    pn.add_argument('--archetype', required=True)
    pn.add_argument('--theme')
    pn.add_argument('--seed', type=int)
    pn.add_argument('--brand')
    pn.add_argument('--out', required=True)
    pn.set_defaults(func=cmd_new)
    args = ap.parse_args()
    args.func(args)

if __name__ == '__main__':
    main()
