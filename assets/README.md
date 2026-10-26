# Assets — what's bundled vs. fetched

This skill keeps bundled binary assets minimal (so it stays light and license-clean) and
**fetches the rest on demand** with a provenance trail. Two kinds:

## Bundled (ship with the skill)
- **Fonts** — not stored as files; loaded at runtime via `@remotion/google-fonts`
  (see `library/primitives/fonts.ts`). Google Fonts are OFL/Apache — safe to redistribute.
- **Code-drawn assets** — backgrounds, shapes, logo stings are generated in code
  (`library/scenes/`, `@remotion/shapes`, `@remotion/paths`), so there's no binary to
  license. Prefer these over downloaded art whenever they'll do.

## Fetched on demand (NOT committed)
Images, stock video, music, Lottie rigs, and voices are pulled when a project needs them,
following `references/media-pipeline.md`. The rules:
- Default to no-attribution commercial sources (Pexels, Pixabay, Coverr).
- **Every downloaded file gets a sidecar `<file>.license.json`** (source, author, license,
  attribution, date). This folder is also where a project caches what it fetched.
- CC-BY/SA assets must surface attribution in a credits scene.

## Curated free sources (quick reference)
- Stock video/photo: Pexels, Pixabay, Coverr (no attribution); Unsplash, Openverse (CC).
- Characters: LottieFiles (per-asset license), Rive community, Kenney.nl / OpenGameArt (CC0 sprites).
- Music/SFX: Freesound (per-sound CC), ccMixter, Pixabay music (manual).
- Voices: Piper voices (HF `rhasspy/piper-voices`), ElevenLabs (paid for commercial).

Full endpoints, keys, and commands live in `references/media-pipeline.md`.
