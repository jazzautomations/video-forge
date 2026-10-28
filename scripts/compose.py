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
_THEMES_DOC = _load(ASSETS / 'themes.json')
THEMES = _THEMES_DOC['themes']
FONTS = _THEMES_DOC['fonts']      # family -> [{w,f}] faces vendored in assets/fonts
STACKS = _THEMES_DOC['stacks']    # family -> CSS font stack with fallbacks
ADVANCE = _THEMES_DOC['advance']  # display family -> EditorialTitle fit advance
SAFE = {i['id']: i for i in _load(ASSETS / 'safe-components.json')['items']}
ARCH_DIR = ASSETS / 'archetypes'
BRAND_DIR = ASSETS / 'brands'  # saved reusable identities (optional)

def _load_brand(name):
    """Resolve a brand profile by name (assets/brands/<name>.json) or an explicit path."""
    p = Path(name)
    if not p.exists():
        p = BRAND_DIR / f'{name}.json'
    if not p.exists():
        raise ValueError(f'brand profile {name!r} not found (looked in {BRAND_DIR}/ and as a path)')
    b = _load(p); b.setdefault('_name', p.stem); return b
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

def _font_fields(disp, txt):
    """Shared by themes AND brand profiles: resolve a display+text family pair to the spec
    fields (stacks, advance, de-duped @font-face set). Both families must be vendored."""
    for fam in (disp, txt):
        if fam not in FONTS:
            raise ValueError(f'font family {fam!r} is not vendored — add it to themes.json '
                             f'(fonts+stacks+advance) and assets/fonts via scripts/vendor_fonts.py')
    faces = []
    for fam in dict.fromkeys([disp, txt]):
        faces += [{'family': fam, 'weight': face['w'], 'file': face['f']} for face in FONTS[fam]]
    return STACKS[disp], STACKS[txt], ADVANCE[disp], faces

def _set_fonts(spec, disp, txt):
    spec['displayFont'], spec['textFont'], spec['titleAdvance'], spec['fonts'] = _font_fields(disp, txt)
    spec['fontFamily'] = spec['textFont']  # components + body inherit the text family

def _apply_theme(spec, theme, keep_transition=False):
    spec['background'] = theme['background']
    spec['textColor'] = theme['textColor']
    spec['accent'] = theme['accent']
    _set_fonts(spec, theme['display'], theme['text'])  # DISPLAY = headlines, TEXT = body
    if not keep_transition:
        spec['transition'] = theme['transition']

def _apply_brand(spec, brand):
    """Lock a reusable IDENTITY onto the spec (the opposite of propose's variety): a saved
    palette + font pairing + wordmark, so many videos share one brand. A brand may inherit a
    base theme then override, or fully specify colours+fonts. Applied AFTER the theme."""
    for k_spec, k_brand in (('background', 'background'), ('textColor', 'textColor'), ('accent', 'accent')):
        if brand.get(k_brand):
            spec[k_spec] = brand[k_brand]
    disp = brand.get('display'); txt = brand.get('text')
    if disp or txt:
        # fall back to whatever the current spec fonts resolve from (need family names, so
        # require both when either is set, unless a base theme already set them).
        if not (disp and txt):
            raise ValueError("brand profile: set BOTH 'display' and 'text' font families, or neither")
        _set_fonts(spec, disp, txt)
    if brand.get('transition'):
        spec['transition'] = brand['transition']
    if brand.get('brand'):
        spec['brand'] = brand['brand']
    anchor = brand.get('titleAnchor')
    if anchor:
        for s in spec['scenes']:
            if s.get('kind') == 'title' and 'anchor' not in s:
                s['anchor'] = anchor
    spec.setdefault('_meta', {})['brandProfile'] = brand.get('_name', brand.get('label'))

def _stamp_component(scene, colors):
    meta = SAFE.get(scene.get('component'))
    if not meta:
        return
    tm = meta.get('theme')
    if isinstance(tm, dict):  # rendercomp: map the EFFECTIVE palette onto this component's prop names
        props = scene.setdefault('props', {})
        for prop, key in tm.items():
            props[prop] = colors[key]
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

def _compose(archetype, theme_name, seed, brand, brand_profile=None):
    """Build one validated storyboard spec from archetype + theme (+ seed). An optional
    brand_profile (a loaded identity dict) is applied LAST and wins, locking the look.
    Returns (spec, errs)."""
    if archetype not in ARCHETYPES:
        return None, [f'unknown archetype {archetype!r}']
    spec = _load(ARCH_DIR / f'{archetype}.json')
    # A brand with a base theme pins the theme; otherwise use the requested/default theme.
    if brand_profile and brand_profile.get('base'):
        theme_name = brand_profile['base']
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
    if brand_profile:
        try:
            _apply_brand(spec, brand_profile)
        except ValueError as e:
            return None, [str(e)]
    # Stamp components with the EFFECTIVE palette (after any brand override), not the raw theme.
    colors = {'bg': spec['background'], 'text': spec['textColor'], 'accent': spec['accent']}
    for s in spec['scenes']:
        if s.get('kind') == 'component':
            _stamp_component(s, colors)
    spec['durationSeconds'] = round(sum(s['seconds'] for s in spec['scenes']), 4)
    # Deterministic-but-varied character seed (DiceBear Open Peeps, CC0): different brand/theme/seed
    # -> a different cast, so videos stop sharing one face. Only set it when a character scene exists.
    if any(s.get('kind') == 'character' for s in spec['scenes']):
        spec['characterSeed'] = f"{spec.get('brand') or brand or archetype}-{theme_name}-{seed}"
    spec.setdefault('_meta', {}).update({'theme': theme_name, 'seed': seed, 'archetype': archetype})
    return spec, validate(spec)

def cmd_brands(_):
    if not BRAND_DIR.exists() or not list(BRAND_DIR.glob('*.json')):
        print('no brand profiles yet. Create one at assets/brands/<name>.json '
              '(see assets/brands/README.md) to lock a reusable identity.')
        return
    for p in sorted(BRAND_DIR.glob('*.json')):
        b = _load(p)
        print(f'{p.stem:16s} {b.get("label","")}  [brand={b.get("brand","-")} '
              f'base={b.get("base","-")} fonts={b.get("display","-")}/{b.get("text","-")}]')

def cmd_new(args):
    bp = _load_brand(args.brand_profile) if args.brand_profile else None
    spec, errs = _compose(args.archetype, args.theme, args.seed, args.brand, brand_profile=bp)
    if errs:
        print('composed storyboard FAILED validation:', file=sys.stderr)
        for e in errs:
            print('  -', e, file=sys.stderr)
        sys.exit(1)
    out = Path(args.out)
    out.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + '\n')
    comps = [s['component'] for s in spec['scenes'] if s.get('kind') == 'component']
    print(f'wrote {out}')
    bprof = spec.get('_meta', {}).get('brandProfile')
    print(f'  archetype={spec["_meta"]["archetype"]}  theme={spec["_meta"]["theme"]}  '
          f'seed={args.seed}  scenes={len(spec["scenes"])}  duration={spec["durationSeconds"]}s'
          + (f'  identity={bprof}' if bprof else ''))
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
    bp = _load_brand(args.brand_profile) if args.brand_profile else None
    archs = [a for a in ['kinetic-promo', 'calm-explainer', 'data-story', 'launch-hype', 'screen-demo']
             if a in ARCHETYPES and a not in avoid]
    # With a locked IDENTITY, hold the look constant (one pinned theme) and vary only the
    # STRUCTURE/content — consistent brand, non-repetitive videos. Otherwise spread themes too.
    if bp:
        pinned = bp.get('base') or THEME_SPREAD[0]
        themes = [pinned]
    else:
        themes = [t for t in THEME_SPREAD if t in THEMES and t not in avoid]
    base = random.Random(args.seed if args.seed is not None else 0)
    rows, i, picks = [], 0, 0
    used_pairs = set()
    while picks < n and i < n * 4:
        arch = archs[picks % len(archs)]
        theme = themes[(picks * 4 + i) % len(themes)]  # stride to spread hues/lightness
        i += 1
        if (arch, theme) in used_pairs and not bp:  # a locked identity reuses the one theme
            continue
        used_pairs.add((arch, theme))
        seed = base.randint(1, 9999)
        spec, errs = _compose(arch, theme, seed, args.brand, brand_profile=bp)
        if errs:
            continue
        p = out_dir / f'candidate-{picks + 1}.json'
        p.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + '\n')
        feel = (bp.get('label', bp['_name']) if bp else THEMES[theme]['label'].split('—')[-1].strip())
        rows.append((p.name, arch, spec['_meta']['theme'], spec.get('transition'), feel))
        picks += 1
    mode = f'ONE identity ({bp["_name"]}), varied structure' if bp else 'deliberately different'
    print(f'wrote {picks} {mode} candidates to {out_dir}/')
    for name, arch, theme, tr, feel in rows:
        print(f'  {name}: {arch:15s} + {theme:15s} [{tr}] — {feel}')
    if bp:
        print('\nSame palette/fonts/wordmark across all — pick the STRUCTURE that fits, then edit text.')
    else:
        print('\nNow apply the taste rubric (references/taste.md §2) to each candidate\'s HERO '
              'frame, pick or synthesize the best fit for the brief, then edit its text.')

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('themes').set_defaults(func=cmd_themes)
    sub.add_parser('archetypes').set_defaults(func=cmd_archetypes)
    sub.add_parser('brands', help='list saved brand identities (assets/brands/*.json)').set_defaults(func=cmd_brands)
    pc = sub.add_parser('components'); pc.add_argument('query', nargs='?'); pc.set_defaults(func=cmd_components)
    pn = sub.add_parser('new')
    pn.add_argument('--archetype', required=True)
    pn.add_argument('--theme')
    pn.add_argument('--seed', type=int)
    pn.add_argument('--brand')
    pn.add_argument('--brand-profile', help='lock a saved identity (assets/brands/<name>.json or a path)')
    pn.add_argument('--out', required=True)
    pn.set_defaults(func=cmd_new)
    pp = sub.add_parser('propose', help='emit N deliberately different candidates (anti-sameness)')
    pp.add_argument('--n', type=int, default=3)
    pp.add_argument('--brand')
    pp.add_argument('--brand-profile', help='lock ONE identity; vary only structure/content (consistency, not sameness)')
    pp.add_argument('--seed', type=int)
    pp.add_argument('--avoid', help='comma-separated archetypes/themes to skip')
    pp.add_argument('--out-dir', default='./candidates')
    pp.set_defaults(func=cmd_propose)
    args = ap.parse_args()
    args.func(args)

if __name__ == '__main__':
    main()
