// SPDX-License-Identifier: MIT
//
// Video Forge — Character3D
// Renders a rigged glTF/GLB model with ONE of its baked skeletal animations, fully
// frame-deterministic and seekable: the pose at frame N is a pure function of N.
//
// Determinism:
//   - The GLB is loaded with drei's useGLTF, which suspends; <Suspense> lets Remotion wait for
//     the asset before snapshotting a frame (no manual setState/continueRender race).
//   - A single THREE.AnimationMixer plays exactly ONE clip and is advanced with
//     mixer.setTime(frame / fps) on every render — ABSOLUTE time, no deltas, never r3f useFrame.
//   - Turntable phase/speed come from a seeded mulberry32 PRNG, never Math.random() at render.
//
// Asset license: the GLB you pass via `model` carries its OWN license (CC0 / CC-BY per model —
// see assets/assets3d/CREDITS.md). This component is MIT; the artwork is not.
//
// RENDERER NOTE: skinned (rigged) meshes need a WebGL backend that supports skeletal animation.
// A full Chrome/ANGLE backend renders them fine; a minimal headless GL (e.g. chrome-headless-shell
// on a low-end box) can draw simple meshes but may render skinned meshes as empty. If the 3D
// viewport comes out blank, the fix is the renderer/GPU, not this component — verify in a browser.
import React, { Suspense, useMemo } from "react";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGLTF } from "@react-three/drei";
import { AnimationMixer, Box3, Vector3 } from "three";

/** Deterministic string -> [0,1) PRNG (mulberry32). */
function makeRng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Character3DProps {
  /** Public path to the rigged GLB (e.g. "3d/RobotExpressive.glb"), or an absolute URL. */
  model: string;
  /** Which baked clip to play (name, case-insensitive, or index). Default: first clip. */
  clip?: string | number;
  /** Deterministic seed for the subtle turntable. */
  seed?: string;
  background?: string;
  accent?: string;
  textColor?: string;
  title?: string;
  subtitle?: string;
}

export const defaultCharacter3DProps: Character3DProps = {
  model: "3d/RobotExpressive.glb",
  seed: "video-forge",
  background: "#0e1116",
  accent: "#C6F56A",
  textColor: "#F2F5F0",
  title: "",
  subtitle: "",
};

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const Rig: React.FC<{ model: string; seed: string; accent: string; clip?: string | number }> = ({
  model,
  seed,
  accent,
  clip,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const url = /^https?:\/\//.test(model) ? model : staticFile(model);

  // Suspends until the GLB is parsed; cached by URL (deterministic).
  const gltf = useGLTF(url) as unknown as { scene: any; animations: any[] };

  const mixer = useMemo(() => {
    const m = new AnimationMixer(gltf.scene);
    const anims = gltf.animations || [];
    let chosen = anims[0];
    if (anims.length && clip !== undefined) {
      if (typeof clip === "number") {
        chosen = anims[((clip % anims.length) + anims.length) % anims.length];
      } else {
        const f = anims.find((c: any) => c.name.toLowerCase() === String(clip).toLowerCase());
        if (f) chosen = f;
      }
    }
    if (chosen) m.clipAction(chosen).play();
    return m;
  }, [gltf.scene, gltf.animations, clip]);

  // Absolute-time pose — the deterministic heartbeat.
  mixer.setTime(frame / fps);

  // Auto-fit (center + scale longest axis to a target world size), robust to empty boxes.
  const { fitScale, center } = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(gltf.scene);
    const size = box.getSize(new Vector3());
    const c = box.getCenter(new Vector3());
    let maxDim = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(maxDim) || maxDim <= 0) maxDim = 2;
    return {
      fitScale: 2.4 / maxDim,
      center: [
        Number.isFinite(c.x) ? c.x : 0,
        Number.isFinite(c.y) ? c.y : 0,
        Number.isFinite(c.z) ? c.z : 0,
      ] as [number, number, number],
    };
  }, [gltf.scene]);

  const rng = useMemo(() => makeRng(seed), [seed]);
  const { phase, speed } = useMemo(() => ({ phase: rng() * Math.PI * 2, speed: 0.1 + rng() * 0.1 }), [rng]);
  const yaw = phase + (frame / fps) * speed;

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} color={accent} />
      <directionalLight position={[-5, 2, -3]} intensity={0.9} color="#ffffff" />
      <group rotation={[0, yaw, 0]} position={[0, -0.15, 0]}>
        <group
          scale={fitScale}
          position={[-center[0] * fitScale, -center[1] * fitScale, -center[2] * fitScale]}
        >
          <primitive object={gltf.scene} />
        </group>
      </group>
    </>
  );
};

export const Character3D: React.FC<Partial<Character3DProps>> = (props) => {
  const p = { ...defaultCharacter3DProps, ...props };
  const { width, height } = useVideoConfig();
  const scale = Math.min(width, height);

  return (
    <AbsoluteFill style={{ backgroundColor: p.background }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0.4, 4.4], fov: 42, near: 0.1, far: 100 }}
        style={{ background: p.background as string }}
      >
        <Suspense fallback={null}>
          <Rig model={p.model} seed={p.seed ?? "video-forge"} accent={p.accent as string} clip={p.clip} />
        </Suspense>
      </ThreeCanvas>

      {(p.title || p.subtitle) && (
        <div style={{ position: "absolute", left: scale * 0.06, bottom: scale * 0.06, display: "flex", flexDirection: "column", gap: scale * 0.014, maxWidth: width * 0.8 }}>
          {p.title && (
            <div style={{ fontFamily: FONT, fontSize: scale * 0.072, fontWeight: 800, lineHeight: 1.03, color: p.textColor, textShadow: "0 2px 18px rgba(0,0,0,0.6)", borderLeft: `${Math.max(3, scale * 0.006)}px solid ${p.accent}`, paddingLeft: scale * 0.022 }}>
              {p.title}
            </div>
          )}
          {p.subtitle && (
            <div style={{ fontFamily: FONT, fontSize: scale * 0.03, fontWeight: 400, color: p.textColor, opacity: 0.74, paddingLeft: scale * 0.022, textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
              {p.subtitle}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Character3D;
