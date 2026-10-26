# External library routing map

Machine-readable: `research/libraries-catalog.json`. License-vetted candidates from the
2026-10-26 study sweep (audit of cloned upstream + fresh research). **Verify a license
at the source before vendoring**; several declare a license in package.json but lacked a
standalone LICENSE in the snapshot. `vendor` = MIT/Apache/CC0 code-only, safe to bundle;
`route-reference` = useful but license/size/runtime forbids bundling — cite, do not copy.

Bundled already (see `library/vendor/`): rendercomp, curvable, onda, ffmpeg, blender.

## 3d

| Project | License | Action | Note |
|---|---|---|---|
| Video Forge ProceduralObject3D.tsx (R3F / @remotion/three) | MIT | vendor | ALREADY VENDORED and WIRED as the true-3D R3F path. Lives at library/scenes/ProceduralObject3D.tsx; catalog en |
| Zdog (metafizzy/zdog) | MIT | vendor | MIT and tiny; vendor into library/zdog/ for lightweight stylized 3D-ish motion (logos, icons, spinners) withou |
| kajisho5/blender-skill | MIT | vendor | ALREADY VENDORED and WIRED. Snapshot at /home/h/video-forge/library/vendor/blender/ (scripts/ + scripts/bpy/ + |
| maath (pmndrs) | MIT (verified: package.json 0.10.8) | vendor | Small MIT code-only lib. Vendor the needed modules (easing, random with explicit seed) into library/primitives |
| three-bvh-csg (gkjohnson) | MIT (verified: package.json) | vendor | MIT code-only. Vendor as the procedural-geometry/CSG helper under library/primitives/ with a small node script |
| @jscad/modeling (JSCAD / OpenJSCAD) | MIT (verified) | route-reference | MIT, pure JS, trivially headless. Route-reference as an alternative to manifold for simple code-defined solids |
| @theatre/core (Theatre.js animation runtime) | @theatre/core: Apache-2.0; @theatre/stud | route-reference | Route the Apache-2.0 @theatre/core runtime as an npm dep in three-and-blender.md for deterministic seek of 3D  |
| Babylon.js (@babylonjs/core) | Apache-2.0 (verified) | route-reference | Route in references/engine-routing.md as a second 3D engine option: Apache-2.0, strong glTF/PBR support, NullE |
| OpenSCAD | GPL-2.0-only (verified) | route-reference | Route ONLY (GPL, don't vendor). In three-and-blender.md note `openscad -o out.png --imgsize=1920,1080 --camera |
| POV-Ray | AGPL-3.0-or-later (verified: v3.7+ relic | route-reference | Route ONLY (never vendor — AGPL vs this MIT skill). Document in three-and-blender.md: `povray +Iscene.pov +Ofr |
| Spline web exports (@splinetool/runtime, @splinetool/loader) | PROPRIETARY — no SPDX license field in p | route-reference | Route WITH A WARNING in three-and-blender.md, do not vendor and do not treat as open source: the npm runtime s |
| ambientCG + Poly Pizza (CC0 asset platforms w/ APIs) | ambientCG: CC0 (all); Poly Pizza: mixed  | route-reference | Add rows to references/asset-sourcing.md beside the existing Kenney/Quaternius/Poly Haven entries: ambientCG f |
| av/remotion-bits | MIT declared (package.json + README) but | route-reference | NOT WIRED: 0 vendored, 0 catalogued (grep 'remotion-bits' in catalog.json = 0), not mentioned in SKILL.md. Lic |
| blenderless | GPL-3.0-or-later (verified: PyPI) | route-reference | Route as an invoke-only complement to the existing library/vendor/blender CLI wrappers (GPL — do not vendor in |
| canvas-sketch + canvas-sketch-cli (mattdesl) | MIT (verified: package.json) | route-reference | Document in references/three-and-blender.md and references/engine-routing.md as the LIGHTWEIGHT non-Remotion h |
| framefields (gatewai-dev/framefields) | Apache-2.0 | route-reference | Apache-2.0 and agent-native (writes MP4 directly, inspects frames), but it is explicitly agent-writes-TypeScri |
| gltfjsx (@react-three/gltfjsx) | MIT (verified) | route-reference | Route in asset-sourcing.md + three-and-blender.md as the bridge from downloaded CC0 GLB to the existing @remot |
| manifold-3d (elalish/manifold) | Apache-2.0 (verified: package.json 3.4.1 | route-reference | Apache-2.0 but ships as a WASM binary module — route-reference in a new 'procedural geometry' section of three |
| replicad (sgenoud) | MIT (verified: package.json 0.19.1) | route-reference | MIT but heavy WASM (OpenCascade) — route-reference in asset-sourcing.md/three-and-blender.md as the option for |
| three-stdlib | MIT (verified) | route-reference | Route as the recommended source of three.js loaders/exporters in three-and-blender.md instead of deep-importin |
| TresJS (@tresjs/core) | MIT (verified: package.json 5.8.x) | skip | Skip for now: MIT and healthy, but this skill's 3D path is React/@remotion/three; a Vue renderer adds a parall |

## audio

| Project | License | Action | Note |
|---|---|---|---|
| BeatNet (mjhydri/BeatNet) | MIT | route-reference | Reference in references/audio-beatsync.md as the MIT deep-learning beat option when librosa under-performs but |
| Chatterbox (resemble-ai/chatterbox) | MIT | route-reference | Reference in references/audio-tts.md as the expressive/voice-clone option when Kokoro's fixed voices are too f |
| Coqui TTS / XTTS-v2 (idiap/coqui-ai-TTS fork) | code MPL-2.0; XTTS-v2 weights CPML (NON- | route-reference | Reference in references/audio-tts.md ONLY with a loud license warning: the XTTS-v2 weights are under the Coqui |
| Free Music Archive (mdeff/fma + FMA API) | dataset code MIT; tracks under various C | route-reference | Reference in references/audio-sources.md for background music beds. Note the original live FMA API has been un |
| Freesound (freesound.org API) | per-sound CC0 / CC-BY / CC-BY-NC / CC Sa | route-reference | Reference in references/audio-sources.md as the primary programmatic SFX source. Requires a free API token. CR |
| Jamendo Music API (jamendo.com) | tracks CC (per-track); commercial use vi | route-reference | Reference in references/audio-sources.md as a mood/tempo-tagged music source (the tempo tag helps beat-aligned |
| Kokoro TTS (hexgrad/kokoro, Kokoro-82M) | Apache-2.0 | route-reference | Top TTS pick for narration. pip dependency (too big to vendor the weights), reference in references/audio-tts. |
| MusicGen / AudioCraft (facebookresearch/audiocraft) | code MIT; model weights CC-BY-NC-4.0 (NO | route-reference | Reference in references/audio-sources.md ONLY with a non-commercial warning: the code is MIT but the pretraine |
| Musopen API (musopen.org) | public domain / CC0 recordings | route-reference | Reference in references/audio-sources.md as the zero-risk public-domain option for classical beds. Smaller/nic |
| Parler-TTS (huggingface/parler-tts) | Apache-2.0 | route-reference | Reference in references/audio-tts.md as the Apache-2.0 alternative to Chatterbox when the user wants text-desc |
| Piper (OHF-Voice/piper1-gpl) | GPL-3.0 (orig. rhasspy/piper was MIT, ar | route-reference | Reference in references/audio-tts.md as the lowest-resource TTS. The maintained repo is GPL-3.0, so do NOT ven |
| Pixabay Audio (pixabay.com API) | Pixabay Content License (royalty-free, c | route-reference | Reference in references/audio-sources.md as the best commercial-safe music/SFX source (ideal for the Cuki demo |
| Stable Audio Open (Stability-AI/stable-audio-tools) | Stability AI Community License (revenue- | route-reference | Reference in references/audio-sources.md for generated SFX/loops, WITH a license caveat: Stable Audio Open wei |
| aubio (aubio/aubio) | GPL-3.0 | route-reference | Reference in references/audio-beatsync.md as the CLI beat detector. GPL-3.0, so call the installed `aubiotrack |
| librosa (librosa/librosa) | ISC | route-reference | Top beat-detection pick. pip dependency; reference in references/audio-beatsync.md and vendor a tiny library/a |
| madmom (CPJKU/madmom) | BSD (non-commercial clause on patented b | route-reference | Reference in references/audio-beatsync.md as the high-accuracy beat-grid option, WITH a license caveat: madmom |

## captions

| Project | License | Action | Note |
|---|---|---|---|
| agricidaniel/claude-video | MIT | vendor | Vendor the caption pipeline scripts (Whisper -> word-level ASS karaoke -> FFmpeg burn) and the VMAF/SSIM/PSNR  |
| captacity (unconv/captacity) | MIT | vendor | Vendor the rendering core into library/captions/captacity/ (MIT, code-only, small pure-Python + ffmpeg). It is |
| troika-three-text | MIT (verified: package.json 0.52.4) | vendor | Code-only MIT. Add a thin Text3D primitive wrapper under library/primitives/ (and cite troika-three-text as an |
| @remotion/captions + @remotion/install-whisper-cpp | Remotion License (source-available, not  | route-reference | Reference only in references/captions-render.md for users already on Remotion. Do NOT vendor: the Remotion Lic |
| Vosk (alphacep/vosk-api) | Apache-2.0 | route-reference | Reference in references/captions-asr.md as the ultra-light offline option for low-resource machines (the user' |
| faster-whisper (SYSTRAN/faster-whisper) | MIT | route-reference | pip dependency, too large to vendor. Reference in references/captions-asr.md, and vendor a ~30-line thin wrapp |
| ffsubsync (smacke/ffsubsync) | MIT | route-reference | Reference in references/captions-asr.md for the case where the user already has a transcript/SRT that is out o |
| heygen-com/hyperframes | Apache-2.0 (engine; GSAP + fetched media | route-reference | Registry workflow is ALREADY reflected in references/hyperframes.md (catalog.py search + add + freshness cavea |
| stable-ts (jianfch/stable-ts) | MIT | route-reference | pip dependency. Reference in references/captions-asr.md as a post-processor layered on faster-whisper when raw |
| whisper.cpp (ggml-org/whisper.cpp) | MIT | route-reference | Reference in references/captions-asr.md: install the whisper-cli binary + a ggml model (base/small for speed), |
| whisperX (m-bain/whisperX) | BSD-4-Clause | route-reference | Reference only in references/captions-asr.md as the high-accuracy option. Do NOT vendor: heavy dep tree, BSD-4 |

## characters

| Project | License | Action | Note |
|---|---|---|---|
| @pixiv/three-vrm | MIT (verified: package.json 3.5.4) | route-reference | Route as an npm dep in references/characters.md as the true-3D character option alongside the existing SVG/spr |
| ProkStudio blender-rigging-and-animation | unknown | route-reference | NOT vendored and should NOT be vendored. Only a single SKILL.md snapshot sits in research/upstream/; its refer |
| Rive runtimes (rive-app: rive-wasm / rive-react) | MIT (runtimes); editor is proprietary Sa | route-reference | Runtimes are MIT/vendable, BUT the .riv content itself is authored in the proprietary Rive editor — a weak LLM |
| rive-wasm (rive-app/rive-wasm) | MIT | route-reference | MIT runtime; data-driven in that a weak model sets state-machine inputs (numbers/booleans/triggers) as JSON ra |
| wiggle-claude-skill (talknerdytome-labs) | unknown (LICENSE.txt present, terms unve | route-reference | Same Lottie-JSON mechanism as text-to-lottie but narrowly aimed at logo animation — a useful recipe to cite, n |

## data-viz

| Project | License | Action | Note |
|---|---|---|---|
| Canis (canisjs / canis-editor) | unknown | route-reference | Conceptually the strongest declarative chart-to-motion primitive (CGF 2020 paper; CAST+/Canis Studio successor |
| anichart.js (Jannchie/anichart.js) | MIT | route-reference | MIT and code-only, but a full ~1k-star engine (last push 2023; v3 planned to drop the ffmpeg/node render path) |
| harleycoops/math-to-manim | MIT | route-reference | Reference two transferable ideas in our storyboard/verify docs: (1) observations-not-images critique — convert |
| p5.js (processing/p5.js) | LGPL-2.1 | route-reference | License nuance: LGPL-2.1 is copyleft — fine to USE unmodified as a library (link via CDN/npm), but do NOT fork |
| vizreel (pypi 'vizreel') | unknown | route-reference | YAML+CSV spec is about the most weak-model-friendly data input in the batch (declarative, no code). Early (v0. |
| framechart | unknown | skip | Proprietary, freemium commercial product (one-time $99 / $19-mo), not open source. Skip for the library; the o |

## editing

| Project | License | Action | Note |
|---|---|---|---|
| kajisho5/ffmpeg-skill | MIT | vendor | ALREADY FULLY VENDORED at /home/h/video-forge/library/vendor/ffmpeg/{scripts,references,templates,LICENSE,UPST |
| Editly (mifi/editly) | MIT | route-reference | Highest-value JSON->video target for a weak LLM: the whole edit is one declarative object. Add references/edit |
| MLT Framework / melt (mltframework/mlt) | LGPL-2.1 (GPL for some modules) | route-reference | System package / LGPL — not vendorable. Route-reference as the timeline-XML render engine: `melt timeline.mlt  |
| MoviePy (Zulko/moviepy) | MIT | route-reference | The Python counterpart to the JS editing path; strong for caption/title overlays and compositing driven by sim |
| VapourSynth (vapoursynth/vapoursynth) | LGPL-2.1 | route-reference | LGPL system install. Route-reference for frame-exact, scriptable compositing/filtering where ffmpeg filtergrap |
| VidGear (abhiTronix/vidgear) | Apache-2.0 | route-reference | Apache-2.0; could vendor thin WriteGear helpers but overlaps MoviePy/ffmpeg-python. Route-reference as the alt |
| auto-editor (WyattBlue/auto-editor) | Unlicense (public domain) | route-reference | Public-domain (Unlicense) so freely usable, but it's a standalone binary (Nim), not code to vendor. Route-refe |
| browser-use/video-use | unknown (not stated in clone or research | route-reference | FFmpeg hard rules (subtitles-last, per-segment-extract-then-lossless-concat, overlay setpts PTS shift, SRT out |
| libopenshot (OpenShot/libopenshot) | LGPL-3.0 | route-reference | LGPL-3.0 and a compiled library — not vendorable. Route-reference as a programmatic timeline engine with Pytho |
| milanofthe/katana | MIT (c) Milan Rother; bundled fonts OFL- | route-reference | License is MIT (README + LICENSE); verified Rust export logic in src-tauri/src/export.rs + project.rs. NOT ven |

## motion2d

| Project | License | Action | Note |
|---|---|---|---|
| Curvable/motion | MIT | vendor | ALREADY FULLY WIRED, no action needed. License VERIFIED: /research/upstream/Curvable--motion/LICENSE ('MIT Lic |
| RenderComp/free-remotion-templates | MIT | vendor | ALREADY FULLY WIRED, no action needed. License VERIFIED from snapshot: /research/upstream/RenderComp--free-rem |
| Theatre.js (theatre-js/theatre) | Apache-2.0 (core) / AGPL-3.0 (studio, de | vendor | @theatre/core is Apache-2.0 and ships in the bundle (vendable); @theatre/studio is AGPL but is dev-only and ne |
| Two.js (jonobr1/two.js) | MIT | vendor | MIT, code-only, compact. Vendor into library/twojs/ as a scene-graph primitive layer when an agent needs to bu |
| anime.js v4 (juliangarnier/anime) | MIT | vendor | Small, MIT, code-only, fully param/JSON-describable timelines — ideal for browser-rendered scenes captured to  |
| awesome-skills/manim-skill (Yusuke710) | MIT | vendor | Vendor the low-quality-preview-then-final render ladder and the smoke-test idea (assert data invariants + time |
| iart-ai/motion-skills | MIT | vendor | Vendor the deliver-and-verify loop: the scripts/ toolkit that renders a frame -> screenshots -> re-inspects be |
| vumichien/manim-skill | Apache-2.0 | vendor | Vendor schemas/storyboard.schema.json (a concrete JSON-Schema storyboard contract the planner must satisfy bef |
| GSAP (greensock/GSAP) | GreenSock Standard (no-charge since Webf | route-reference | License nuance the task flagged: now free for commercial use but the 'Standard License' is a custom no-charge  |
| Manim Community (ManimCommunity/manim) | MIT | route-reference | Known set only has Blender/ffmpeg skills, not Manim. Strong for explainer/data/math motion. pip-installed (lar |
| Manim Community Edition (ManimCommunity/manim) | MIT | route-reference | MIT but code-first (Python Scene subclasses), the opposite of JSON-data-driven, so a weak model drives it poor |
| Revideo (midrender/revideo) | MIT | route-reference | MIT but a full framework (npm project, not a snippet). Route-reference as the recommended code-first motion-gr |
| Revideo (redotvideo/revideo) | MIT | route-reference | The known set has Motion Canvas (VideoZero/motion-canvas) as the editor; Revideo is the distinct programmatic/ |
| VideoFlow (ybouane/videoflow) | Apache-2.0 | route-reference | Best weak-model fit of the whole batch: the video is a single portable JSON doc, not a React/TS component tree |
| VideoZero/motion-canvas | unclear (skills repo license not in clon | route-reference | Already routed in engine-routing.md (Motion Canvas for equations/diagrams; 'requires running editor/client plu |
| Vincentwei1021/video-shotcraft | Apache-2.0 | route-reference | GAP: references/ has no beat-sync doc (only one line in motion-principles.md rule 10). Create references/beat- |
| diffusionstudio/lottie (text-to-lottie harness) | MIT | route-reference | MIT and on-theme for producing the Lottie JSON that lotio/python-lottie then render to video. Surfaced only in |
| diffusionstudio/lottie (text-to-lottie) | MIT | route-reference | Best fit for the task's 'weak LLM emits JSON -> motion' goal. MIT and code-only so vendable, but it ships as i |
| fernandokaraka/remotion-motion-graphics | MIT (LICENSE blob 1081 bytes, size-consi | route-reference | Mostly reflected: remotion-core.md ('always clamp both ends'), motion-principles.md (craft), agent-workflow.md |
| lotio (matrunchyk/lotio) | unknown | route-reference | Pure JSON-in -> frames-out CLI, ideal weak-model Lottie-to-video step and faster/cleaner than puppeteer-lottie |
| manim-skill (yusuke710/manim-skill) | MIT | route-reference | Reference implementation of the full narrated-explainer pipeline this skill already aims at. MIT and code-only |
| python-lottie (gitlab mattia.basaglia/python-lottie, pip 'lottie') | AGPL-3.0-or-later | route-reference | AGPLv3 strong copyleft => cannot vendor into an MIT/permissive skill library. Route as an external CLI depende |
| remotion-dev/skills (official) | Remotion License (source-available; free | route-reference | Do NOT vendor — license is source-available, not OSS, and commercial use at 4+ people needs a paid license. Re |
| showlab/Code2Video | MIT | route-reference | Cite the 'visual anchor prompt' critic mechanism (render frame, the VLM names where elements should sit relati |
| Diffusion Studio core (diffusionstudio/core) | MPL-2.0 (v1 only; v2+ commercial) | skip | Skip for vendoring: only the frozen v1 is MPL-2.0; current v2/v3 npm packages are commercial/non-commercial-re |
| etro (etro-js/etro) | GPL-3.0 | skip | GPL-3.0 forbids vendoring into a permissive skill and offers no CLI/one-command render. Skip; Revideo/Motion C |
| riaz37/remotion-ui | UNVERIFIABLE from snapshot (tree-only; r | skip | NOT WIRED: 0 vendored, 0 catalogued (grep 'riaz37/remotion-ui' in catalog.json = 0), not in SKILL.md. BLOCKED  |

## other

| Project | License | Action | Note |
|---|---|---|---|
| OpenTimelineIO (AcademySoftwareFoundation/OpenTimelineIO) | Apache-2.0 (modified) | vendor | Apache-2.0 permits vendoring. Install the lib via pip for the heavy part, but VENDOR small pure-Python helper  |
| Rough.js (rough-stuff/rough) | MIT | vendor | Small MIT code-only. Vendor into library/roughjs/ for hand-drawn/sketchy annotations, callouts and whiteboard- |
| ffmpeg-python (kkroening/ffmpeg-python) | Apache-2.0 | vendor | Apache-2.0, pure-Python wrapper. Vendor a filtergraph-kit module (reusable overlay/concat/xfade builders) into |
| HeyGen Code2Video Benchmark | proprietary (HeyGen/Kaggle benchmark, no | route-reference | Not vendorable (proprietary, and distinct from excluded heygen-com/hyperframes). Adopt its failure taxonomy as |
| fluent-ffmpeg (fluent-ffmpeg/node-fluent-ffmpeg) | MIT | route-reference | MIT; a node dependency rather than a snippet. Route-reference as the JS-side filtergraph option alongside ffmp |
| platan821/animation-techniques-kit | MIT | route-reference | GAP: this 'measured target instead of use-as-inspiration' loop is not in references/. Create references/refere |
| ayaanrustagi/cinematic-edit | unknown | skip | SKIP: clone failed (404). No content, no license, no mechanism. If this source is still wanted, re-fetch with  |

## recording

| Project | License | Action | Note |
|---|---|---|---|
| CapSoftware/Cap | AGPL-3.0 (most of repo); only cap-camera | route-reference | FLAG -- LICENSE SPLIT CONFIRMED from README License section: code in the cap-camera* and scap-* crate families |
| ccapture.js | MIT (verified) | route-reference | Route as a lightweight option for capturing an existing browser three.js canvas deterministically when not usi |
| headless-gl (stackgl/gl) | BSD-2-Clause (verified) | route-reference | Route in three-and-blender.md as the 'no headless-Chrome available' GL backend the existing doc already allude |
| siddharthvaddem/openscreen | MIT | route-reference | License is MIT (README + LICENSE) and it is the primary ZOOM/CURSOR/BLUR-RECORDING reference, cited in referen |

## templates

| Project | License | Action | Note |
|---|---|---|---|
| FFCreator (tnfe/FFCreator) | MIT | route-reference | MIT but heavy (node-canvas/OpenGL + ffmpeg native deps) so not code-only vendorable. Route-reference as a data |
| Finderchangchang/brewreel | Apache-2.0 (SKILL frontmatter; research. | route-reference | Core storyboard-fills-prewritten-scenes mechanism is ALREADY reflected (model-notes.md cites BrewReel; product |
| Remotion (remotion-dev/remotion) | Remotion License (source-available; free | route-reference | License nuance: NOT open-source and NOT vendable into a general skill library — company license (fees) require |
| ShotTower (DblK/shottower) | AGPL-3.0 | route-reference | AGPL-3.0 forbids vendoring into an MIT/permissive skill. Route-reference only: document the Shotstack JSON tim |

## transitions

| Project | License | Action | Note |
|---|---|---|---|
| Remocn/remocn | MIT | vendor | Vendor the registry.json pattern (a machine-readable component catalog the agent reads to pick primitives) and |
| degueba/onda | MIT | vendor | ALREADY FULLY WIRED, no action needed. License VERIFIED: /research/upstream/degueba--onda/LICENSE ('MIT Licens |
| FFCreator (drawcall/FFCreator) | MIT | route-reference | Config-object-driven like Editly but with richer built-in element animations/transitions — good weak-LLM fit.  |
| av/remotion-bits Scene3D + Element3D (+ transform3d/interpolate3d utils) | MIT | route-reference | NOT vendored (snapshot only in research/upstream/av--remotion-bits; repo license MIT per package.json). Do NOT |
| excalidraw-animate (dai-shi/excalidraw-animate) | unknown | route-reference | Diagram-to-motion driven purely by Excalidraw JSON + order/duration fields = clean weak-model data input. Lice |
| mo.js (mojs/mojs) | MIT | route-reference | MIT and param-driven (good weak-LLM fit for burst/transition effects), but largely unmaintained — so cite in r |
