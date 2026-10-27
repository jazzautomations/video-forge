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

# Themes ordered to MAXIMISE perceptual spread (light / dark-warm / dark-cool / mono),
# so stepping through this list hands back looks that are far apart, not neighbours.
THEME_SPREAD = ['paper-ink', 'terminal-green', 'cyber-magenta', 'royal-gold', 'ocean-steel',
                'midnight-lime', 'sunset-warm', 'electric-indigo', 'mono-noir']

def _compose(archetype, theme_name, seed, brand):
    """Build one validated storyboard spec from archetype + theme (+ seed). Returns (spec, errs)."""
    if archetype not in ARCHETYPES:
        return None, [f'unknown archetype {archetype!r}']
    spec = _load(ARCH_DIR / f'{archetype}.json')
    theme_name = theme_name or spec.get('_meta', {}).get('defaultTheme', 'midnight-lime')
    if theme_name not in THEMES:
        return None, [f'unknown theme {theme_name!r}']
    theme = THEMES[theme_name]
    rng = random.Random(seed) if seed is not None else None
    if rng:
        used = set()
        for s in spec['scenes']:
            if s.get('kind') == 'component':
                _swap(s, rng, used)
    _apply_theme(spec, theme, keep_transition=False)
    if rng:
        spec['transition'] = rng.choice(TRANSITIONS)
    if brand:
        spec['brand'] = brand
    for s in spec['scenes']:
        if s.get('kind') == 'component':
            _stamp_component(s, theme)
    spec['durationSeconds'] = round(sum(s['seconds'] for s in spec['scenes']), 4)
    spec.setdefault('_meta', {}).update({'theme': theme_name, 'seed': seed, 'archetype': archetype})
    return spec, validate(spec)

def cmd_new(args):
    spec, errs = _compose(args.archetype, args.theme, args.seed, args.brand)
    if errs:
        print('composed storyboard FAILED validation:', file=sys.stderr)
        for e in errs:
            print('  -', e, file=sys.stderr)
        sys.exit(1)
    out = Path(args.out)
    out.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + '\n')
    comps = [s['component'] for s in spec['scenes'] if s.get('kind') == 'component']
    print(f'wrote {out}')
    print(f'  archetype={spec["_meta"]["archetype"]}  theme={spec["_meta"]["theme"]}  '
          f'seed={args.seed}  scenes={len(spec["scenes"])}  duration={spec["durationSeconds"]}s')
    print(f'  components: {", ".join(comps) or "(built-in scenes only)"}')
    print('  next: edit ONLY text/narration/numbers, then  python3 scripts/run.py '
          f'{out} --out ./film')

def cmd_propose(args):
    """Verbalized-Sampling substrate: emit N DELIBERATELY DIFFERENT candidates at once, so
    the model judges a diverse set (taste.md rubric) and picks/refines, instead of falling
    into the one 'typical' look. Diversity by construction: distinct archetypes, themes
    stepped across the perceptual spread, varied seeds/transitions."""
    n = max(2, min(args.n, len(THEME_SPREAD)))
    avoid = set((args.avoid or '').split(',')) - {''}
    out_dir = Path(args.out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    archs = [a for a in ['kinetic-promo', 'calm-explainer', 'data-story', 'launch-hype', 'screen-demo']
             if a in ARCHETYPES and a not in avoid]
    themes = [t for t in THEME_SPREAD if t in THEMES and t not in avoid]
    base = random.Random(args.seed if args.seed is not None else 0)
    rows, i, picks = [], 0, 0
    used_pairs = set()
    while picks < n and i < n * 4:
        arch = archs[picks % len(archs)]
        theme = themes[(picks * 4 + i) % len(themes)]  # stride to spread hues/lightness
        i += 1
        if (arch, theme) in used_pairs:
            continue
        used_pairs.add((arch, theme))
        seed = base.randint(1, 9999)
        spec, errs = _compose(arch, theme, seed, args.brand)
        if errs:
            continue
        p = out_dir / f'candidate-{picks + 1}.json'
        p.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + '\n')
        rows.append((p.name, arch, theme, spec.get('transition'),
                     THEMES[theme]['label'].split('—')[-1].strip()))
        picks += 1
    print(f'wrote {picks} deliberately different candidates to {out_dir}/')
    for name, arch, theme, tr, feel in rows:
        print(f'  {name}: {arch:15s} + {theme:15s} [{tr}] — {feel}')
    print('\nNow apply the taste rubric (references/taste.md §2) to each candidate\'s HERO '
          'frame, pick or synthesize the best fit for the brief, then edit its text.')

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
    pp = sub.add_parser('propose', help='emit N deliberately different candidates (anti-sameness)')
    pp.add_argument('--n', type=int, default=3)
    pp.add_argument('--brand')
    pp.add_argument('--seed', type=int)
    pp.add_argument('--avoid', help='comma-separated archetypes/themes to skip')
    pp.add_argument('--out-dir', default='./candidates')
    pp.set_defaults(func=cmd_propose)
    args = ap.parse_args()
    args.func(args)

if __name__ == '__main__':
    main()
