# Find elements that belong in the scene

Translate the script into subject, action, setting, framing and style. Search concrete
visual nouns; inspect candidates before downloading. Prefer existing supplied brand
assets. Real product demonstrations need the real UI, not an invented screenshot.

| Need | Source | Integration |
|---|---|---|
| Characters, props, sprites, UI and sound | https://kenney.nl/assets | CC0 asset packs; keep pack license; sprites or GLB |
| Hand-drawn people/objects | https://www.opendoodles.com/ | Inspect SVG groups; animate logical limbs rather than flattening |
| 3D models, HDRIs and PBR materials | https://polyhaven.com/ | CC0 assets; preserve relative textures and color spaces |
| 3D library/characters | https://quaternius.com/ | Check individual pack terms; GLB/FBX + animations |
| SVG icons | https://lucide.dev/ , https://tabler.io/icons | Reuse consistent set, preserve license; animate paths/groups |
| Motion-ready vector artwork | LottieFiles / authored .json | Per-animation terms; deterministic seek |
| Stock video/photo | Pexels, Pixabay, Openverse | See media-pipeline.md; local download + source/license record |
| Music/SFX | Kenney audio, Freesound, supplied audio | Check per-file terms; no unrelated soundtrack in a reusable pack |

Record source_url, author, license, attribution, fetched_at, local path and intended
scene. Download local copies where allowed so renders do not depend on a remote URL.
Do not copy a whole website's asset library merely because one image was relevant.
Keep the license with redistributed assets and choose another asset if reuse rights
are unclear. A web-search thumbnail is not a production-quality licensed source.

Adapt assets to the common palette, line weight, lighting and perspective. A mixed
set of 3D, flat icons and photos needs art direction, not random collage. Fit the
asset to the shot's purpose; when no good media fits, prefer a clear code diagram.
