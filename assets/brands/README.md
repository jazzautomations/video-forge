# Brand identities (consistency on purpose)

A **brand profile** is the opposite of `compose.py propose`: instead of forcing variety, it
**locks one look** — palette, font pairing, wordmark, default transition/anchor — so every video
you make shares the same identity. `propose` still varies the *structure* (archetype/pacing/
content) while the identity stays constant: consistent brand, non-repetitive videos.

Save one as `assets/brands/<name>.json`, then:

```bash
python3 scripts/compose.py brands                              # list saved identities
python3 scripts/compose.py new  --brand-profile jazz --archetype kinetic-promo --out ./sb.json
python3 scripts/compose.py propose --brand-profile jazz --n 3 --out-dir ./candidates   # same look, 3 structures
```

A profile may inherit a **base theme** then override, or fully specify colours + fonts.

| Field | Required | Meaning |
|---|---|---|
| `label` | no | human description (shown by `compose.py brands`) |
| `brand` | no | wordmark shown top-right of every video |
| `base` | no | a theme name to inherit palette/fonts from (then override below) |
| `background` / `textColor` / `accent` | no* | palette overrides (hex) |
| `display` / `text` | no* | font families — **set BOTH or neither**; must be vendored in `themes.json` (`compose.py themes` → the `fonts` registry: Inter, Space Grotesk, JetBrains Mono, Noto Serif, Noto Serif Display, Bricolage Grotesque) |
| `transition` | no | default transition (wipe/push/fade/iris/none) |
| `titleAnchor` | no | default compass anchor for title scenes (sw/nw/ne/c/w/…) |

\* Without a `base`, give enough overrides that the look is fully defined; with a `base`, override only what differs. `background`/`textColor` must keep ≥4.5:1 contrast — `scripts/lint_taste.py` will catch it if not.

To use a font the skill doesn't ship yet, vendor it first with `scripts/vendor_fonts.py` (add it to
`themes.json` `fonts`/`stacks`/`advance`), then name it here. Nothing downloads at render time.

`jazz.json` is a worked example: inherits `electric-indigo`'s indigo ink, overrides the accent to
lime, pins Space Grotesk / Inter, left anchor, push transitions, wordmark "JAZZ AUTOMATIONS".
