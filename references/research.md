# Research decisions — 2026-10-26

This is a source review, not a leaderboard. Raw source snapshots and inspected skill
files are in research/upstream/ in the authoring workspace; consumer installs need
only the vendored modules and this routing guide. UPSTREAM.json records source trees.
Different files can disagree about catalog counts or licensing: inspect actual files.

## Libraries with runnable code

| Project | What was inspected | Decision |
|---|---|---|
| [RenderComp](https://github.com/RenderComp/free-remotion-templates) | Component implementations, defaults, root registry, package and ASSETS inventory | Bundle its 50 MIT code-only scenes. Includes WaveHello/CharacterJumping, type, chart, logo and transition scenes. System-font defaults need deliberate replacement for consistent renders. |
| [Curvable](https://github.com/Curvable/motion) | Text components, public props, computeDuration helpers and dependency notes | Bundle its 14 MIT scenes. Use declared duration helpers. Some scenes need ogl, fonts or CanvasKit assets; do not describe all scenes as dependency-free. |
| [Onda](https://github.com/degueba/onda) | Terminal, Captions + schemas, placement helpers, composition payload contract | Bundle MIT components/transitions/lib. Schema.parse supplies defaults; preserve import paths. Timeline entries use explicit seconds; output is frame-driven. |
| [Remotion Bits](https://github.com/av/remotion-bits) | Source tree, package metadata, examples/inventory | Good candidate for text, particles and 3D. Package declares MIT but sampled repository snapshot lacked a standalone license; reference rather than silently relicense/vendor. |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | Installed pack, current upstream skills, CLI --help, registry manifest | Index upstream items, install only selected ones. Bundled CLI 0.8.201 and upstream main have contract drift; installed help/source controls executable syntax. |
| [SwiftClip](https://github.com/zz41354899/SwiftClip) | Repository metadata/tree and official resource listing | Template candidate, not a verified dependency. Do not bundle merely on a marketing claim. |

## Skills and production systems

### video-shotcraft
[Source](https://github.com/Vincentwei1021/video-shotcraft). Read SKILL, pipeline,
final-review, music-beat-sync and PageCam implementation. Valuable mechanisms:
measured shot recipes, source-linked visual variants, screenshot-camera keys,
shot-level rendered evidence, and sound cues. PageCam is 2.5D over screenshots,
not a substitute for geometry. It is Apache-2.0, not our MIT code. Reference its
workflow; do not import its full large demo/media tree or mandatory collaboration
rules into our skill. Its root README and SKILL may report different catalog sizes.

### browser-use/video-use
[Source](https://github.com/browser-use/video-use). Read SKILL and helper inventory.
Useful: transcript-first editorial decisions, EDL persistence, source-to-output time
mapping, shifted overlay PTS, cut-boundary checks and audio measurement. Its default
Scribe/ElevenLabs dependency is not required in our pipeline. Its blanket approval,
subagent and hardcoded edit-directory rules are specific to that skill, not copied.
A stream-copy concat is appropriate only after matching intermediates.

### kajisho5/ffmpeg-skill
[Source](https://github.com/kajisho5/ffmpeg-skill). Read SKILL, redact/render helpers,
process runner and CLI contracts. Bundle its MIT scripts, templates and references.
Includes dry-run/JSON, probe, frame-accurate versus keyframe cuts, scene/silence
analysis, graphics, animated captions, audio processing, grade, export and contact
sheets. Redact operates on a fixed known rectangle; it neither detects nor tracks
faces. Its verify.py is a broad real-footage regression kit, so use our lightweight
verify_video.py for ordinary delivery decode checks.

### kajisho5/blender-skill
[Source](https://github.com/kajisho5/blender-skill). Read SKILL and scene wrapper/help.
Bundle MIT helpers: the host passes a JSON payload to headless bpy and reads a JSON
result. Good for inspection, conversion, optimization, scene assembly, bake and
turntables. Blender is an external dependency; bundling Python does not install it.

### ProkStudio rigging and animation
[Source](https://github.com/ProkStudio/skills/tree/main/skills/blender/blender-rigging-and-animation).
Read its rigging skill. Useful: deformation topology, bone alignment/roll, joint
weights, IK/FK controls, staged blocking/spline and export/baking constraints. This
is specialist knowledge rather than a one-command character generator.

### VideoZero / Motion Canvas
[Source](https://github.com/VideoZero/skills). Read README, motion-canvas and
motion-canvas-agent skills. Provides animation guidance and editor HTTP seek,
screenshot, scene graph/settings and render integration. Requires the running
editor/client plugin. Use when that authoring model fits; do not add a second editor
to a simple Remotion project.

### BrewReel
[Source](https://github.com/Finderchangchang/brewreel). Read SKILL and source tree.
Its recipe illustrates a compact model output (storyboard JSON) driving prewritten
video scenes, a useful approach for weaker models. Promo, talking-head and lesson
lanes are separate. Current SKILL frontmatter and repository metadata gave different
license indicators; do not vendor until the exact subtree terms are settled. Exclude
its image-generation lane from our code-visual workflow.

### animation-techniques-kit
[Source](https://github.com/platan821/animation-techniques-kit). Read technique
chooser and source inventory. Distinguishes runnable components from explanatory
recipes; useful for measured reference breakdown and beat grids. Do not count every
listed technique as shipped implementation.

### remotion-motion-graphics-skill
[Source](https://github.com/fernandokaraka/remotion-motion-graphics-skill/tree/main/skills/remotion-motion-graphics).
Read its actual nested SKILL path. Useful focus on standalone overlays, lower-thirds
and alpha export for other editors. Root SKILL.md does not exist in that snapshot;
verify paths rather than assume all repos have the same layout.

## Katana: two different projects

[Higgsfield Katana](https://higgsfield.ai/blog/higgsfield-katana): reference edit +
character/product images + instructions → a hosted re-created edit through Higgsfield
models/MCP and account credits. Study the separation of reference shot structure,
assets and edit instructions. It is not a local pure-code export engine and is not
required for Video Forge. No credits were spent and no media was uploaded in research.

[milanofthe/katana](https://github.com/milanofthe/katana): read README and Rust
export/project implementation. MIT desktop Svelte/Tauri editor using native FFmpeg.
Useful for multitrack placement, typed project data, matching preview/export fonts
and a restricted stream-copy fast path. Export builds a real filter graph; this
review did not establish a public headless CLI. Do not invent one.

## Recording and internet elements

[OpenScreen](https://github.com/siddharthvaddem/openscreen): README documents MIT,
zoom/cursor, blur, crop/speed and platform capture differences. Candidate desktop
recorder; browser proof here uses [Playwright recording](https://playwright.dev/docs/videos).
[Cap](https://github.com/CapSoftware/Cap) has native recording/editing ideas, but
most source is AGPLv3; only specified crate families are MIT. Do not vendor it into
an MIT library as though all source had the same terms.

Asset sources reviewed: [Kenney](https://kenney.nl/support) (CC0 asset pages),
[Poly Haven](https://polyhaven.com/license) (CC0 models/HDRIs/textures),
[Open Doodles](https://www.opendoodles.com/) (editable people/objects). Runtime
licenses do not automatically cover artwork downloaded from a community library.

## Model behavior: transferable mechanisms

Primary engineering sources:
- [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

Our inference: concise discovery, explicit tool contracts, executable validators,
reference-linked examples and small repair steps can reduce avoidable model errors.
We externalize component defaults, timing math, encode details and scene recipes.
We have not established weak/strong parity. Follow evaluation.md before making that
claim. Neither model marketing descriptions nor one hand-authored demo proves it.
