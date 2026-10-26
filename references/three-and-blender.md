# True 3D made with code

Distinguish true geometry/lighting/camera from CSS perspective panels. Both can be
useful, but a rotating flat screenshot does not prove procedural 3D capability.

## Three.js / React Three Fiber

Use `@remotion/three` for a React video: ThreeCanvas, geometries/materials/lights and
transforms computed from `useCurrentFrame()/fps`. Avoid autonomous useFrame/clock
loops. Build the scene once; drive rotations, position, camera look-at and animation
mixer by absolute time. Use locally available textures and GLB files. Check geometry
scale, normals, color space, camera clipping, aspect, shadows and lighting.
For a GLB action use `mixer.setTime(seconds)` with a reset/absolute-time strategy;
check frame N after rendering later and earlier frames. Never integrate physics
incrementally in arbitrary seek order; bake it or replay deterministically.

`library/scenes/ProceduralObject3D.tsx` is a real mesh/material/light/camera starter,
not a CSS mock. It requires `three`, `@react-three/fiber` and `@remotion/three` compatible
with the installed React/Remotion versions. Install only when used. Render under
headless Chrome with a tested GL backend; use software rendering if hardware is absent.

## Blender Python

For authored geometry, modeling, sculpt-like procedural forms, rigging, keyframed
cameras, materials or heavier lighting use Python/bpy in Blender headless.
Bundled `library/vendor/blender/scripts/` has CLI wrappers that pass JSON into bpy and
read JSON results, avoiding parsing the full Blender log. Read its README and the
selected script's --help. Installation of Blender is separate; missing executable
must be reported instead of claiming the render ran.

Prefer an image sequence for expensive shots so interrupted renders resume. Encode
at the storyboard fps with FFmpeg. For transparent objects keep alpha intermediates
and composite on the final background before H.264 delivery. Preserve .blend/source
scripts and external texture paths.

## Assets and animation

Source suitable GLB/FBX/VRM from supplied files, Kenney, Quaternius or Poly Haven;
see asset-sourcing.md. Inspect license and rig/action compatibility. Use a consistent
camera language and one lighting design across 3D and 2D scenes. For rigging: joint
placement, topology, skin weights, IK/FK, action baking and stable export matter more
than a long prompt. ProkStudio's rigging skill and kajisho5's headless asset tools are
studied references, not a promise that any supplied model is automatically riggable.
