# Video Forge

A portable skill for producing videos with code: motion, footage editing, screen
capture, zoom/cursor, redaction, characters, true 3D, narration and animated captions.
HyperFrames + Remotion + FFmpeg + reusable source libraries, used together as needed.

## Production is the default

The skill includes the complete executable path: choose actual components, prepare
speech, align/correct words, animate captions, inherit visual direction, add sound,
render, master, decode and export review frames. A driving model fills a production
storyboard; it does not have to invent JSX, timing math or encoder commands.

```bash
python3 scripts/setup_environment.py --out .video-forge-tools --audio
python3 scripts/run.py assets/storyboard-production.json --out ./film
python3 scripts/production_job.py status ./film.job.json
```

`production_job.py` runs the real producer in the background for harnesses with short
shell timeouts. `produce.py` runs it synchronously. A running job is not completion.
The output includes final.mp4, word pages, actual verification, corrections to review
and a contact sheet. `--resume` repairs a script/timing problem without discarding the
project. The included production example has its local screen-recording input.

Read SKILL.md and references/production-direction.md for the recipe. FFmpeg/ffprobe,
Node 22+ and a supported Chrome are prerequisites. The local setup installs audio
packages and verifies the tested Kokoro files; model weights are not bundled in ZIP.

## Reuse actual code

```bash
python3 scripts/catalog.py personagens --local
python3 scripts/catalog.py caption --engine remotion
python3 scripts/build_project.py assets/storyboard-production.json --check
```

A component scene can name `onda/count-up` or an actual `rendercomp/<slug>` and supply
its props. The compiler resolves exported code, preserves local imports/licenses and
applies schemas/defaults. The catalog also exposes HyperFrames, Curvable, editing,
Blender and additional authored components for the other production lanes.

`build_project.py` is the low-level compiler, not the finish line. Complete videos go
through the producer and review. See library/README.md and references/research.md.

## Any coding harness

Point the agent at SKILL.md, or install the folder:

- Jazz: ~/.config/jazz-cli/skills/video-forge/
- Codex: ~/.agents/skills/video-forge/ or ~/.codex/skills/video-forge/
- Claude Code: ~/.claude/skills/video-forge/
- OpenCode/others: reference the same SKILL.md from the project instructions.

The recipe is Python/Node/files and local CLI tools, without a private connector or
particular model provider. Use the host's authorized project mode and a background
job for long renders; model-cache reads must be permitted in that host.

## Evidence — what is proven, and what is not

**Proven.** Given a production storyboard, the shared code path renders a spec-conformant
1920x1080 MP4 with narration, motion captions, sidechain-ducked music and an EBU R128
master (−14 LUFS). Verified on a free weak model (kilo/poolside/laguna-s-2.1) via the same
producer as a strong model — see `examples/04-production-v2/{jazz,teacher}/out/`. The
producer deterministically owns layout fit, narration timing (scenes auto-extend to fit
speech) and the mix, so the driving model supplies text and parameters, not JSX or math.

**Not yet proven.** Fully autonomous production from a fresh brief by a weak model within
a tight time budget: the model understands the skill and fills the storyboard, but on an
old CPU the render alone consumes most of a short run. Treat weak/strong *parity* as a
goal measured per run (see references/evaluation.md), not a guarantee.

## License

Our code is MIT. Vendored MIT sources retain their upstream LICENSE and provenance.
Remotion, GSAP, downloaded media, fonts and TTS voices have separate terms; our
license does not relicense them. Keep LICENSE and UPSTREAM.json when copying source.
No hosted video generator is required or substituted for code rendering.
