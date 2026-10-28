// SPDX-License-Identifier: MIT
//
// Video Forge — CharacterProcedural ("figure3d")
// A 3D character built ENTIRELY in code from three.js primitives (capsules, spheres, boxes) and
// animated by rotating its parts every frame. No model file, no license to track, no skinned
// mesh — which is exactly why it renders on minimal headless WebGL where rigged GLBs come out
// blank. This is also how most "made with Claude" 3D characters are actually built.
//
// Determinism: every pose is a pure function of (seed, frame). Proportions, palette variant and
// animation mode come from a seeded mulberry32 PRNG; motion uses frame/fps only. No Math.random
// at render time, no wall clock, no r3f useFrame.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";

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
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export type FigureMode = "walk" | "wave" | "dance" | "idle";

export interface CharacterProceduralProps {
  seed?: string;
  /** Animation mode; default chosen by seed. */
  mode?: FigureMode;
  background?: string;
  accent?: string;
  textColor?: string;
  title?: string;
  subtitle?: string;
}

export const defaultCharacterProceduralProps: CharacterProceduralProps = {
  seed: "video-forge",
  background: "#0e1116",
  accent: "#C6F56A",
  textColor: "#F2F5F0",
  title: "",
  subtitle: "",
};

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MODES: FigureMode[] = ["walk", "wave", "dance", "idle"];

/** Seeded proportions + palette variant: a different figure per seed, all within taste. */
function deriveFigure(seed: string, accent: string, background: string, textColor: string) {
  const r = makeRng("fig:" + seed);
  const head = 0.38 + r() * 0.09;
  const torsoR = 0.34 + r() * 0.08;
  const limb = 0.9 + r() * 0.25;
  const antenna = r() > 0.35;
  const mode = MODES[Math.floor(r() * MODES.length)];
  const variant = Math.floor(r() * 3);
  // Body: light, slightly accent-tinted (reads on dark grounds); joints/visor: deep neutral.
  const body = variant === 0 ? mix(textColor, accent, 0.22) : variant === 1 ? mix("#DDE3EA", accent, 0.12) : mix("#F1E9D8", accent, 0.15);
  const dark = mix(background, "#000000", 0.35);
  const trim = accent;
  const phase = r() * Math.PI * 2;
  const spin = 0.08 + r() * 0.1;
  return { head, torsoR, limb, antenna, mode, body, dark, trim, phase, spin };
}

const Mat: React.FC<{ color: string; metal?: number; rough?: number; emissive?: string; ei?: number }> = ({ color, metal = 0.25, rough = 0.5, emissive, ei = 0 }) => (
  <meshStandardMaterial color={color} metalness={metal} roughness={rough} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
);

const Figure: React.FC<{ seed: string; mode?: FigureMode; accent: string; background: string; textColor: string }> = ({ seed, mode, accent, background, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = useMemo(() => deriveFigure(seed, accent, background, textColor), [seed, accent, background, textColor]);
  const m = mode ?? f.mode;

  // ---- Motion (pure functions of t) ----
  const w = Math.PI * 2 * 1.15; // walk cadence
  const sw = Math.sin(w * t), sw2 = Math.sin(2 * w * t);
  let legL = 0, legR = 0, armL = 0, armR = 0, armRz = 0, armLz = 0, bob = 0, lean = 0, headY = 0, headX = 0, yawOsc = 0, breathe = 1;
  if (m === "walk") {
    legL = 0.55 * sw; legR = -0.55 * sw; armL = -0.42 * sw; armR = 0.42 * sw;
    bob = 0.035 * Math.abs(sw2); lean = 0.06; headY = 0.08 * sw;
  } else if (m === "wave") {
    armRz = -2.25 + Math.sin(t * 7) * 0.32; armLz = 0.12; armL = 0.05 * Math.sin(t * 1.5);
    bob = 0.015 * Math.sin(t * 2.2); headY = 0.12 * Math.sin(t * 1.1); breathe = 1 + 0.015 * Math.sin(t * 2.2);
  } else if (m === "dance") {
    bob = 0.07 * Math.abs(Math.sin(t * 4.2)); armRz = -0.7 - 0.6 * Math.sin(t * 4.2); armLz = 0.7 + 0.6 * Math.sin(t * 4.2 + Math.PI);
    legL = 0.18 * Math.sin(t * 4.2); legR = -0.18 * Math.sin(t * 4.2); yawOsc = 0.35 * Math.sin(t * 2.1); headX = 0.08 * Math.sin(t * 8.4);
  } else {
    breathe = 1 + 0.02 * Math.sin(t * 2.0); headY = 0.28 * Math.sin(t * 0.8); armL = 0.06 * Math.sin(t * 1.3); armR = -0.06 * Math.sin(t * 1.3 + 1);
  }
  // Face the camera (hero shot) with a seeded 3/4 bias and a slow sway — never spin to the back.
  const yaw = Math.sin(f.phase) * 0.35 + Math.sin(t * 0.45 + f.phase) * 0.18 + yawOsc;

  // ---- Proportions ----
  const H = f.head, TR = f.torsoR, L = f.limb;
  const legLen = 0.64 * L, legR_ = 0.13, armLen = 0.46 * L, armR_ = 0.1;
  const hipY = 0, torsoY = 0.62, shoulderY = 0.95, headY0 = 1.62 + (H - 0.42);
  const feetY = hipY - legLen - legR_ - 0.02;

  const Limb: React.FC<{ x: number; y: number; rx: number; rz: number; len: number; rad: number; end: "hand" | "foot" }> = ({ x, y, rx, rz, len, rad, end }) => (
    <group position={[x, y, 0]} rotation={[rx, 0, rz]}>
      <mesh position={[0, -len / 2, 0]}>
        <capsuleGeometry args={[rad, len, 6, 16]} />
        <Mat color={f.body} />
      </mesh>
      {end === "hand" ? (
        <mesh position={[0, -len - rad * 0.9, 0]}>
          <sphereGeometry args={[rad * 1.25, 20, 20]} />
          <Mat color={f.dark} rough={0.6} />
        </mesh>
      ) : (
        <mesh position={[0, -len - rad * 0.55, rad * 0.55]}>
          <capsuleGeometry args={[rad * 0.95, rad * 1.3, 6, 14]} />
          <Mat color={f.dark} rough={0.65} />
        </mesh>
      )}
    </group>
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.6} color={mix(accent, "#ffffff", 0.55)} />
      <pointLight position={[-3.5, 1.2, 3]} intensity={14} color="#ffffff" />
      <pointLight position={[0, 2.5, -4]} intensity={18} color={accent} />

      <group position={[0.75, -0.95 + bob, 0]} rotation={[0, yaw, 0]}>
        {/* ground shadow */}
        <mesh position={[0, feetY - 0.01 - bob, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 40]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.38} />
        </mesh>

        <group rotation={[lean, 0, 0]}>
          {/* legs */}
          <Limb x={-TR * 0.5} y={hipY} rx={legL} rz={0.04} len={legLen} rad={legR_} end="foot" />
          <Limb x={TR * 0.5} y={hipY} rx={legR} rz={-0.04} len={legLen} rad={legR_} end="foot" />

          {/* torso */}
          <group position={[0, torsoY, 0]} scale={[1, breathe, 1]}>
            <mesh>
              <capsuleGeometry args={[TR, 0.5, 8, 24]} />
              <Mat color={f.body} metal={0.3} rough={0.42} />
            </mesh>
            {/* chest light */}
            <mesh position={[0, 0.06, TR * 0.98]}>
              <sphereGeometry args={[0.075, 18, 18]} />
              <Mat color={f.trim} emissive={f.trim} ei={1.6} rough={0.3} />
            </mesh>
            {/* belt */}
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[TR * 1.02, TR * 1.02, 0.06, 28]} />
              <Mat color={f.dark} rough={0.55} />
            </mesh>
          </group>

          {/* arms */}
          <Limb x={-(TR + armR_ * 0.9)} y={shoulderY} rx={armL} rz={armLz} len={armLen} rad={armR_} end="hand" />
          <Limb x={TR + armR_ * 0.9} y={shoulderY} rx={armR} rz={armRz} len={armLen} rad={armR_} end="hand" />

          {/* head */}
          <group position={[0, headY0, 0]} rotation={[headX, headY, 0]}>
            <mesh>
              <sphereGeometry args={[H, 32, 32]} />
              <Mat color={f.body} metal={0.3} rough={0.4} />
            </mesh>
            {/* visor: a dark ellipsoid hugging the face (no hard slab) */}
            <mesh position={[0, 0.03, H * 0.52]} scale={[1.28, 0.58, 0.62]}>
              <sphereGeometry args={[H * 0.72, 28, 28]} />
              <Mat color={f.dark} metal={0.55} rough={0.22} />
            </mesh>
            {/* eyes */}
            <mesh position={[-H * 0.2, 0.05, H * 0.92]}>
              <sphereGeometry args={[H * 0.1, 16, 16]} />
              <Mat color={f.trim} emissive={f.trim} ei={2.2} />
            </mesh>
            <mesh position={[H * 0.2, 0.05, H * 0.92]}>
              <sphereGeometry args={[H * 0.1, 16, 16]} />
              <Mat color={f.trim} emissive={f.trim} ei={2.2} />
            </mesh>
            {/* ears */}
            <mesh position={[-H * 1.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[H * 0.22, H * 0.22, H * 0.18, 20]} />
              <Mat color={f.dark} rough={0.5} />
            </mesh>
            <mesh position={[H * 1.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[H * 0.22, H * 0.22, H * 0.18, 20]} />
              <Mat color={f.dark} rough={0.5} />
            </mesh>
            {/* antenna */}
            {f.antenna && (
              <>
                <mesh position={[0, H + 0.16, 0]}>
                  <cylinderGeometry args={[0.02, 0.025, 0.32, 10]} />
                  <Mat color={f.dark} />
                </mesh>
                <mesh position={[0, H + 0.36, 0]}>
                  <sphereGeometry args={[0.065, 16, 16]} />
                  <Mat color={f.trim} emissive={f.trim} ei={2.5} />
                </mesh>
              </>
            )}
          </group>
        </group>
      </group>
    </>
  );
};

export const CharacterProcedural: React.FC<Partial<CharacterProceduralProps>> = (props) => {
  const p = { ...defaultCharacterProceduralProps, ...props };
  const { width, height } = useVideoConfig();
  const scale = Math.min(width, height);
  return (
    <AbsoluteFill style={{ backgroundColor: p.background }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0.55, 5.3], fov: 36, near: 0.1, far: 100 }} style={{ background: p.background as string }}>
        <Figure seed={p.seed ?? "video-forge"} mode={p.mode} accent={p.accent as string} background={p.background as string} textColor={p.textColor as string} />
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

export default CharacterProcedural;
