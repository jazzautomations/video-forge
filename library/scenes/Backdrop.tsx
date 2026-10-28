// SPDX-License-Identifier: MIT
// Generative, seed-driven backdrop + film grain so scenes stop reading as flat vector slop.
// Everything is pure code and frame-deterministic (seekable): blob shapes come from `blobs` (MIT),
// their slow drift from a seeded simplex-noise field (simplex-noise, MIT), and the grain from an
// SVG feTurbulence whose seed is a function of the frame only. No Math.random at runtime, no wall
// clock. Colors come strictly from the theme (a toned radial glow, never a flat fill and never the
// banned linear purple->blue wash).
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { createNoise2D } from "simplex-noise";
import { svgPath } from "blobs/v2";

// mulberry32 PRNG seeded from a string — deterministic, no global state.
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

function hashInt(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h >>> 0);
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a); const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

export type BackdropProps = {
  seed: string;
  background: string;
  accent: string;
  /** Grain strength 0..1 (default 0.12 — the texture does the work, not the glow). */
  grain?: number;
};

export const Backdrop: React.FC<BackdropProps> = ({ seed, background, accent, grain = 0.18 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const r = useMemo(() => makeRng("bd:" + seed), [seed]);
  const noise = useMemo(() => createNoise2D(makeRng("nz:" + seed)), [seed]);

  const blobs = useMemo(() => {
    const n = 2 + Math.floor(r() * 2); // 2–3
    return Array.from({ length: n }, (_, i) => ({
      d: svgPath({ seed: `${seed}-${i}`, extraPoints: 6 + Math.floor(r() * 6), randomness: 3 + Math.floor(r() * 4), size: 1000 }),
      bx: 0.1 + r() * 0.8,
      by: 0.1 + r() * 0.8,
      scale: 0.4 + r() * 0.55,
      color: mix(accent, background, i % 2 === 0 ? 0.5 : 0.28),
      op: 0.04 + r() * 0.05,
      ph: r() * 10,
    }));
  }, [seed, r, accent, background, noise]);

  const t = frame / fps;
  const gid = "grain-" + (hashInt(seed) % 100000);
  const glow = mix(accent, background, 0.06);

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      {/* Toned radial glow — depth without a flat fill. */}
      <AbsoluteFill style={{ background: `radial-gradient(85% 65% at 16% 12%, ${glow} 0%, ${background} 52%)` }} />

      {/* Soft seeded blobs drifting slowly (noise-driven, not a loop). */}
      <AbsoluteFill>
        {blobs.map((b, i) => {
          const S = Math.min(width, height) * b.scale;
          const dx = noise(i * 3.1 + b.ph, t * 0.05) * width * 0.03;
          const dy = noise(i * 7.7 + b.ph, t * 0.045 + 5) * height * 0.03;
          return (
            <svg key={i} width={S} height={S} viewBox="0 0 1000 1000"
              style={{ position: "absolute", left: b.bx * width + dx - S / 2, top: b.by * height + dy - S / 2, filter: `blur(${S * 0.05}px)`, opacity: b.op }}>
              <path d={b.d} fill={b.color} />
            </svg>
          );
        })}
      </AbsoluteFill>

      {/* Film grain: deterministic feTurbulence, seed a function of frame only. */}
      <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: grain, pointerEvents: "none" }}>
        <svg width={width} height={height}>
          <filter id={gid}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={(Math.floor(frame) * 7) % 97} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${gid})`} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Backdrop;
