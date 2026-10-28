# 3D Asset Credits — video-forge/assets/assets3d

All files in this directory are bundle-safe for redistribution in the video-forge
skill. Each is a glTF Binary (`.glb`, glTF 2.0) with a skeleton (`skins >= 1`) and
one or more skeletal animations, so each can be driven by a three.js `AnimationMixer`.

License verified against the upstream model's own README / LICENSE at download time
(2026-10-27). Files whose license could NOT be confirmed bundle-safe were NOT kept
(see "Rejected" below).

CC-BY-4.0 files are bundle-safe **only with attribution** — this file provides it.
Keep this CREDITS.md shipped alongside the assets.

---

## Files

### RobotExpressive.glb
- **SPDX-License-Identifier:** `CC0-1.0`
- **Source:** https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb
- **Upstream dir / license:** https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive (README.md states "CC0 1.0")
- **Author:** Tomás Laulhé (Quaternius, https://quaternius.com / https://www.patreon.com/quaternius). Modifications by Don McCurdy (added facial-expression morph targets, FBX2GLTF conversion).
- **Skeleton/anims:** skins=2, 14 animations (Dance, Death, Idle, Jump, No, Punch, Running, Sitting, Standing, ThumbsUp, Walking, WalkJump, Wave, Yes).
- **sha256:** 047f5e5fb3bb6d378bd1df16ca6137f2a596c99b3a1b5690b4020c05aaf6f319
- **bytes:** 463988

### Fox.glb
- **SPDX-License-Identifier:** `CC-BY-4.0` (combined file; base mesh is CC0, rig+animation is CC-BY-4.0, so the bundled GLB as a whole is governed by CC-BY-4.0)
- **Source:** https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb
- **Upstream dir / license:** https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox (README.md Legal section)
- **Authors:** Model © 2014 PixelMannen — CC0-1.0. Rigging & Animation © 2014 tomkranis — CC-BY-4.0. glTF conversion © 2017 @AsoboStudio and @scurest — CC-BY-4.0.
- **Skeleton/anims:** skins=1, 3 animations (Survey, Walk, Run).
- **sha256:** d97044e701822bac5a62696459b27d7b375aada5de8574ed4362edbba94771f7
- **bytes:** 162852

### CesiumMan.glb
- **SPDX-License-Identifier:** `CC-BY-4.0`
- **Source:** https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb
- **Upstream dir / license:** https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CesiumMan (README.md Legal section)
- **Author:** © 2017 Cesium — CC-BY-4.0. (Cesium logo on the texture is a non-copyrightable legal mark per LicenseRef-LegalMark-Cesium; it is a trademark, not a copyright restriction, so it does not block redistribution — avoid implying Cesium endorsement.)
- **Skeleton/anims:** skins=1, 1 animation (walk cycle).
- **sha256:** b7001eaeea8254bd44773bcd247e78696d94169388fbb2a1800fc69434e777d9
- **bytes:** 438044

### RiggedFigure.glb
- **SPDX-License-Identifier:** `CC-BY-4.0`
- **Source:** https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RiggedFigure/glTF-Binary/RiggedFigure.glb
- **Upstream dir / license:** https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/RiggedFigure (README.md Legal section)
- **Author:** © 2017 Cesium — CC-BY-4.0.
- **Skeleton/anims:** skins=1, 1 animation.
- **sha256:** d6be85417d3e256861ee733eea6916093a7af7c79c16366181fd8abcaeb38cf5
- **bytes:** 50116

### RiggedSimple.glb
- **SPDX-License-Identifier:** `CC-BY-4.0`
- **Source:** https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RiggedSimple/glTF-Binary/RiggedSimple.glb
- **Upstream dir / license:** https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/RiggedSimple (README.md Legal section)
- **Author:** © 2017 Cesium — CC-BY-4.0.
- **Skeleton/anims:** skins=1, 1 animation. Minimal two-bone rig, good for skinning smoke-tests.
- **sha256:** 3a79dabb67bb0cd598a18d08b954d9d357c27c30672f82ef5d3f4e7fe6ca3401
- **bytes:** 15104

---

## Rejected (NOT downloaded / not kept — license not bundle-safe)

- **BrainStem** (KhronosGroup/glTF-Sample-Assets/Models/BrainStem) — License is the
  **Poser EULA** (`LicenseRef-Poser-EULA`), not an open license. Not redistributable
  in a bundle. Rejected despite being an attractive rigged+animated robot.

## Notes on license mix

- Only **RobotExpressive.glb** is pure CC0-1.0.
- The four Khronos models are **CC-BY-4.0** (Fox is CC0 mesh + CC-BY-4.0 rig/anim,
  so the combined GLB is treated as CC-BY-4.0). CC-BY-4.0 is OSS bundle-safe provided
  attribution is shipped — this file is that attribution. If the skill requires
  strictly CC0 assets with zero attribution obligation, keep only RobotExpressive.glb.
