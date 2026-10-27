# Motion principles — pro vs. AI-slop

The difference between a video that looks authored and one that looks generated is
almost never the content — it's the motion craft. Follow these ten rules. They apply
in any engine; the code examples are Remotion.

## The ten rules

1. **Ease everything. Linear motion is the tell.**
   Real objects accelerate and decelerate. Use `spring()` or an eased `interpolate()`
   (`Easing.bezier(0.16, 1, 0.3, 1)` is a reliable expressive ease-out). Raw linear
   ramps read instantly as robotic. (Disney: slow in / slow out.)

2. **Spring for enters and UI; linear only for continuous motion.**
   A tuned `spring({ frame, fps, config: { damping: 200 } })` gives organic
   overshoot/settle. Reserve linear for things that genuinely move at constant rate
   (a scroll, a steady rotation).

3. **Stagger, don't synchronize. Stage one idea per beat.**
   Offset entrances by a few frames and lead the eye to a single focal action at a
   time. Everything-moving-at-once is the #1 amateur signature. (Disney: staging.)

4. **Choreograph exits as deliberately as entrances.**
   Elements leave with intent (ease-in + a direction), never just pop out. Mirror the
   enter logic so the piece feels composed, not dumped.

5. **Timing: short, confident moves (~8–20 frames at 30fps) with real holds.**
   Too fast = chaos, too slow = dead. Let content rest long enough to read before the
   next move. Silence/stillness is part of the rhythm.

6. **Kinetic type: animate words as objects — mask/translate reveals, not fades.**
   Reveal text with a clip or slide + easing and a slight per-line stagger. Avoid lazy
   opacity fades; avoid per-letter animation unless it serves meaning.

7. **Continuity: transitions carry motion, they don't cut-and-fade.**
   Use directional or shared-element transitions (`@remotion/transitions`) so energy
   flows between scenes and motion direction stays consistent. Don't reset the eye at
   every cut.

8. **Hierarchy + restraint. Respect negative space.**
   One hero element, generous margins, few things moving at once. Over-decoration and
   constant motion are classic slop. When in doubt, remove.

9. **Lock a type scale and a limited palette as tokens.**
   2–3 sizes on a modular scale, one type family (+1 accent), 3–5 colors reused
   everywhere. Randomly varying size/color per scene is a dead giveaway of generated
   video. (See `library/primitives/` for ready tokens.)

10. **Finish: consistent fps, motion blur on fast moves, tight audio sync.**
    Pick 30 or 60 fps and keep it. Add motion blur on fast motion
    (`@remotion/motion-blur` `<Trail>` / `<CameraMotionBlur>`) so it doesn't strobe.
    Snap key visual hits to the beat or voiceover — unsynced audio cheapens otherwise
    great motion. (Disney: timing + polish.)

## The frame-addressability law (engine-level, non-negotiable)

Everything the agent animates must be a pure function of the current frame. Never use
self-playing clocks — `requestAnimationFrame`, R3F's `useFrame`, Lottie/Rive autoplay,
CSS `animation`/`transition`. During a render Remotion computes frames in parallel and
out of order, so any self-advancing animation flickers or desyncs. Always compute the
value from `useCurrentFrame()` and step external engines to `frame / fps`.

## References
- Disney 12 principles: https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation
- Remotion: animating-properties, spring, easing, transitions, motion-blur (append `.md` to each docs URL)
- Material motion: https://m3.material.io/styles/motion/overview · easings: https://easings.net

## Concrete motion defaults (2026 craft study)

Append/fold these CONCRETE defaults into references/motion-principles.md so a weak model matches numbers instead of guessing. They reconcile to the onda vendor lib as the single source of truth (library/vendor/onda/lib/motion.ts, easing.ts, text-timing.ts); the top-level library/primitives/ must be brought into line with them (see checklist). All frame counts are at 30fps — SCALE EVERY FRAME COUNT BY fps/30.

## Default timing table (30fps)
| Phase | Duration | Frames@30 | onda token |
|---|---|---|---|
| Micro / feedback | ~0.20s | 6f | DURATION.instant |
| Exit / small move | ~0.33s | 9–11f | DURATION.fast (≈0.6× the enter) |
| Standard entrance | ~0.60s | 15–18f | DURATION.base |
| Large / hero entrance | ~0.80s | 24f | DURATION.slow |
| Scene transition / seam | 0.20–0.30s | 6–9f | — |
| Minimum settled hold | ≥1.5s | ≥45f | DURATION.hold |
| Text hold (reading-gated) | round(fps·max(1.5, words·0.6)) | — | holdFramesForText(words,fps) |
Rule: exits leave ~0.6× as fast as they entered ("get out of the way faster than you came in"). Nothing >500ms without a stated emphasis reason.

## Easing by phase (springs for physical motion, bezier for opacity/color only)
- ENTER = decelerate: EASE_OUT = Easing.bezier(0.16,1,0.3,1) (house / onda HOUSE_EASE).
- EXIT = accelerate: add EASE_IN = Easing.bezier(0.3,0,1,1). (primitives/easing.ts is MISSING this; fadeInOut currently eases the out-segment with EASE_OUT — split it so exits accelerate.)
- ON-SCREEN MOVE = symmetric: EASE_IN_OUT = Easing.bezier(0.65,0,0.35,1).

## Springs — no fake pop
- SPRING_SMOOTH = {damping:200, stiffness:100, mass:1} — default, confident settle, no overshoot.
- SPRING_SNAPPY = {damping:120, stiffness:180, mass:1} — decisive, still overdamped (snappiness via higher stiffness, NOT lower damping).
- Bounce is opt-in only (rename primitives SPRING_BOUNCY → SPRING_PLAYFUL) for playful/energetic archetypes. NOTE: the current primitives/easing.ts SPRING_SNAPPY {damping:20,mass:0.6} and SPRING_BOUNCY {damping:12,mass:0.8} are UNDERDAMPED — they wobble, contradicting the no-fake-pop rule — and must be replaced with the onda values above.

## Stagger (one canonical token, capped cascade)
- STAGGER = 4f@30 (≈0.13s) between siblings; lists 2–4f (40–80ms), dense grids 1–2f (20–40ms).
- Cap the TOTAL cascade ≤0.6s: effective = min(STAGGER, round(fps·0.6)/max(1, n−1)). (KineticText hardcodes staggerFrames=3 — route it through onda staggerFrames() with this cap so long sentences don't land absurdly late.)
- Order the stagger along the reading path (top→bottom or focal-first); you must be able to state the arrival order in one sentence. Everything at t=0 is the #1 amateur tell.

## Overshoot by archetype (hero landing only, two-phase)
corporate/editorial/dashboard/calm-explainer 0–3% (onda OVERSHOOT=0.03) · modern/product 5–10% · playful 10–20% · energetic/sport/launch-hype 15–30%. Overshoot lives ONLY on the hero two-phase land (onda heroReveal), never on every element.

## Type scale (one ratio per film)
Pick ONE modular ratio: 1.2 / 1.25 (dense, UI) · 1.333 perfect-fourth (DEFAULT editorial/marketing) · 1.5 (dramatic display). Hero/display ≥3 scale steps above body (~2× the smallest on-screen text); ≤3 distinct sizes per frame. At ≤1.25, carry hierarchy with weight/color/spacing, not size. Add a typeScale token per theme and derive sizes as base·ratio^step.

## Letterform spacing (signed guardrails)
Display ≥48px: tracking −0.01 to −0.03em, leading 1.0–1.15 (the only place negative leading/tracking is allowed). Caps labels/eyebrows/kinetic stacks: tracking +0.05 to +0.15em. Body/≤~20px: tracking 0 to slightly positive, leading 1.4–1.6, NEVER negative tracking. (Tokens: displayTracking −0.02em, capsTracking +0.08em, displayLeading 1.08, bodyLeading 1.5.)

## Composition
- Accent budget 60/30/10: toned-neutral base ~60%, secondary ~30%, accent ≤~10% area AND ≤1 element. Base is a toned neutral, never pure #000/#fff.
- Grid: focal anchored to a margin or thirds line (dead-center only for a deliberate symmetrical beat); one column grid; every gap from the 8/16/32/64 scale.
- Air: keep ≥8–10% of the frame clear on every side (title-safe ≈154px/108px at 1920×1080); hero stays inside it. Encode a title-safe inset constant in build_project/layout primitives.

## Kinetic type = masked reveal, not a fade
Each word in display:inline-block; overflow:hidden box; inner element translateY from 100%→0 on SPRING_SMOOTH/EASE_OUT, NO opacity ramp, per-word stagger. (EditorialTitle already does this; KineticText currently does the forbidden opacity+24px fade — rewrite it to the mask pattern.)

## Transition grammar
(1) Never repeat the same seam on two consecutive cuts. (2) A directional push/wipe continues the outgoing scene's motion direction, never reverses it. (3) Reserve fade for a deliberate calm/section break; hard "none" cut for fast rhythmic sequences. (4) Every seam 0.2–0.3s. compose.py should alternate DirectedBeat styles across scenes rather than defaulting every beat to one.

## Frame rate
30fps = editorial/explainer/screencast/UI (house default, onda base) · 60fps = fast camera moves, sport, product spins · 24fps = deliberately cinematic only. Choose one and keep it. Consequence a weak model forgets: scale ALL frame-count defaults by fps/30 or motion tuned at 30 plays double-speed at 60. Shutter stays 180° regardless of fps.

## Motion blur — quantitative trigger
Wrap a layer in MotionBlur only when it displaces >~8% of frame width OR rotates >~30° within ≤8 frames (perceptible per-frame smear). SHUTTER {angle:180, samples:10} at all fps (15–20 samples for hero stings). Import the onda MotionBlur/MotionTrail primitives; never wrap a static scene.

## Audio sync
Land the hero's motion RESOLUTION (its settle, not its start) on the stressed word / musical downbeat: entranceStartFrame = keywordOnsetFrame − entranceDurationFrames, using the existing Whisper word timestamps. Quantize scene cuts to the beat grid (cut on a downbeat, not mid-phrase); the DirectedBeat seam falls on a beat.

## Every animation has a job + min-hold contract + signature move
- JOB: every move must ORIENT, CONFIRM or DELIGHT (delight rationed). Motion whose only answer is "it moves" is cut.
- MIN-HOLD: every scene has a settled window (full opacity, no transform change) ≥ max(entrance duration, holdFramesForText(words,fps)). verify_video.py/the critic should flag scenes that animate continuously as a slop failure.
- SIGNATURE MOVE: name the film's ONE repeated behavior (reveal/accel/motif); it recurs ≥2×, intensity varies, kind does not. Add a signatureMove field per archetype JSON. Repeat-exposure test: would it still read on the 10th watch? No infinite hero loops, no one-shot gags.
