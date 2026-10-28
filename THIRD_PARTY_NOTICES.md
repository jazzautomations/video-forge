# Third-party source notices

Video Forge's authored code is MIT. Source libraries retain their original license
and copyright; copies are in each vendor directory. UPSTREAM.json records the source
repository and reviewed tree. The source snapshots are kept unchanged; the adapted
CharacterPresenter preserves RenderComp's copyright/SPDX notice.

| Source | License file |
|---|---|
| RenderComp / Trimora Inc. | library/vendor/rendercomp/LICENSE |
| Curvable | library/vendor/curvable/LICENSE |
| Onda | library/vendor/onda/LICENSE |
| kajisho5/ffmpeg-skill | library/vendor/ffmpeg/LICENSE |
| kajisho5/blender-skill | library/vendor/blender/LICENSE |
| Vendored fonts (Inter, Space Grotesk, JetBrains Mono, Noto Serif, Noto Serif Display, Bricolage Grotesque) — SIL OFL 1.1 | assets/fonts/OFL.txt (attribution in assets/fonts/FONTS.md) |
| DiceBear core + collection (character scene) — code MIT | installed via npm (@dicebear/core, @dicebear/collection) |
| Open Peeps character artwork by Pablo Stanley — CC0 1.0 (public domain, no attribution required) | rendered by the `character` scene via DiceBear's open-peeps style |

Runtime engines are installed separately and are not relicensed by this repository.
Remotion uses its own license; FFmpeg, Blender, GSAP, model weights, voices
and third-party media retain their own terms. The display/text fonts in
assets/fonts are vendored under the SIL OFL 1.1 (redistributable; subsetted and
converted to .woff2 locally, outlines unmodified, no Reserved Font Names used) and
the license travels with them into every generated project — see assets/fonts/FONTS.md. The repository does not bundle model
weights, FFmpeg/Blender executables or private account credentials.

The local demo UI, recording and Python sound bed are authored demonstration assets.
Speech is synthesized locally from the demonstration script using Kokoro/pf_dora;
model/voice provenance is recorded alongside the original audio example.
