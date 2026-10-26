# Contextual media and sound

Prefer supplied media, then relevant licensed stock, then a code-drawn diagram or
character. See asset-sourcing.md for characters, icons, 3D models and environments.
Use audio-captions.md for narration, transcription and motion captions.

For each scene extract concrete subject/action/setting/framing/style terms. Search
specific then broader queries, inspect candidates and choose for meaning plus technical
fit: duration, resolution, aspect and edit handles. Do not substitute a random clip
because its tags loosely overlap a vague abstract noun.

Pexels, Pixabay and Openverse are useful discovery sources. Read the selected item's
current terms and the provider's API documentation rather than hardcoding remembered
quotas, endpoints or entitlement claims. Keys are optional dependencies only for the
chosen provider, not requirements for the whole skill. Download local assets where
allowed so rendering does not rely on transient remote URLs.

Record source_url, author, license, attribution, fetched_at and scene purpose beside
each downloaded file. Preserve attribution when required. An open runtime does not
license every artwork on a community website. Stock usage and redistribution in a
skill package are different: bundle only assets with suitable redistribution rights.

yt-dlp can fetch supplied or appropriately reusable material when that is the task.
Use source context and existing authorization; do not repeatedly demand confirmations
already provided. Preserve source metadata, do not call arbitrary platform footage
licensed stock, and do not bypass access controls. Inspect formats/sections before
large downloads. FFmpeg wrappers handle trim, crop, grade, overlay and assembly.

Keep narration, music and SFX separate during editing. Choose sound with the same
intent as imagery. Remap captions/audio cues after cuts. Freeze final sources and
record commands in PROJECT.md so another agent can resume reproducibly.
