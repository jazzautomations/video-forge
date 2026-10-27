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
layout, font-fit and narration-timing math. You pick an **archetype** (the structure) and
a **theme** (the look); `compose.py` stamps them into one valid storyboard JSON; then you
edit ONLY that file's text/seconds/numbers. Run these steps in order:

```bash
# 1. Prepare the local environment ONCE (project-local Python + audio models)
python3 <skill-dir>/scripts/setup_environment.py --out .video-forge-tools --audio

# 2. Look at the menus, then COMPOSE a storyboard. Choose the archetype that fits the
#    brief's JOB and the theme that fits the brand's FEEL — see "Make every video
#    different" below. compose.py writes a VALID, fully themed storyboard.
python3 <skill-dir>/scripts/compose.py archetypes   # structures: promo / explainer / demo / data / hype
python3 <skill-dir>/scripts/compose.py themes        # 9 palettes + fonts + transitions
python3 <skill-dir>/scripts/compose.py new \
    --archetype kinetic-promo --theme sunset-warm --brand "ACME" --out ./storyboard.json
#    Add --seed N to re-arrange interchangeable scenes for a fresh take.
#    Then edit ONLY the text/narration/seconds/numbers in ./storyboard.json.

# 3. Validate, then render to MP4. run.py is THE entrypoint: it picks the prepared
#    interpreter and model paths and runs voice→captions→scenes→sound→render→checks.
python3 <skill-dir>/scripts/build_project.py ./storyboard.json --check
python3 <skill-dir>/scripts/run.py ./storyboard.json --out ./film
#    run.py BLOCKS until the MP4 is done. If interrupted, resume the SAME command with
#    --resume (do not start over). If your bash calls time out on the long render, add
#    --wait: it runs the render as a durable job but still blocks in that ONE command until
#    the file is done (then exits with its code) — no hand-rolled poll loop to babysit, which
#    is what you want for an autonomous/weaker agent. (--background alone returns immediately
#    and leaves you to poll production_job.py status; prefer --wait.)

# 4. Verify the real file
python3 <skill-dir>/scripts/verify_video.py ./film/out/final.mp4 --require-audio
```

**Make every video different — this is the point of compose.py.** The old failure mode of
this skill was shipping the same green-on-dark five-beat film every time. Do not repeat it.
Pick deliberately:
- **Archetype by the job:** launch/teaser → `kinetic-promo` or `launch-hype`; teaching or
  pitch → `calm-explainer`; product walkthrough with a recording → `screen-demo`;
  results/metrics → `data-story`.
- **Theme by the brand feel:** 9 ship (`compose.py themes`) — e.g. `paper-ink` (light
  serif), `terminal-green` (dev/hacker), `royal-gold` (luxe), `ocean-steel` (corporate),
  `cyber-magenta`/`electric-indigo` (bold tech), `mono-noir` (minimal). 5 archetypes × 9
  themes = 45 distinct looks before you touch a word; `--seed` multiplies that.
- **Real fonts, vendored & local:** each theme pairs a DISPLAY font (headlines) with a
  TEXT font (body) — e.g. Space Grotesk/Inter, Noto Serif Display/Noto Serif, JetBrains
  Mono, Bricolage Grotesque. They are SIL OFL `.woff2` in `assets/fonts` (subsetted, no
  download), copied into each project's `public/fonts` and loaded via `delayRender` so the
  render never falls back to Arial/Georgia. compose.py stamps `displayFont`/`textFont` and
  the per-font `titleAdvance` that keeps the title-fit math safe. This is the single biggest
  lift over system fonts — don't bypass it by hand-setting a bare `fontFamily`.
- Never ship the `midnight-lime` / WOHACKERS defaults unless the brand truly is lime-on-dark.
  If asked for options, compose 2–3 with different theme/`--seed` and compare frames.

**The variety + taste pass (do this, not the default).** Diversity collapse is real: a model
left to itself ships the one typical look. So force a diverse candidate set, then judge it:

```bash
# 1. Emit N DELIBERATELY DIFFERENT candidates (distinct archetype + spread themes + seeds)
python3 <skill-dir>/scripts/compose.py propose --n 3 --brand "ACME" --out-dir ./candidates
# 2. Render each candidate's HERO FRAME (the held moment) in seconds, and LOOK at it
python3 <skill-dir>/scripts/still.py ./candidates/candidate-1.json --frame 90 --out hero1.png \
    --node-modules <an-already-installed project's node_modules>   # repeat per candidate
# 3. GATE deterministically (free): static palette/fit + measured pixel gates. A fail = fix, don't ship.
python3 <skill-dir>/scripts/lint_taste.py ./candidates/candidate-1.json      # contrast, <=2 fonts, fit floor
python3 <skill-dir>/scripts/lint_frame.py hero1.png --storyboard ./candidates/candidate-1.json  # accent budget, air
# 4. Score each hero frame against references/taste.md §2 (binary, relative gates); pick the
#    highest-quality candidate (p~ only breaks ties), fix its top slop in ≤3 passes, THEN render.
```

Read [anti-sameness](references/anti-sameness.md) for why/how the candidate set is built, and
[taste](references/taste.md) for the rubric and the bounded critic loop. This is the difference
between "diverse mediocrity" and good: the composer stops sameness, the taste pass stops slop.

**Consistency ON PURPOSE (a brand identity).** The inverse of the variety pass: when many videos
must look like the SAME brand, save an identity once and reuse it — palette, font pairing,
wordmark, default transition/anchor locked together.

```bash
python3 <skill-dir>/scripts/compose.py brands                      # list saved identities
python3 <skill-dir>/scripts/compose.py new --brand-profile jazz --archetype kinetic-promo --out ./sb.json
python3 <skill-dir>/scripts/compose.py propose --brand-profile jazz --n 3 --out-dir ./cands  # SAME look, 3 structures
```

A profile is `assets/brands/<name>.json` (inherit a `base` theme + override, or fully specify
colours + vendored fonts + wordmark) — see [assets/brands/README.md](assets/brands/README.md).
With `--brand-profile`, `propose` holds the identity constant and varies only the STRUCTURE, so
you get a consistent brand without the videos feeling copy-pasted. Use variety mode to EXPLORE a
look, then promote the winner into a brand profile to REPRODUCE it.

Rules for a weak model: compose.py writes a valid storyboard; you then edit ONLY its
text/narration/seconds/numbers. Never invoke `produce.py`/`build_project.py` with system
`python3` for the full video — always go through `run.py`. Never edit a `.tsx`/`.py` source
file to change size, layout or text. To vary motion, swap a scene's `component` for another
id from `compose.py components <query>` (every listed id renders through the compiler); to
re-theme, re-run compose.py or change the spec's `background`/`textColor`/`accent`/
`fontFamily`/`transition`. The layout math is deterministic and already fits the frame.

## Start with the smallest useful context

Read [workflow](references/agent-workflow.md). Infer defaults from the brief and
supplied brand/reference. Ask only for material missing decisions. For a new project
save `DESIGN.md` and `STORYBOARD.md`: one purpose per scene, duration, renderer,
asset, camera move and audio cue. Match dimensions/fps before mixing renderers.

For a complete promo/tutorial, the default is the **compose recipe** above, not the
old silent four-kind smoke test. Read [production direction](references/production-direction.md).
Compose from `assets/archetypes/*.json` + `assets/themes.json` with `scripts/compose.py`
rather than copying one fixed storyboard; `assets/storyboard-production.json` remains as a
single hand-written reference. `scripts/run.py` carries the plan
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
python3 <skill-dir>/scripts/compose.py components 'chart'   # render-safe picks, * = ready
python3 <skill-dir>/scripts/catalog.py 'character'          # full 681-item catalog (all engines)
python3 <skill-dir>/scripts/catalog.py 'terminal'
```

`assets/safe-components.json` is the vetted subset (119 onda/rendercomp scenes) that
compiles straight through `build_project.py`; put any of those ids in a `component` scene.
The wider `catalog.py` also surfaces HyperFrames/Blender/FFmpeg pieces that need their own
engines — use those via the routing table below, not the `component` scene kind.

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
- `library/vendor/curvable/`: 14 parameterized launch-video scenes (own palette). 10 are
  wired into the `component` scene kind (`curvable/<slug>`) and listed by `compose.py
  components`; the 4 that need `ogl` (WebGL) are excluded. Each brings its own colours.
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
For non-repetitive output use [anti-sameness](references/anti-sameness.md); for good-vs-slop
judgment use [taste](references/taste.md) (render a hero frame with `scripts/still.py`, then score it).

## Assemble a multi-engine film

One video can mix engines: a HyperFrames (HTML/GSAP) intro, a Remotion archetype body,
real footage. `scripts/assemble.py` renders each segment with its engine and joins them
into one MP4, normalising resolution/fps/audio via the FFmpeg layer. Write a manifest and
run it:

```bash
cat > film.json <<'JSON'
{ "width":1920,"height":1080,"fps":30,"transition":"fade","out":"film.mp4",
  "segments":[
    {"engine":"hyperframes","dir":"library/hyperframes/editorial"},
    {"engine":"remotion","storyboard":"promo.json"},
    {"engine":"video","src":"capture.mp4","start":2,"duration":6}
  ] }
JSON
python3 <skill-dir>/scripts/assemble.py film.json --dry-run     # show the plan
python3 <skill-dir>/scripts/assemble.py film.json               # render + join + verify
```

Engines: `video` (a clip you already rendered — e.g. a narrated Remotion film from
`run.py` — optionally trimmed), `hyperframes` (render a HyperFrames project dir), and
`remotion` (compile+render a storyboard silent; pass `"nodeModules"` to skip install).
A `"music"` bed is ducked under the film. **FFmpeg must be sound:** a broken `ffprobe`
that reports duration 0 silently breaks joins and HyperFrames' own artifact check;
assemble.py probes a 1 s test clip and refuses a broken toolchain — point it at a good one
with `--ffmpeg-dir <dir>` or `$VIDEO_FORGE_FFMPEG_DIR`.

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
