# Production loop

1. Understand the message, audience, format and supplied reference. Inspect source
   material before deciding its role. Keep the user's stated scope and permissions.
2. Make a short DESIGN.md and storyboard: hook → evidence/demo → payoff when that
   structure fits. Record scene purposes, durations, renderer, assets and audio cues.
   Derive pacing from speech/music or reference timing, rather than equal slide lengths.
3. Query scripts/catalog.py. Open only the candidate implementation and its defaults
   or schema. Pick the smallest dependency surface that meets the shot.
4. Build one hero frame. Check text in the actual font and delivery aspect. Render
   it, inspect it, then animate into/out of that layout. Reuse a tuned motion recipe.
5. Record narration before locking final speech-driven timings. Transcribe the actual
   final audio, then use its word timestamps for captions and important visual hits.
6. Render each scene. Keep inputs and intermediates. For mixed footage normalize
   size, fps, pixel format, timestamps and audio topology before assembly.
7. Assemble, mix and export. Subtitle/caption z-order must remain readable after all
   overlays. Re-map word times when cuts change the timeline.
8. Check the actual exported file: metadata, full decode, contact sheet, transitions,
   readable holds and audio levels/sync. Correct demonstrated defects and rerender.
9. Deliver the video and source. Report exact checks and limitations; do not claim
   unavailable audio/vision checks or an unrun model benchmark.

For a narrow edit skip unrelated planning. Do not force approval gates inherited from
another project's workflow. Use provided authorization; ask when a required decision
really cannot be inferred. Stop repeating an unchanged failing command: identify the
missing dependency, inspect its help/logs and either recover or report it concretely.

Keep PROJECT.md with brief, selected components, dimensions/fps, commands, source
paths, current render and the next failing check. This lets any driving model resume.
