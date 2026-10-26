# FFmpeg: edit and finish mixed-engine video

Use the bundled helper code instead of inventing long commands. Paths below start
at this skill directory. Read the selected script's --help for the installed contract.
These are MIT upstream scripts with their own LICENSE and provenance under vendor.

```bash
# Inspect source and render metadata
python3 library/vendor/ffmpeg/scripts/probe.py source.mp4 --json
# Frame-accurate extract, preserve the original
python3 library/vendor/ffmpeg/scripts/cut.py source.mp4 --start 2 --duration 6 --accurate -o cut.mp4 --json-brief
# Normalize mixed clips before joining; choose pad or crop intentionally
python3 library/vendor/ffmpeg/scripts/join.py intro.mp4 capture.mp4 outro.mp4 -o joined.mp4 --width 1920 --height 1080 --fps 30 --transition none --json-brief
# Fixed known rectangle: does NOT detect or track faces
python3 library/vendor/ffmpeg/scripts/redact.py capture.mp4 --x 1300 --y 30 --width 300 --height 60 --mode pixelate -o censored.mp4 --json-brief
# Add music and duck it under existing dialogue
python3 library/vendor/ffmpeg/scripts/audio.py joined.mp4 --music bed.wav --music-volume -20 --duck -o mixed.mp4 --json-brief
# Inspect an exported video, rather than assuming success
python3 scripts/verify_video.py mixed.mp4 --width 1920 --height 1080 --fps 30 --require-audio
python3 library/vendor/ffmpeg/scripts/look.py mixed.mp4 --tiles 3x2
```

For a full edit store a project JSON and use vendor/ffmpeg/scripts/render.py. Its
module docstring gives the actual schema: clips, frame, transitions, captions,
graphics, overlays, audio, loudness and export. Run --dry-run --json before a complex
edit. Source speech must stay attached to its edited timing. For custom animated
caption overlays, composite them after other visual overlays so they remain readable.
Do not assume render.py's default stage order is right for every overlay.

## Silent code render + narration

```bash
ffmpeg -i silent.mp4 -i narration.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest narrated.mp4
```

-shortest intentionally trims to the shorter input. If the video must retain a
longer CTA hold, pad the narration first or mix on a soundtrack of exactly the
video duration. Do not silently drop the planned ending. For dialogue + bed + SFX,
use separate stems; normalize to a common sample rate and check levels/true peak.

## Native alpha and transforms

Render alpha intermediates in a format that actually preserves it (ProRes 4444 or
RGBA sequence); check current renderer flags and inspect a transparent frame. Final
H.264 yuv420p has no alpha. A stream-copy concat is valid only when actual stream
parameters match. Normalize resolution, fps, timestamps, pixel format and audio
layout when combining different engines. Do not stretch footage to fit an aspect.

For overlay start offsets use setpts=PTS-STARTPTS+START/TB. Captions after cuts use
output timestamp = source timestamp - source in + output segment start. Check cut
boundaries for black frames, stale subtitles and clicks in audio. Preserving a source
file extension or getting exit code 0 alone does not prove the delivery is correct.
