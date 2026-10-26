# Complete production test: shared code, shared quality

- `teacher/out/final.mp4`: reference authored by the primary assistant through the shared producer.
- `jazz/out/final.mp4`: free-model Jazz run through that same producer.
- Each project includes storyboard.json, generated code, timed narration, captions,
  source recording, sound bed, final MP4, contact sheet and machine-readable reports.

The free model read the skill/recipe, wrote its plan and launched the producer. Its
plan reused the reference recipe and changed the recording camera keys. No manual
TSX, caption, soundtrack or post-render editing was supplied to its production.

Both results have the editorial opening, source-space screen camera and opaque mask,
raised open-hand character gesture, procedural 3D, Portuguese speech, word-motion
captions, sound bed/action cues and master/decode checks. The test matches the
provided brief; it does not pretend the reference recipe is an unseen creative brief.

Measured production time: reference 484.375s; Jazz producer 489.835s (about 8m10s).
These include local audio and rendering. The full harness session took longer due
to provider rate limits, a read-scope adjustment and switching long execution to
the job wrapper. Those interventions concerned environment/execution, not the JSON
content or film construction. The 58s result from V1 was only a storyboard smoke test.

The encoded files probe at 20.1 seconds because of the audio tail in that tested
revision; the current producer caps the master to the planned duration.

The primary assistant viewed both contact sheets and the corrected greeting. The
producer records ASR-to-script corrections for review; these are not hidden manual
repairs. Audio was checked by decode/transcript; no listening claim is made here.

Recreate with the root setup/run commands and the example storyboard; supply its
public/screen.mp4 as screen.mp4 beside a copied input storyboard, or use the root
production example with assets/screen.mp4. No model weights or credentials are bundled.
