# Paired model evaluation

Use the same brief, assets, time/token budget, renderer versions and machine. Compare
at least a capable model and a cheaper/weaker model in separate output directories.
Do not give the evaluator the author's intended verdict. Run multiple trials before
claiming a consistent advantage. Manual demo rendering alone is not a model benchmark.

Compare baseline (engine docs only) with Video Forge (catalog + sources + recipes +
helpers). Record model/provider/version, prompt, tool permissions, failures, token
usage, elapsed time, repairs, final files and exact command results.

Representative tasks:
1. A 12-second branded launch video with title, evidence and CTA.
2. A recorded product walkthrough with cursor focus, a zoom and masked dummy email.
3. A Portuguese narration with word-timed motion captions and a character accent.
4. A true procedural 3D object with lighting, camera movement and matching 2D end card.
5. A mixed footage edit with dialogue, music ducking and reframing to vertical.

Mechanical gates: full export/decode, correct duration/size/fps, no missing media,
word timings aligned after cuts, audible track present when requested, redaction
coverage, repeatable same-frame rendering after arbitrary seeks.
Blind human/image review: message clarity, typography, pacing, camera purpose,
character consistency, sound balance and visual cohesion. Technical gates cannot
prove taste. Record per-task results instead of averaging away a privacy leak or an
unrendered scene. Report untested capabilities explicitly.

## Observed run — 2026-10-26

Jazz + `kilo/poolside/laguna-s-2.1:free` produced a valid 12-second storyboard
(title 3s, character 5s, true-3D 4s). The prompt asked it to read the actual skill and
example, write only the JSON and validate it; no hand-edited model output was used.
Jazz reported completion in 58.381 seconds, six tool calls, zero tool errors, zero
denials and cost_usd=0. It recorded 45,376 input / 1,664 output tokens across requests
(including 11,552 cache-read tokens). This is aggregate tool-session usage, not a
single prompt size. The compiler generated the project and TypeScript passed.

A first attempt failed on network/project-scope restrictions and timed out; it is
not hidden from the authoring logs. Correcting the working directory resolved the
read boundary. This is one success at parameter selection and project generation,
not an A/B comparison, proof of aesthetic parity or a benchmark across task classes.
The integrated narrated demo was authored by the primary assistant separately.

The resulting 12.000-second 1920×1080 30fps MP4 was rendered without modifying the
model's storyboard, fully decoded successfully and its contact sheet visually
reviewed (title, character and true-3D scenes present). It contains no audio because
this smoke-test brief requested only the three visual scenes.
