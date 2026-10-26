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
