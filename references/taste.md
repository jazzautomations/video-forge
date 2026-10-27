# Taste: teaching a weak model to design, not to slop

You can't install taste. But most of what taste *does*, a machine can check. Taste is a short
list of decisions a trained eye makes fast and a careless one skips. Encode those decisions as
(1) constraints the render cannot violate, (2) named exemplars that set the bar, and (3) a
**bounded critic pass** that judges the frame against a **binary, relative, multi-criterion**
rubric and fixes it. That is the whole trick: make good the default and make slop *fail a check*.

This skill already does the constraint half (locked tokens, deterministic type-fit, vetted
palettes, `motion-principles.md`, `anti-sameness.md`). This file adds the judgment half. For the
COMPOSER side — how to get a non-repetitive, non-default *candidate set* in the first place — read
`references/anti-sameness.md`; this file assumes you already have candidates to judge.

## 0. How to read the rubric (binary · relative · multi-criterion)

- **Binary.** Every criterion in §2 is a yes/no with a number attached. "Looks nice" is not a
  verdict; "hero text is 2.1x the body size → yes" is. If you can't answer yes/no, you haven't
  looked hard enough.
- **Relative.** You are never scoring one frame against perfection — you are ranking the
  candidates `compose.py propose` gave you against each other, then polishing the winner. The
  question is always "which of these is best, and is it good enough to ship," not "is this ideal."
- **Multi-criterion.** A frame must clear *every* gate below, not average out. One hard "no" on
  Focal/Contrast/Restraint sinks it even if the other nine are perfect. Slop is usually one
  catastrophic miss, not ten small ones.

## 1. What AI slop looks like (the failure signatures)

If a frame has any of these, it reads as generated. Treat each as a bug, not a style choice.

- **No hierarchy.** Three things the same size; the eye has nowhere to land first. Fix: one
  focal element; everything else at least one scale step smaller/quieter.
- **Everything centered.** Centered title, subtitle, everything, floating in the middle. Fix:
  anchor the focal element to a margin or a thirds line. Dead-center is allowed ONLY for a
  deliberate symmetrical beat (logo sting, end card).
- **Too much.** 4 fonts, 6 colors, a gradient, a glow, a shadow and an emoji. Fix: ≤2 type
  families, one accent, earn every effect. In doubt, remove it.
- **Default everything.** Purple→blue linear gradient, pure `#000`/`#fff`, 8px radius, a generic
  sans at one size, the archetype's own default theme chosen because nobody chose. Fix: a toned
  (not pure) base, a type *scale*, an accent spent sparingly — and see `anti-sameness.md` for why
  "I didn't pick" is itself the slop.
- **Filler.** Lorem text, a stock photo of people pointing at a laptop, an icon that means
  nothing. Fix: real words, real numbers, or nothing. Empty space beats filler.
- **Dead motion.** Everything fades in at once, linear, 1s, forever looping. Fix: stagger, ease
  out, hold, then leave with intent. (Numbers live in `motion-principles.md`.)

## 2. The taste rubric (judge every hero frame against this)

Score each item yes/no. **Any "no" on 1, 2 or 4 is a hard fail; any other "no" is a fix before
delivery.** These are checkable in one look or with one measurement.

1. **Focal point** — can you name, in under a second, the one thing to read first? If two things
   tie, hierarchy failed.
2. **Contrast** — focal text clears ~4.5:1 on its background, and the accent is the *only* other
   thing competing for attention.
3. **Type hierarchy** — the largest and smallest text in the frame differ by **≥3 scale steps
   (~2x)**; **≤3 distinct sizes** in one frame; one declared ratio for the whole film. At a tight
   ratio (≤1.25) hierarchy comes from weight/color/spacing, not size alone.
4. **Restraint / accent budget** — ≤2 type families; the accent sits on **≤1 element and ≤~10% of
   frame area**; the toned-neutral base carries ~60%, secondary surfaces ~30% (the 60/30/10 rule).
   If the accent is a background wash or on two competing elements, it is no longer the accent —
   cut it back.
5. **Alignment & rhythm** — edges line up to one grid; the focal element is anchored to a margin
   or thirds line (not dead-center unless deliberate symmetry); every gap comes from the
   **8/16/32/64** scale. Nothing floating 11px off a baseline.
6. **Air** — **≥8–10% of the frame is clear on every side** (title-safe); the hero stays inside
   it. Crowding to the edges reads cheap and risks platform cropping.
7. **Letterform spacing** — display text (≥48px) is tracked **tight (−0.01 to −0.03em)** with
   leading ~1.05–1.15; caps labels/eyebrows are **letter-spaced open (+0.05 to +0.15em)**; body
   text keeps leading 1.4–1.6 and **never** negative tracking. Default-spaced caps is the #1 tell.
8. **Specificity** — the words and numbers are real and particular, not placeholder-generic.
9. **Motion** — every move has a *job* (orient / confirm / delight — delight rationed); entrances
   ease and stagger; there is a real hold; the exit is intentional. You can state the arrival
   order of elements in one sentence. (Values: `motion-principles.md`.)
10. **Coherence (across the whole film, not one frame)** — same palette, type, accent behavior,
    corner radius, grid and transition family in every scene; you can **name the film's ONE
    signature move** (a reveal, an accel, a recurring motif) and it recurs ≥2×, varying in
    intensity, not in kind.
11. **Intent** — every choice survives one sentence of defense: "it's centered because this is the
    symmetrical end-card," never "it's centered because that's the default." For the theme/archetype
    choice specifically, the defense is its typicality score and reference (see `anti-sameness.md`).

## 3. The bounded critic loop (how the model actually applies taste)

Taste is iterative — but the loop must terminate. Bound it so a weak model can't spin.

```
BUDGET: at most 3 fix passes per hero frame. Fix highest-impact first; stop early when
every rubric gate is "yes," or when the budget is spent and the best candidate is shippable.

1. Render the HERO FRAME of each candidate scene (the held moment), not frame 0.
   (scripts/still.py --frame N --out hero.png renders ONE frame in seconds; or ffmpeg look.py on a clip.)
2. LOOK. Walk §2 out loud, naming each miss with its number/measurement.
3. RANK the candidates relative to each other on the hard gates (1,2,4). Keep the best;
   discard the rest unless you will synthesize across them.
4. FIX the smallest thing that removes the most slop, in this order:
   hierarchy/restraint (1,3,4) -> color/spacing/air (5,6) -> letterforms (7) -> motion (9).
5. Re-render that one frame. Repeat from 2 until all gates pass OR 3 passes are used.
6. Only then animate and render the full scene.
```

The driving model is the critic: it renders a frame, **sees** it, and scores it against §2. A
vision model that can look at the frame is the judge; a model that only reads code is guessing and
must say so (`agent-workflow.md` step 9 — never claim a vision check you did not run).

## 4. Exemplars — the positive north stars (match a brief's tone to one)

A weak model defaults to the generic look because it has no concrete target. Before composing,
name the 1–2 cards below whose *feel* matches the brief's adjectives, then let that steer theme and
motion. These are tone anchors; the named-reference table in `anti-sameness.md` is the finer knob.

- **CALM-PRECISE** (Stripe/Vercel-like): toned near-mono base, one confident cool accent, ease-out
  ~250ms, generous air, large restrained type. Themes: `ocean-steel`, `electric-indigo`.
- **MINIMAL-FAST** (Linear-like): deep dark ground, one cool accent, snappy 150–200ms moves, tight
  grid, almost no decoration. Themes: `midnight-lime`, `mono-noir`.
- **MONUMENTAL** (Apple-like): huge display type set tight, deep negative space, slow confident
  holds, one hero per frame, color almost absent. Themes: `mono-noir`, `royal-gold`.
- **EDITORIAL-PRINT** (Pentagram-like): serif, asymmetric thirds grid, warm paper ground, one hot
  accent, type as the image. Themes: `paper-ink`, `royal-gold`.
- **BOLD-PRODUCT** (energetic launch): one saturated accent on dark, kinetic caps, push/wipe
  transitions, punchy staggers. Themes: `cyber-magenta`, `sunset-warm`.

## 5. Where taste is pre-loaded for you

- **Themes** (`assets/themes.json`) — pre-composed palettes + type + transition. Pick one; don't
  mix hues across a video.
- **Archetypes** (`assets/archetypes/`) — pre-composed hierarchies and pacing. The structure is
  already tasteful; you supply the words. (5 ship: `kinetic-promo`, `calm-explainer`, `data-story`,
  `launch-hype`, `screen-demo`.)
- **EditorialTitle** computes a fitting type size and sets hierarchy for you; trust it.
- **Tokens** (`library/primitives/`, `library/vendor/onda/lib/`) hold the easing/stagger/hold/type
  defaults; `motion-principles.md` documents them. Don't fight them, don't hardcode around them.

The remaining ~10% — which theme fits *this* brand, which word to emphasize, when to break a rule
on purpose — is the part that is genuinely taste. The rubric won't hand you that. It will stop you
shipping the 90% of slop that has nothing to do with taste and everything to do with skipping the
checklist and taking the default.
