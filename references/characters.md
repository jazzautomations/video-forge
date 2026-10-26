# Characters as reusable animated assets

Select a suitable character by context and style: SVG rig, sprite sheet, authored
Lottie, supplied 3D rig. Check asset-sourcing.md for actual sources. The bundled
RenderComp library already includes WaveHello, CharacterJumping, ThinkingBubble and
CommunityChat scenes. Inspect those before drawing new puppets.

Keep a character sheet: source asset, palette, scale, facing, anchor and states
(idle, enter, point, talk, celebrate). Reuse the same design across scenes. Animate
an SVG's logical groups with explicit pivot points; move an arm around its shoulder,
not the viewport origin. For sprites map time to a cell deterministically.

Lottie runtime and animation licenses differ. Use Remotion's integration or explicit
frame seeking. Rive is usable only with an adapter that resets/replays deterministically;
advancing a state machine by the delta from a previously rendered frame is unreliable
when a renderer seeks out of order.

For real 3D see three-and-blender.md: use skeletal actions, keyframes and shape keys;
seek the animation mixer to absolute time or render a Blender image sequence. Mouth
poses can follow phoneme/timing data from narration. Do not add neural face/video
synthesis to this code-rendering workflow.
