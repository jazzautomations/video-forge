import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SPACING, TYPE } from "../primitives/tokens";
import { EASE_OUT } from "../primitives/easing";

/**
 * Animated number count-up with an optional label. Great for stats/results.
 * The value eases toward its target (rule 1) rather than ticking linearly.
 */
export const CountUp: React.FC<{
  to: number;
  durationInSeconds?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label?: string;
}> = ({
  to,
  durationInSeconds = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = interpolate(frame, [0, durationInSeconds * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const value = to * p;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: SPACING.sm,
        fontFamily: FONT.sans,
      }}
    >
      <div
        style={{
          fontSize: TYPE.display,
          fontWeight: 700,
          color: COLORS.fg,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}
        {formatted}
        {suffix}
      </div>
      {label ? (
        <div style={{ fontSize: TYPE.h2, color: COLORS.muted }}>{label}</div>
      ) : null}
    </AbsoluteFill>
  );
};
