// SPDX-License-Identifier: MIT
// Video Forge character scene. The figure is a DiceBear "Open Peeps" avatar: Pablo Stanley's
// hand-drawn Open Peeps art (CC0 1.0) rendered deterministically by @dicebear/core (MIT) from a
// `seed`. Same seed -> same person (seekable); a different seed -> a different person, so videos
// stop sharing one stock mascot. No network, no AI model — createAvatar() is pure code.
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";

export const FPS = 30;
export const DURATION_FRAMES = 90;

export type CharacterPresenterProps = {
  backgroundColor: string;
  bodyColor: string;
  accentColor: string;
  textColor: string;
  title: string;
  subtitle: string;
  /** Deterministic character selection — vary per video to avoid the same face everywhere. */
  seed: string;
  /** Back-compat with the old hand-drawn presenter; ignored (DiceBear owns the art). */
  skinColor?: string;
};

export const defaultCharacterProps: CharacterPresenterProps = {
  backgroundColor: "#15121c",
  bodyColor: "#B388FF",
  accentColor: "#B388FF",
  textColor: "#EDEAF5",
  title: "",
  subtitle: "",
  seed: "video-forge",
};

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const CharacterPresenter: React.FC<CharacterPresenterProps> = ({
  backgroundColor,
  accentColor,
  textColor,
  title,
  subtitle,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = Math.min(width, height);

  // Deterministic, offline SVG for this seed (transparent background; the disc below shows through).
  const avatarUri = useMemo(
    () => createAvatar(openPeeps, { seed, size: 512 }).toDataUri(),
    [seed]
  );

  const charIn = spring({ frame, fps, config: { damping: 13, stiffness: 110, mass: 0.7 }, durationInFrames: 22 });
  const bob = Math.sin((frame / fps) * 1.6) * scale * 0.006;

  const disc = scale * 0.46;
  const avX = width * 0.30;
  const avY = height * 0.5;
  const border = Math.max(3, scale * 0.006);

  const textIn = spring({ frame: frame - Math.round(fps * 0.18), fps, config: { damping: 15, stiffness: 90 }, durationInFrames: 22 });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Avatar inside an accent-ringed disc */}
      <div
        style={{
          position: "absolute",
          left: avX,
          top: avY + bob,
          width: disc,
          height: disc,
          transform: `translate(-50%, -50%) scale(${interpolate(charIn, [0, 1], [0.62, 1])}) translateY(${interpolate(charIn, [0, 1], [height * 0.12, 0])}px)`,
          opacity: charIn,
          borderRadius: "50%",
          background: backgroundColor,
          border: `${border}px solid ${accentColor}`,
          boxShadow: `0 ${scale * 0.02}px ${scale * 0.055}px rgba(0,0,0,0.38)`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img src={avatarUri} width={disc * 0.94} height={disc * 0.94} alt="" style={{ display: "block" }} />
      </div>

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          left: width * 0.52,
          top: "50%",
          transform: `translateY(-50%) translateX(${interpolate(textIn, [0, 1], [50, 0])}px)`,
          opacity: textIn,
          display: "flex",
          flexDirection: "column",
          gap: scale * 0.016,
          maxWidth: width * 0.42,
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: scale * 0.082, fontWeight: 800, color: textColor, lineHeight: 1.04 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontFamily: FONT, fontSize: scale * 0.032, fontWeight: 400, color: textColor, opacity: 0.72 }}>
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default CharacterPresenter;

// Compatibility for existing Video Forge demo projects.
export const WaveHello = CharacterPresenter;
export const defaultWaveHelloProps = defaultCharacterProps;
