// SPDX-License-Identifier: MIT
//
// Video Forge "IconStrip" scene — renders a small set of lucide-react icons as a clean,
// staggered row/grid that scales + fades in, themed with accent/text colors, with an
// optional title/subtitle.
//
// WHY THIS IS SEEKABLE: every bit of motion is derived from Remotion's useCurrentFrame()
// and useVideoConfig(). There is NO wall clock anywhere — no setInterval /
// requestAnimationFrame / Date.now() / r3f useFrame. Given the same frame you always get
// the same picture, so scrubbing and distributed (multi-worker) rendering are deterministic.
//
// WHY NO delayRender(): lucide-react icons are plain synchronous React SVG components that
// are bundled with the composition. Nothing is fetched at render time, so there is no async
// asset to hold a frame for. (If you ever swap in remotely-loaded SVGs, wrap the load in
// delayRender()/continueRender() and cancelRender() on error, per the Video Forge rules.)
//
// RANDOMNESS: never Math.random() at render time. The only variation (a tiny entrance
// rotation/lift per icon) comes from a mulberry32 PRNG seeded from the string `seed` prop,
// so the same seed always produces the same frames.
//
// ASSET / ICON LICENSE NOTE: this component's CODE is MIT. The icons themselves come from
// lucide-react, which is distributed under the ISC license (Lucide icons derive from
// Feather, also ISC). Keep lucide-react's LICENSE in your dependency tree and attribute
// Lucide where your project credits third-party assets. Our MIT license does not relicense
// the icon set.
//
// deps: lucide-react
// Verified against Remotion 4.0.538.

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type IconStripProps = {
  /**
   * lucide-react export names in PascalCase, e.g. ['Folder', 'Terminal', 'GitBranch'].
   * Unknown names fall back to a default icon so a typo never crashes the render.
   */
  icons: string[];
  /** Deterministic seed for the subtle per-icon entrance variation (no RNG at render time). */
  seed?: string;
  /** Theme: page background behind the strip. */
  background?: string;
  /** Theme: accent used for the icon tiles / glyph stroke / title underline. */
  accent?: string;
  /** Theme: primary text + icon color for the title/subtitle. */
  textColor?: string;
  /** Optional heading shown above the strip. Empty => strip is vertically centered. */
  title?: string;
  /** Optional supporting line under the title. */
  subtitle?: string;
};

export const defaultIconStripProps: IconStripProps = {
  icons: ["Folder", "Terminal", "GitBranch", "Boxes", "Rocket"],
  seed: "video-forge",
  background: "#101710",
  accent: "#D7FF64",
  textColor: "#F3F1E9",
  title: "",
  subtitle: "",
};

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Fallback when a requested export name is not an actual lucide-react icon.
// HelpCircle exists in every modern lucide-react; Circle is a last-ditch guard.
const FALLBACK_ICON: LucideIcon =
  (LucideIcons as Record<string, unknown>).HelpCircle as LucideIcon ??
  ((LucideIcons as Record<string, unknown>).Circle as LucideIcon);

// Resolve a lucide export name -> component, SAFELY. lucide-react also ships non-icon
// exports (createLucideIcon, icons, etc.), so we accept a name only if it looks like an
// icon component (a function/object whose name is PascalCase) and otherwise fall back.
function resolveIcon(name: string): LucideIcon {
  const candidate = (LucideIcons as Record<string, unknown>)[name];
  const looksLikeComponent =
    typeof candidate === "function" ||
    (typeof candidate === "object" && candidate !== null);
  const looksLikeIconName = /^[A-Z][A-Za-z0-9]*$/.test(name);
  if (candidate && looksLikeComponent && looksLikeIconName) {
    return candidate as LucideIcon;
  }
  return FALLBACK_ICON;
}

// mulberry32 PRNG seeded from a string — deterministic, no Math.random at render time.
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

export const IconStrip: React.FC<IconStripProps> = ({
  icons = defaultIconStripProps.icons,
  seed = "video-forge",
  background = "#101710",
  accent = "#D7FF64",
  textColor = "#F3F1E9",
  title = "",
  subtitle = "",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width, height);

  // Guard against an empty list so the scene always has something to lay out.
  const names = icons && icons.length > 0 ? icons : defaultIconStripProps.icons;

  // Resolve each name once and precompute a tiny, seed-stable entrance offset per icon.
  // Memoized on names+seed so the PRNG is consumed in a stable order (deterministic).
  const resolved = useMemo(() => {
    const rng = makeRng("iconstrip:" + seed);
    return names.map((name, i) => ({
      key: `${name}-${i}`,
      Icon: resolveIcon(name),
      // small deterministic entrance rotation in degrees, -5..+5
      rot: (rng() - 0.5) * 10,
      // small deterministic extra lift in px (scaled below), 0..1
      lift: rng(),
    }));
  }, [names, seed]);

  const count = resolved.length;

  // Layout: a centered flex-wrap row. Tile size shrinks as the count grows so a longer
  // set still fits comfortably across the frame.
  const tile = Math.max(scale * 0.09, Math.min(scale * 0.16, (width * 0.72) / count));
  const glyph = Math.round(tile * 0.52);
  const gap = tile * 0.34;

  const hasText = Boolean(title || subtitle);

  // Entrance pacing: each icon starts a few frames after the previous one.
  const staggerFrames = Math.max(2, Math.round(fps * 0.07));
  const durationInFrames = Math.round(fps * 0.5);

  const titleIn = interpolate(frame, [0, fps * 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const strip = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap,
        maxWidth: width * 0.84,
      }}
    >
      {resolved.map(({ key, Icon, rot, lift }, i) => {
        const start = i * staggerFrames;
        const appear = spring({
          frame: frame - start,
          fps,
          config: { damping: 14, stiffness: 120, mass: 0.7 },
          durationInFrames,
        });
        const opacity = interpolate(appear, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // Scale in from 0.6 -> 1; lift up a touch; unwind the seeded rotation to 0.
        const s = interpolate(appear, [0, 1], [0.6, 1]);
        const translateY = interpolate(appear, [0, 1], [tile * (0.18 + lift * 0.12), 0]);
        const rotate = interpolate(appear, [0, 1], [rot, 0]);

        return (
          <div
            key={key}
            style={{
              width: tile,
              height: tile,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: tile * 0.22,
              background: `${accent}14`, // accent at ~8% alpha
              border: `${Math.max(1, tile * 0.012)}px solid ${accent}40`,
              boxSizing: "border-box",
              opacity,
              transform: `translateY(${translateY}px) scale(${s}) rotate(${rotate}deg)`,
            }}
          >
            <Icon
              width={glyph}
              height={glyph}
              color={accent}
              strokeWidth={Math.max(1.5, glyph * 0.045)}
              absoluteStrokeWidth
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: scale * 0.08,
        gap: scale * 0.05,
        fontFamily: FONT,
      }}
    >
      {hasText && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: scale * 0.016,
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [scale * 0.03, 0])}px)`,
          }}
        >
          {title && (
            <div
              style={{
                fontSize: scale * 0.06,
                fontWeight: 800,
                color: textColor,
                lineHeight: 1.05,
              }}
            >
              {title}
              <div
                style={{
                  width: scale * 0.1,
                  height: Math.max(3, scale * 0.006),
                  background: accent,
                  margin: `${scale * 0.016}px auto 0`,
                  borderRadius: 999,
                }}
              />
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontSize: scale * 0.03,
                fontWeight: 400,
                color: textColor,
                opacity: 0.72,
                maxWidth: width * 0.6,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      {strip}
    </AbsoluteFill>
  );
};

export default IconStrip;
