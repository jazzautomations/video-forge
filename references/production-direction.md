# Direction belongs in executable recipes

The earlier mistake was a weak contract: the cheap model filled a silent template,
while the primary assistant privately supplied direction, caption correction, voice,
sound, recording cleanup and review for its own demo. The successful unit is a
complete production, not an accepted JSON file or syntactically valid MP4.

## Shared path for any harness

Use assets/storyboard-production.json and its schema. A local demonstration recording
is included at assets/screen.mp4 so that the production example is runnable.
If tools are missing, run `python3 scripts/setup_environment.py --out video-tools --audio`;
it installs pinned audio dependencies locally, verifies the tested Kokoro weights and
reports the Python/model paths. Point produce.py at them. FFmpeg, Node and Chrome
are system/project prerequisites reported separately; never fabricate their presence. Keep a coherent palette and
brand; assign each scene a purpose and a short narration line when speech is wanted.
Choose a hook, a concrete demonstration/evidence and a payoff where the brief calls
for them. A character or 3D object must explain or demonstrate something, not fill time.
Do not force this structure onto a request for a single clip or a narrow edit.

```bash
python3 scripts/build_project.py storyboard.json --check
python3 scripts/setup_environment.py --out .video-forge-tools --audio
python3 scripts/run.py storyboard.json --out ./film
```

For harnesses with a short shell-call timeout, use the portable job runner:

```bash
python3 scripts/run.py storyboard.json --out ./film
python3 scripts/production_job.py status ./film.job.json
```

It returns immediately and records status, log and final report. Do not call a
`running` job complete. Poll after useful independent work and inspect the result.
Use the host's authorized execution mode for the project; an unattended shell cannot
answer a permission prompt. Keep model-cache access scoped to the supplied assets.

produce.py is the complete path; build_project.py is only the compiler. The production
runner uses local Kokoro when scene narration is provided, checks that real speech
fits its slot, generates word timestamps, restores authored words within measured
speech spans and records corrections for review. It never silently clips long speech
or ships silence when narration was requested. It carries the resulting pages into
MotionCaptions, adds a procedural bed/action cues, renders, masters and fully decodes
the file. Then open the generated contact sheet; the process does not judge taste.
If a line is too long, shorten it or extend that scene. Use --resume for timing/script
repairs in an existing generated project. If scene kinds change, use a new project.

## What the code now carries

- EditorialTitle: the demo's type hierarchy, mask reveal, stagger, ruled accent and
  closing color inversion. Adapted to the actual canvas.
- DirectedBeat: short shared graphic seam between shots, no mandatory random effects.
- CharacterPresenter: the shared theme by default; open hand beside the head, two
  small wrist greetings and hold. Review the silhouette through the full motion.
- ScreenFocus: source-coordinate camera, masks and cursor stay together. Check that
  recording begins with useful content before adding a zoom.
- ProceduralObject3D: real mesh/material/light with purpose/title supplied by the brief.
- MotionCaptions + produce.py: measured speech, short pages, word emphasis, script
  correction audit, music ducking and output soundtrack checks.

## Acceptance: same brief, comparable finished output

Give the assistant/reference and cheap-model harness the same brief, assets and
required features. Save the cheap model's storyboard unchanged. Let it call the
production runner, not stop at a plan. Keep timing, tool logs and exported artifacts.
Compare the actual videos: message, framing, type, continuity, character gesture,
source masking, true 3D, correct words, speech timing and sound. Missing mandatory
voice/captions/recording is a failure, even if an MP4 exists. Do not call one successful
recipe universal model parity; add other task classes using evaluation.md.

## More than four fixed scenes

A storyboard can use `kind: "component"` and `component: "onda/count-up"` or an actual
`rendercomp/<slug>` from the catalog. The compiler resolves the real exported
component, preserves its local import graph/license and applies schema/default props.
This connects the source library to execution rather than leaving it as a folder of
links. Use declared props; validate/render a chosen component before shipping it.
The original vendor WaveHello remains an unmodified source snapshot; the validated
canonical greeting used by the producer is CharacterPresenter.
