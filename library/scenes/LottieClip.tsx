// SPDX-License-Identifier: MIT
//
// Video Forge "LottieClip" scene — plays a vendored Lottie (Bodymovin) JSON animation
// frame-accurately inside a Remotion composition.
//
// WHY THIS IS SEEKABLE: @remotion/lottie's <Lottie> reads Remotion's useCurrentFrame()
// internally and seeks the animation to that exact frame every render. There is NO wall
// clock here — no setInterval / requestAnimationFrame / Date / r3f useFrame. Given the
// same frame you always get the same picture, so scrubbing and distributed rendering are
// deterministic. We only translate the composition fps -> the clip's own frame via
// `playbackRate`; we never advance it ourselves.
//
// ASSET LICENSE NOTE: this component's CODE is MIT, but the Lottie JSON you point `file`
// at carries its OWN license (LottieFiles "Free"/"Pro", CC, author terms, etc.). Vendor
// the .json into the project's public/ folder, keep its upstream license/attribution
// beside it (e.g. public/lottie/<name>.LICENSE), and record provenance in UPSTREAM.json.
// Our MIT license does not relicense the animation data.
//
// deps: @remotion/lottie, lottie-web  (lottie-web is a peer of @remotion/lottie)
// Verified against Remotion 4.0.538.

import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";

export type LottieClipProps = {
  /** Public-relative path to the vendored Lottie JSON, e.g. 'lottie/success.json'.
   *  Resolved with staticFile(); do NOT pass an http URL (breaks offline/deterministic render). */
  file: string;
  /** Loop the animation. When false (default) it plays once and holds its last frame. */
  loop?: boolean;
  /** Clip-speed multiplier. 1 = the clip's authored speed. <1 slower, >1 faster. Deterministic. */
  playbackRate?: number;
  /** Deterministic seed for any incidental variation (kept for theme-prop parity; no RNG by default). */
  seed?: string;
  /** Theme: page background behind the animation. */
  background?: string;
  /** Theme: accent used for the optional title underline / eyebrow tick. */
  accent?: string;
  /** Theme: text color for the optional title/subtitle. */
  textColor?: string;
  /** Optional heading shown beside the animation (split layout). Empty => animation is centered full-bleed. */
  title?: string;
  /** Optional supporting line under the title. */
  subtitle?: string;
};

export const defaultLottieProps: LottieClipProps = {
  file: "lottie/success.json",
  loop: false,
  playbackRate: 1,
  seed: "video-forge",
  background: "#101710",
  accent: "#D7FF64",
  textColor: "#F3F1E9",
  title: "",
  subtitle: "",
};

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// mulberry32 PRNG seeded from a string — deterministic, no Math.random at render time.
// Not used for motion (the Lottie owns that); kept so a future seeded variation stays reproducible.
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

export const LottieClip: React.FC<LottieClipProps> = ({
  file,
  loop = false,
  playbackRate = 1,
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

  // Keep the RNG stable per seed so any future seeded jitter is deterministic and memoized.
  useMemo(() => makeRng("lottie:" + seed), [seed]);

  // Load the vendored JSON once. delayRender() holds every frame's snapshot until the data is
  // in memory, so no frame is ever captured with an unloaded animation; cancelRender surfaces a
  // broken/missing asset as a render failure instead of a silent blank. animationData is held in
  // state (a stable reference) and keyed on `file` so <Lottie> never re-inits mid-clip.
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender(`lottie:${file}`));

  useEffect(() => {
    let cancelled = false;
    const h = delayRender(`lottie-fetch:${file}`);
    fetch(staticFile(file))
      .then((res) => {
        if (!res.ok) throw new Error(`Lottie fetch ${res.status} for ${file}`);
        return res.json();
      })
      .then((json: LottieAnimationData) => {
        if (cancelled) return;
        setAnimationData(json);
        continueRender(h);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
    return () => {
      cancelled = true;
      // Release the per-effect handle if `file` changes before the fetch resolves.
      continueRender(h);
    };
  }, [file, handle]);

  if (!animationData) {
    // Holds under delayRender(); render the themed background so a one-frame flash matches the scene.
    return <AbsoluteFill style={{ backgroundColor: background }} />;
  }

  const hasText = Boolean(title || subtitle);

  // Entrance for the animation box (frame-driven spring — still fully seekable).
  const appear = spring({ frame, fps, config: { damping: 16, stiffness: 95 }, durationInFrames: 20 });
  const boxOpacity = appear;
  const boxShift = interpolate(appear, [0, 1], [scale * 0.04, 0]);

  const lottie = (
    <Lottie
      animationData={animationData}
      loop={loop}
      playbackRate={playbackRate}
      // No `style` width/height: the parent box sizes it. <Lottie> seeks by useCurrentFrame itself.
    />
  );

  if (!hasText) {
    // Full-bleed, centered.
    const S = scale * 0.7;
    return (
      <AbsoluteFill
        style={{
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: S, height: S, opacity: boxOpacity, transform: `translateY(${boxShift}px)` }}>
          {lottie}
        </div>
      </AbsoluteFill>
    );
  }

  // Split layout: animation on the left, title/subtitle on the right.
  const textIn = spring({ frame: frame - Math.round(fps * 0.16), fps, config: { damping: 15, stiffness: 90 }, durationInFrames: 22 });
  const animBox = scale * 0.46;

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <div
        style={{
          position: "absolute",
          left: width * 0.3,
          top: "50%",
          width: animBox,
          height: animBox,
          transform: `translate(-50%, -50%) translateY(${boxShift}px)`,
          opacity: boxOpacity,
        }}
      >
        {lottie}
      </div>

      <div
        style={{
          position: "absolute",
          left: width * 0.54,
          top: "50%",
          transform: `translateY(-50%) translateX(${interpolate(textIn, [0, 1], [50, 0])}px)`,
          opacity: textIn,
          display: "flex",
          flexDirection: "column",
          gap: scale * 0.016,
          maxWidth: width * 0.4,
        }}
      >
        {title && (
          <div style={{ fontFamily: FONT, fontSize: scale * 0.078, fontWeight: 800, color: textColor, lineHeight: 1.05 }}>
            {title}
            <div style={{ width: scale * 0.12, height: Math.max(3, scale * 0.006), background: accent, marginTop: scale * 0.018, borderRadius: 999 }} />
          </div>
        )}
        {subtitle && (
          <div style={{ fontFamily: FONT, fontSize: scale * 0.032, fontWeight: 400, color: textColor, opacity: 0.72 }}>
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default LottieClip;
