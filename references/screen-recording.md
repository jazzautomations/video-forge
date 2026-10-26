# Capture → camera → redaction → final render

## Capture

For a reproducible browser demo use Playwright `browser.newContext({viewport,
recordVideo:{dir,size}})`. Save/close the context to finalize the WebM. Record actions
and timestamped cursor positions separately; browser automation is not automatically
a cursor recording. See scripts/record-browser.mjs for a working example and action
format. It uses a fresh context, never a user's authenticated browser by default.

Record the PRODUCT, never the desktop you are working on: a capture of your own
terminal or editor is not footage of the thing being advertised. For a public page use
`scripts/record-page.mjs URL targets.json`: it scrolls smoothly to each target text,
holds, and writes marks.json with every target's time, viewport box and a camera key
already clamped for its zoom, in the recording's own coordinates. Cut the WebM at the
`page-ready` mark and into one clip per scene (ScreenFocus plays a clip from its
start), then paste the camera keys into the storyboard. build_project.py rejects a
key that shows outside the recording unless the scene sets `allowBackground: true`.

For the actual desktop use OBS or an installed platform recorder. Linux X11 can use
FFmpeg x11grab; Wayland normally needs PipeWire/portal selection. Do not claim x11grab
works on Wayland. Keep screen/window scope and optional mic/system-audio sources
explicit. OpenScreen's source is MIT and supports zoom, blur regions and cursor data;
Linux capture/cursor capabilities differ from its native macOS/Windows pipeline.
Cap is useful to study but most of its code is AGPL, not an MIT component bundle.

## Camera and cursor

Keep zoom/camera keys in source coordinates and time on the edited output timeline.
Record the source frame dimensions; map coordinates after crop, scale and letterbox.
To center source point (cx,cy) at output (W/2,H/2), scale z then translate:
`translate(W/2-cx*z, H/2-cy*z) scale(z)` with transform origin 0 0.
Clamp against image bounds or intentionally provide a background. Ease zoom in,
readable hold, ease out; follow a meaningful target rather than every pointer jitter.
Cursor and click rings belong in the same source coordinate group as the recording.
Avoid double cursors: choose embedded or reconstructed cursor.

Use bundled ScreenFocus.tsx for footage with camera keys and source-space masks.
For stills/2.5D screenshot travel study video-shotcraft PageCam. For a quick fixed
crop/reframe use the FFmpeg vendor crop/fit helpers.

## Censor

Prefer replacing demo secrets with dummy data before capture. For a sensitive string,
use a fully opaque source-space mask in the rendered pixels. Blur/pixelation may be a
stylistic choice but do not promise irreversible removal. Inspect the final encoded
video across the entire sensitive interval, including cut edges, zoom and transitions.
Do not censor only the preview or rely on a separate toggleable subtitle track.

The vendored `redact.py` handles a FIXED rectangle for a whole clip (blur, pixelate or
delogo); it does not detect faces, track moving boxes or accept timeline intervals.
For partial intervals split first; for moving regions supply tracked/keyed masks.
ScreenFocus masks move with the camera. If the secret is spoken, censor the audio too.
Preserve originals and deliver only the redacted derivative when redaction is requested.
