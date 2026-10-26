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

Runtime engines are installed separately and are not relicensed by this repository.
Remotion uses its own license; FFmpeg, Blender, GSAP, model weights, voices, fonts
and third-party media retain their own terms. The repository does not bundle model
weights, FFmpeg/Blender executables or private account credentials.

The local demo UI, recording and Python sound bed are authored demonstration assets.
Speech is synthesized locally from the demonstration script using Kokoro/pf_dora;
model/voice provenance is recorded alongside the original audio example.
