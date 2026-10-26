# Reuse library

Search `python3 scripts/catalog.py QUERY` from the skill root. Results name the actual
source/schema or an upstream install command. `--local` excludes upstream registry
items; `--engine` narrows discovery. Do not load every source into context.

| Source | Bundled code | Integration |
|---|---|---|
| RenderComp | 50 scenes | Copy a component; use exported default props/FPS/duration. Characters, typography, charts, transitions. |
| Curvable | 14 scenes | Defaults + duration helpers. Some scenes need ogl/fonts/CanvasKit. |
| Onda | 70 components + 18 transitions | Preserve lib/registry relative paths, parse Zod defaults, load theme/fonts. |
| FFmpeg skill | 42 public Python tools | Read selected --help, use --dry-run/--json; FFmpeg on PATH. |
| Blender skill | 14 public Python tools | JSON host wrappers + bpy; requires Blender executable. |
| HyperFrames | 456 upstream registry entries indexed | These are discovery records, not locally bundled/tested assets. Inspect/install selected item. |

Source snapshots are under vendor/, with original LICENSE and UPSTREAM.json. They
are not all claimed to be integration-tested. Keep them unchanged and adapt copies
in the video project. Imported runtime dependencies retain their own terms.

## Authored reusable parts

- primitives/: tokens, easing and font loading for the original React scenes.
- scenes/: TitleCard, LowerThird, CountUp, KineticText, GradientBackground.
- scenes/ScreenFocus.tsx: source-space pan/zoom, opaque timed masks, cursor/clicks.
- scenes/MotionCaptions.tsx: paged word-timed captions and active-word motion.
- scenes/ProceduralObject3D.tsx: real Three.js mesh, material, lights and camera.
- templates/ProductPromo.tsx: four beats, explicit 15-frame overlaps; exactly 315 frames.
- hyperframes/editorial/: self-contained four-second HTML/GSAP title starter, pinned deps.

## Reuse-first project path

`assets/storyboard-example.json` plus `scripts/build_project.py` compiles a small
parameterized project without asking a model to write a renderer. Choose this when
the brief fits. For advanced shots search the wider catalog and inspect the selected
implementation. Build a hero frame, then motion; verify the actual final export.
