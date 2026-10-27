# Anti-sameness: forcing a weak model off the one typical look

The old failure mode: the golden path copied ONE storyboard and swapped text, so every video came
out the same. `compose.py` fixed the structure (archetype × theme × seed), but a weak model still
collapses to the *most typical* combination every time — the archetype's default theme, the featured
components, the default transition, everything centered. This file is the method that stops that.

## 0. Why sameness happens (and why it is not your fault)

Aligned models are trained on preference data with a **typicality bias**: their effective reward is
`r_true + α·log(p_ref)`, which sharpens all the probability mass onto the single most "typical"
completion (Verbalized Sampling, Zhang et al., arXiv 2510.01171, preprint). Asked for "a promo,"
the model doesn't explore — it emits the mode. `compose.py` can reproduce this structurally: when
`--theme` is omitted it silently falls back to the archetype's `defaultTheme`, swaps keep the
`featured` components (51 of 129, leaving a **78-component long tail that is never reached**), and
the default transition stays. Same input → same most-typical look, forever.

The fix is training-free and lives entirely in local code: make `compose.py` **verbalize** how
typical each candidate is, **select for diversity and quality jointly**, **remember** what this
brand already got, and **condition** on a named aesthetic reference. No paid API, no generative
model — these are deterministic data/code changes to the composer you already have.

## 1. `compose.py propose` IS the verbalized-sampling substrate

`propose` already emits N *deliberately different* candidates at once — distinct archetypes, themes
stepped across the perceptual spread, varied seeds/transitions — so you judge a **set** instead of
accepting the first mode. That is exactly Verbalized Sampling adapted to a chooser that selects
*design combinations*, not tokens. The upgrades below make the set provably diverse, labeled by
typicality, and remembered across runs.

```
python3 scripts/compose.py propose --n 5 --brand "ACME" --out-dir ./candidates
```

The diversity knob is `--n` plus the typicality filter below: higher `--n` = more spread; the
`p~` threshold decides how far into the "unusual tail" you are forced to look.

## 2. VS-CoT: verbalize typicality, then choose from the tail

Verbalized Sampling's strongest variant reasons first, then emits a *distribution with
probabilities*, then picks from the low-probability tail. For a composer, the "distribution" is over
design combinations and the probability must be **computed by `compose.py`, not guessed by the model.**

**Typicality score `p~` (computed in `cmd_propose`, printed as a column).** A weighted count of
"default/familiar" choices, normalized to [0,1]:

| Choice made | Adds to p~ |
|---|---|
| Uses the archetype's own `defaultTheme` | +0.30 |
| Each `featured`/starred component (vs a long-tail sibling) | +0.10 |
| First member of its SWAP_GROUP | +0.05 |
| The theme's default transition | +0.10 |
| Built-in scenes left centered | +0.10 |

Print candidates **sorted ascending by `p~`**, label the bottom half `UNUSUAL TAIL`, and add
`--max-typicality T` (default ~0.4) to drop anything above `T`.

**The rule (one objective everywhere — `taste.md` §2.11 and SKILL.md):** run `propose`; for each
candidate write its `p~` and ONE sentence defending its fit; then **pick the HIGHEST-quality
candidate (passes every `taste.md` §2 gate) from within the diverse set.** `p~` is a TIE-BREAKER
and a tail-floor, not the primary objective: among candidates of equal quality, prefer the lower-`p~`
(less generic) one, and reject any whose only virtue is a default `p~` above `--max-typicality` with
no rubric edge. Novelty for its own sake is also slop — `p~` measures *structural defaulting*, not
taste, so a low-`p~` combo can still feel generic. Quality first, diversity as the filter that stops
you shipping the one typical look. This costs one short reasoning pass; the critic only polishes.

## 3. Stop silently defaulting (fix the composer's own mode collapse)

Three concrete changes in `compose.py`, all deterministic:

1. **Theme picker.** When `--theme` is omitted, do NOT use `_meta.defaultTheme`. Instead pick the
   theme on `THEME_SPREAD` **farthest** (hue + lightness distance) from recently-used themes (see
   §5 ledger), and print: `no theme given -> chose X for maximum spread (not the default)`.
2. **Swap weighting.** In `_swap`, when a seed is active, weight the random choice **inversely** to
   how `featured`/first-in-group the sibling is, so the 78-component long tail surfaces.
3. **Default is opt-in only.** Keep `defaultTheme` reachable solely via an explicit `--theme default`
   that prints `using the typical theme for this archetype — justify per taste.md §2.11`.

## 4. Best-of-N over a DIVERSE pool (DPP / facility-location, not striding)

A best-of-N pick only works when the N are genuinely far apart (Diversity Quality Optimization,
arXiv 2509.04784, preprint — measure diversity as the volume spanned by *feature* vectors, a
determinantal point process). `cmd_propose` currently strides `THEME_SPREAD` deterministically — a
hand-rolled 1-D proxy. Replace it with real diverse-subset selection (numpy only, no new deps):

1. **Oversample** `M = 3·n` valid candidates across archetype × theme × seed.
2. `_features(spec) -> np.array`: `[theme hue, theme lightness, warm/cool flag, archetype one-hot(5),
   transition one-hot(4), multi-hot over the swap-groups present, energy scalar, density scalar]`.
3. `_select_diverse(cands, n)`: greedy **max-min / facility-location** — start from the lowest-`p~`
   candidate, then repeatedly add the candidate maximizing the *minimum* L2 distance to those already
   picked (a DPP-greedy proxy, ~20 lines, `(1−1/e)`-optimal).
4. Emit those n. The final pick = the **highest-rubric-quality candidate within the diverse set**
   (quality AND diversity jointly, per DQO) — not simply the most different.

## 5. Remember across videos (MAP-Elites archive + anti-slop ledger)

Single-shot diversity (§2–4) can't stop two separate runs for the same brand landing on the same
look. Add cheap per-brand memory.

**Behavior archive (MAP-Elites; In-context QD, arXiv 2404.15794).** Add `assets/behavior-axes.json`
with 3–4 discrete descriptor axes — `energy (calm|measured|kinetic)`, `density (sparse|balanced|dense)`,
`palette-temp (cool|neutral|warm)`, `era (classic|modern|futuristic)` — and a map from each archetype
and theme to its coordinates. After a successful compose, append the spec's cell to
`.local/archive.json` keyed by `--brand`. Add `--niche AXIS=BIN` and an auto mode that picks the
**emptiest / farthest cell** from what the brand already filled; `propose` spreads its candidates
across **distinct cells** (one elite per cell), not near-duplicates. Each new video now provably
differs from prior ones on named, defensible axes.

**Anti-slop ledger (Antislop backtracking, Paech et al., arXiv 2510.15061, preprint).** The "tokens"
here are design moves: opening component, `(archetype, theme)` pair, transition, end-card. Add
`.local/used-ngrams.json` (per `--brand`) recording recent moves; load it into the `used` set in
`_compose` so `_swap`, the theme picker and `TRANSITIONS` **penalize** recently-used moves and fall
back to them only when the fresh pool is exhausted. This is a **soft, backtracking ban — never a hard
one**, so `validate()` can never fail. Seed the ban-list from `taste.md` §1 failure signatures
expressed structurally (de-prioritize all-centered built-ins, the default purple→blue combination).
Expose `--forget` to clear the ledger.

## 6. Analogical conditioning: give the weak model a concrete target

A weak model reaches for the generic look because "make a promo" has no aesthetic anchor. Giving it a
named real-world reference to imitate pulls it off the mode (Analogical Prompting, Yasunaga et al.,
arXiv 2310.01714 — self-generated concrete exemplars beat generic zero/few-shot). Add
`references/design-references.md`: a table of ~12 named references, each mapped to concrete
`(theme, archetype, component bias, motion note)`:

| Reference | Theme | Archetype | Component bias | Motion |
|---|---|---|---|---|
| Swiss editorial poster | paper-ink | calm-explainer | editorial/quote, no FX | slow, anchored thirds |
| 80s VHS teaser | sunset-warm | launch-hype | glitch/scramble, scanline | punchy, overshoot |
| Brutalist terminal UI | terminal-green | screen-demo | typewriter, matrix-decode | hard cuts, none-transition |
| Luxury fashion title card | royal-gold | kinetic-promo | logo-sting, serif display | slow hero land, deep holds |
| Blueprint / technical | ocean-steel | data-story | line/bar chart, grid | measured, confirm-only |
| Risograph zine | cyber-magenta | kinetic-promo | gradient-sweep, bokeh | kinetic caps, push |

Add `--reference NAME` (and a `references` subcommand to list them) that biases theme/archetype/
component selection toward that row. **Workflow:** first name 2–3 references you'll imitate for the
brief (self-generated exemplar), *then* compose conditioned on them — never compose blind.

## 7. The operational loop (put it together)

```
1. Name 2-3 design references for the brief (taste.md §4 tone card + §6 reference table).
2. compose.py propose --n 5 --brand X [--reference NAME] [--max-typicality 0.4]
     -> N candidates, each labeled p~, spread by DPP, across distinct archive cells,
        penalizing this brand's recently-used moves.
3. For each: write p~ + one sentence (is this the generic choice or not?).
4. Render each hero frame; apply the taste.md §2 rubric (bounded critic loop, §3 there).
5. Pick the LOWEST-p~ candidate that still passes the rubric. Justify any high-p~ pick.
6. On success, compose.py records the chosen cell + moves to the brand ledger/archive.
```

Every step is local, deterministic code or data. Nothing here calls a paid API or a generative
video/image/text model — the "sampling" is over your own catalog of archetypes, themes and 129
vetted components, not over model tokens.
