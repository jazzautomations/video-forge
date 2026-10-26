---
name: video-forge
description: "Create polished videos with code: narration, motion captions, screen capture, zoom, redaction, 3D and reusable libraries. Use for promos, explainers, demos and editing."
license: MIT
---

# Video Forge

Make an editable project and a finished video. Use the toolbox together: HTML/GSAP,
React, FFmpeg, recordings, SVG, sprites, footage, audio and 3D. Choose tools per scene;
preserve an existing project's engine. Visuals are authored in code or sourced from
existing media. Do not substitute generative video/image or talking-head models.
Narration synthesis and speech transcription are allowed audio tools.

Paths are relative to this directory, wherever installed. No private MCP, particular
agent/model, author's home directory or paid service is required by this skill.

## Golden path — for a complete video, do exactly this

Do NOT explore the code, hand-author assets, or hand-tune pixels. The code owns all
layout, font-fit and narration-timing math. You only edit text and parameters in one
small JSON file. Run these four steps in order:

```bash
# 1. Prepare the local environment ONCE (project-local Python + audio models)
python3 <skill-dir>/scripts/setup_environment.py --out .video-forge-tools --audio

# 2. Copy the shipped storyboard; edit ONLY its text/seconds/colors/components.
#    Rewrite the whole file with Write — never do exact-match/surgical edits.
cp <skill-dir>/assets/storyboard-production.json ./storyboard.json

# 3. Validate, then render to MP4. run.py is THE entrypoint: it picks the prepared
#    interpreter and model paths and runs voice→captions→scenes→sound→render→checks.
python3 <skill-dir>/scripts/build_project.py ./storyboard.json --check
python3 <skill-dir>/scripts/run.py ./storyboard.json --out ./film
#    run.py BLOCKS until the MP4 is done. If interrupted, resume the SAME command with
#    --resume (do not start over). If your bash calls time out, add --background and poll
#    with production_job.py status instead.

# 4. Verify the real file
python3 <skill-dir>/scripts/verify_video.py ./film/out/final.mp4 --require-audio
```

Rules for a weak model: the storyboard JSON is the ONLY thing you edit. Never invoke
`produce.py`/`build_project.py` with system `python3` for the full video — always go
through `run.py`. Never edit a `.tsx`/`.py` source file to change size, layout or text;
pass it as a storyboard parameter instead. If a title or card looks wrong, change its
JSON value, not its code — the layout math is deterministic and already fits the frame.

## Start with the smallest useful context

Read [workflow](references/agent-workflow.md). Infer defaults from the brief and
supplied brand/reference. Ask only for material missing decisions. For a new project
save `DESIGN.md` and `STORYBOARD.md`: one purpose per scene, duration, renderer,
asset, camera move and audio cue. Match dimensions/fps before mixing renderers.

For a complete promo/tutorial, the default is the **production recipe** above, not the
old silent four-kind smoke test. Read [production direction](references/production-direction.md)
and start from `assets/storyboard-production.json`. `scripts/run.py` carries the plan
through voice, word captions, coherent scenes, sound, render and export checks (it calls
`produce.py` for you using the prepared interpreter). If local audio dependencies are
absent, `scripts/setup_environment.py --out .video-forge-tools --audio` prepares a
project-local Python and reports model paths. This setup is reusable across coding
harnesses; it does not require an author's private environment. See production-direction.md.

For this path, start with the brief and production example; run the validator and
producer instead of touring every implementation or pre-checking every dependency.
The producer reports missing tools and concrete repair actions. Read its source only
when an observed error needs diagnosis.
The driving model chooses the message and scene parameters; proven code supplies
craft and correctness. Do not call "it filled a JSON" an end-to-end production test.

**Reuse-first mode** is the default: search the catalog, pick a demonstrated component,
fill its declared props, render a short proof, then compose. Read
[model-scaffolding](references/model-notes.md) when the agent struggles or when building
an evaluation. Custom code is appropriate when the catalog genuinely does not fit.

## Search actual code before inventing motion

```bash
python3 <skill-dir>/scripts/catalog.py 'character'
python3 <skill-dir>/scripts/catalog.py 'caption'
python3 <skill-dir>/scripts/catalog.py 'terminal'
```

For a brief that fits the starter's title/character/screen/3D vocabulary, have the
model fill `assets/storyboard-example.json` using `assets/storyboard.schema.json`:

```bash
python3 <skill-dir>/scripts/build_project.py ./storyboard.json --check
python3 <skill-dir>/scripts/build_project.py ./storyboard.json --out ./my-video
```

The compiler writes the project and only the dependencies its chosen scenes need.
Use the actual defaults rather than inventing a schema. For a complete video use the
golden path (`run.py`) rather than stopping at this bare silent scaffold.
It prepares actual speech, aligns the script to measured ASR spans, carries caption
times into the render, masters the soundtrack and exports a contact sheet.

See [library catalog](library/README.md). Bundled source, with upstream licenses:
- `library/vendor/rendercomp/`: 50 code-drawn scenes, typography, transitions, charts,
  and SVG characters. Each component exports defaults, FPS and duration.
- `library/vendor/curvable/`: 14 parameterized launch-video scenes; inspect optional
  shader/font/WASM dependencies before using a component.
- `library/vendor/onda/`: components, Zod schemas, transitions and composition helpers.
  Parse defaults through the schema; preserve relative imports and load theme/fonts.
- `library/vendor/ffmpeg/`: executable local Python editing helpers: cuts, joins,
  zoom/reframe, pixelation/blur, animated captions, grade, mix, silence, export and QA.
- `library/vendor/blender/`: executable headless Blender helpers for inspection,
  scene assembly, conversion, optimization, baking and renders. Requires Blender.

Do not read every library at once. `UPSTREAM.json` records provenance and LICENSE
retains upstream terms. Their code is not automatically tested by being bundled.

## Route by the job

| Work | Read / use |
|---|---|
| HTML motion, GSAP, registry blocks | [HyperFrames](references/hyperframes.md) |
| React composition / data batches | [Remotion](references/remotion-core.md), [parameters](references/parametrization.md) |
| Footage edit, grade, speed, audio, final assembly | [FFmpeg](references/ffmpeg-assembly.md) |
| Capture browser/desktop, cursor camera, zoom, censor | [screen recording](references/screen-recording.md) |
| Characters, illustrations, 3D assets | [characters](references/characters.md), [asset sourcing](references/asset-sourcing.md) |
| Procedural geometry, camera, lights, materials, rigging | [3D](references/three-and-blender.md) |
| Narration, word timings, motion captions, sound | [audio and captions](references/audio-captions.md), [sound design](references/sound-design.md) |
| Tool comparison and mixed-engine plans | [routing](references/engine-routing.md) |

For downloaded clips/stock use [media pipeline](references/media-pipeline.md).
For motion decisions use [motion principles](references/motion-principles.md).
Check [research](references/research.md) for studied skills/libraries and why they fit.
See [external libraries](references/libraries.md) (and `research/libraries-catalog.json`)
for a license-vetted routing map: what is safe to bundle vs cite for each kind of job.
The HyperFrames registry is another reuse source; query it before building an effect.
Use installed `--help`; its contract can differ from today's upstream skill.

## Verification is part of production

Build the hero frame before animating. Every frame must be seekable in arbitrary
order: no wall clock, unseeded randomness, live network dependency or autonomous
animation loop. HyperFrames uses registered paused timelines; Remotion uses frames.
Render representative frames and view them; inspect entrances, holds, cut boundaries,
caption changes and the end. Fix clipping, unreadable text, dead air and audio sync.

When asked for a video, export the complete file. A still is not completion.

```bash
python3 <skill-dir>/library/vendor/ffmpeg/scripts/probe.py final.mp4 --json
python3 <skill-dir>/scripts/verify_video.py final.mp4 --require-audio
python3 <skill-dir>/library/vendor/ffmpeg/scripts/look.py final.mp4 --tiles 3x2
```

Probe AND decode the final export. Confirm planned duration, dimensions/fps and audio.
Actually inspect the contact sheet. Audition audio when playback is available; state
when only technical audio checks were possible. Redaction requires checking every
relevant interval after camera transforms, and censoring audio if it contains the secret.

Deliver the playable video, editable project, actual checks and any real dependency
limitation. Preserve originals. Do not publish/upload, spend credits or install system
software unless the request authorizes it. Existing authorization remains valid.

## Model and evidence discipline

Use structured plans, a small shortlist, schema defaults and executable helpers to
reduce the decisions a weaker model must invent. Return concrete errors to the model
and change the smallest failing part. Read [evaluation](references/evaluation.md) for
paired strong/weak-model tests. Do not claim parity with a stronger model without
measuring it. Recovery state belongs in the project, not in an enormous prompt.

Our own code is MIT. Engines/assets/voices keep their own licenses. Optional tools
are installed only when needed. Study the Katana reference workflow, but never assume
Higgsfield's hosted models are a local code renderer or that desktop Katana has a CLI.
