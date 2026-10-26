import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../primitives/tokens";

/**
 * A calm, deterministically drifting gradient backdrop.
 * List it FIRST in a scene so content paints on top.
 * Drift comes from sin(frame) — pure function of the frame, so it renders cleanly.
 */
export const GradientBackground: React.FC<{
  from?: string;
  to?: string;
}> = ({ from = COLORS.bg, to = COLORS.bgAlt }) => {
  const frame = useCurrentFrame();
  const angle = 120 + Math.sin(frame / 90) * 18;
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` }}
    />
  );
};
