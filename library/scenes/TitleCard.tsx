import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SPACING, TYPE } from "../primitives/tokens";
import { EASE_OUT, rise } from "../primitives/easing";

/**
 * Centered title card with optional eyebrow + subtitle.
 * Entrances are staggered (rule 3): eyebrow → title (spring rise) → subtitle.
 */
export const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
}> = ({ title, subtitle, eyebrow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowO = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const titleRise = rise(frame, fps, 0.15 * fps);
  const subO = interpolate(frame, [0.5 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: SPACING.xl,
        fontFamily: FONT.sans,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: TYPE.caption,
            color: COLORS.accent2,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: SPACING.md,
            opacity: eyebrowO,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <h1
        style={{
          fontSize: TYPE.display,
          fontWeight: 700,
          lineHeight: 1.05,
          color: COLORS.fg,
          margin: 0,
          opacity: titleRise,
          translate: `0px ${(1 - titleRise) * 40}px`,
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          style={{
            fontSize: TYPE.h2,
            color: COLORS.muted,
            maxWidth: 1400,
            marginTop: SPACING.lg,
            opacity: subO,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </AbsoluteFill>
  );
};
