# Compose tools per scene

Preserve existing projects. For new HTML/CSS motion start with HyperFrames; use
Remotion for React, typed props and its reusable scenes. Use FFmpeg directly for
edits that do not need new graphics. No tool must appear just to check a box.

| Job | Tool | Export / reuse |
|---|---|---|
| HTML kinetic type, UI, diagrams | HyperFrames + GSAP | Registry blocks and components; local HTML; MP4/alpha formats |
| React launch scenes, charts, schema-based batches | Remotion | Bundled RenderComp, Curvable, Onda; explicit composition render |
| Trim, grade, concat, captions, mix, censor | FFmpeg | Bundled helpers with JSON results and dry-run |
| True 3D geometry, cameras, materials | Three.js/R3F or Blender Python | Frame-driven render or image sequence; see three-and-blender.md |
| Equations / algorithm diagrams | Manim or Motion Canvas | Use their own render/export pipeline; normalize into final video |
| Real screen demonstration | Playwright capture / desktop recorder | Keep capture and telemetry; camera/caption layers added afterward |

Mixed example: HTML title → recorded product interaction → React chart → Blender
product turntable → HTML CTA. FFmpeg normalizes clips and mixes narration, music and
SFX. Keep a scene manifest with exact durations and frame boundaries. This is an
example, not a mandatory five-part format.

GSAP is valid in HyperFrames because the renderer seeks its paused registered
timeline. A normal browser autoplay loop is not the same contract. 2.5D CSS planes
are useful, but do not claim they are a modeled/rigged 3D scene.

Read installed CLI help. The checked-in source snapshot is the reference for bundled
components; today's upstream documentation may describe a later API. Pin versions in
project package locks. Source license, runtime license and asset license are separate.
