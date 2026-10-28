// SPDX-License-Identifier: MIT
// Deterministic, seed-driven particle/spark layer for premium polish. This is NOT a full
// scene: it has a transparent background by default so it overlays content (or sits behind
// it over an optional base `background`). Pure code, no assets — the only license is this
// file's own MIT.
//
// Frame-deterministic & seekable: every particle's position/opacity/size is a pure function
// of useCurrentFrame() plus a mulberry32 PRNG seeded from the string `seed` prop. There is no
// wall clock, no setInterval/requestAnimationFrame, no Date, no Math.random() at render time,
// and no r3f useFrame — so any frame can be rendered in isolation and looks identical every
// time. Tasteful by design: low-opacity accent-tinted dots with gentle drift, parallax and
// twinkle. Polish, not confetti.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// mulberry32 PRNG seeded from a string — deterministic, no global state, no Math.random.
function makeRng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
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

export type ParticlesProps = {
  /** Seed string: same seed → identical layout and motion, every render. */
  seed: string;
  /** Accent color (hex). Particles are tinted from this at low opacity. */
  accent: string;
  /** How many particles to lay out. Keep it subtle — this is polish. Default 48. */
  count?: number;
  /** Optional opaque base color. Omit (default) to keep the layer transparent so it overlays. */
  background?: string;
};

export const defaultParticlesProps: ParticlesProps = {
  seed: "particles-01",
  accent: "#7cf2c0",
  count: 48,
  background: undefined,
};

type Particle = {
  x: number; // base position, 0..1 of width
  y: number; // base position, 0..1 of height
  r: number; // radius in px (pre-scale)
  depth: number; // 0..1 parallax factor — near particles drift more
  driftX: number; // horizontal drift amplitude, 0..1 of width
  driftY: number; // vertical drift amplitude, 0..1 of height
  freq: number; // drift speed multiplier
  phase: number; // seeded phase so motion is desynchronised
  twFreq: number; // twinkle speed
  twPhase: number; // twinkle phase
  baseOp: number; // base opacity (already low)
};

export const Particles: React.FC<ParticlesProps> = ({
  seed,
  accent,
  count = 48,
  background,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const [ar, ag, ab] = useMemo(() => hexToRgb(accent), [accent]);

  // Lay out all particles once from the seed. Memoised on seed/count only so the layout is
  // stable across every frame — motion below is derived purely from `frame`.
  const particles = useMemo<Particle[]>(() => {
    const r = makeRng("particles:" + seed);
    const n = Math.max(0, Math.floor(count));
    return Array.from({ length: n }, () => {
      const depth = r(); // 0 (far) .. 1 (near)
      return {
        x: r(),
        y: r(),
        r: 0.8 + r() * 2.2 + depth * 1.6, // near particles slightly larger
        depth,
        driftX: 0.006 + r() * 0.02,
        driftY: 0.006 + r() * 0.02,
        freq: 0.3 + r() * 0.6,
        phase: r() * Math.PI * 2,
        twFreq: 0.4 + r() * 0.9,
        twPhase: r() * Math.PI * 2,
        baseOp: 0.12 + r() * 0.22, // kept low on purpose
      };
    });
  }, [seed, count]);

  const t = frame / fps; // seconds — pure function of the frame

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background ?? "transparent",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {particles.map((p, i) => {
          // Gentle drift via sin/cos with seeded phase; parallax scales by depth.
          const par = 0.4 + p.depth * 0.6;
          const dx = Math.sin(t * p.freq + p.phase) * p.driftX * width * par;
          const dy = Math.cos(t * p.freq * 0.8 + p.phase) * p.driftY * height * par;
          const cx = p.x * width + dx;
          const cy = p.y * height + dy;

          // Twinkle: opacity breathes between ~50% and 100% of the (already low) base.
          const tw = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * p.twFreq + p.twPhase));
          const op = p.baseOp * tw;
          const rad = p.r * (0.6 + p.depth * 0.7);

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={rad}
              fill={`rgba(${ar},${ag},${ab},${op.toFixed(3)})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default Particles;
