# HyperFrames — installed contracts first

HTML/CSS + a paused GSAP timeline → seekable frames → encoded video. The bundled
starter pins HyperFrames 0.8.201 and GSAP 3.14.2. It has no private skill dependency.
Copy library/hyperframes/editorial to a project, npm ci, then edit copy/design tokens.
The engine is Apache-2.0; GSAP and fetched media retain their own terms.

```bash
npx hyperframes --version
npx hyperframes render --help
npx hyperframes lint
npx hyperframes check --json
npx hyperframes snapshot --at 0.3,1.5,3.8 --output snapshots
npx hyperframes render --output renders/final.mp4 --fps 30 --quality high
```

Use `--workers 1` or `2` on a low-memory machine. Check local render help for software
browser GPU options; tested authoring command used --no-browser-gpu. If Chromium
cannot launch inside an execution sandbox, request the host's execution permission;
do not disable unrelated security settings. Supply an existing supported browser path
with HYPERFRAMES_BROWSER_PATH where necessary.

## Authoring contract

- Root element declares data-composition-id, data-start=0, data-duration (seconds),
  data-width and data-height. Standalone index.html is visible body markup, not template.
- Each timed clip has an id and explicit timing. data-track-index is an editor lane;
  CSS z-index controls visual paint order. Do not assume one changes the other.
- Build GSAP timelines synchronously, paused; register them in
  window.__timelines[compositionId]. No wall clock or infinite repeats.
- Let the framework own media seeking. For silent video use muted playsinline; keep
  narration/music as separate audio unless the installed version explicitly supports
  audio on video. Every audio element needs an id to reach the mix.
- Local fonts/assets and deterministic values make rendering repeatable. Check output
  after arbitrary seeks, including the very first/last frame of each scene.

## Registry and freshness

Search scripts/catalog.py --engine hyperframes, then read the selected registry item
and use `npx hyperframes add NAME` for blocks/components. For examples use init with
--example NAME. Keep a local source copy and license; registry availability is separate
from CLI installation. The bundled starter works without fetching a registry template.

The current upstream skills differ from the older locally installed pack: check is
the consolidated gate; validate/inspect/layout are legacy aliases. Some older packs
say all video audio must be separate and impose fixed style quotas. Follow the actual
installed media contract and project art direction; do not copy effect quotas as laws.
Pin tested dependencies. Official docs: https://hyperframes.app/docs/5-packages/cli
and https://github.com/heygen-com/hyperframes .

## Local narration

`hyperframes tts script.txt --voice pf_dora --lang pt-br --output narration.wav` uses
Kokoro locally. It requires Python with kokoro-onnx and soundfile; set HYPERFRAMES_PYTHON
to that environment. First use downloads model/voices separately. Treat those downloads
as dependencies and keep their licensing records. No hosted video models are needed.
