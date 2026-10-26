import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, RADIUS, SPACING, TYPE } from "../primitives/tokens";
import { EASE_OUT, rise, SPRING_SNAPPY } from "../primitives/easing";

/**
 * Name + role strip, bottom-left. Springs in from the left, then slides out in the
 * last 0.5s of its layer (rule 4: exits are choreographed too).
 * Put it inside a <Sequence> sized to how long the card should show.
 */
export const LowerThird: React.FC<{
  name: string;
  role?: string;
  accent?: string;
}> = ({ name, role, accent = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const appear = rise(frame, fps, 0, SPRING_SNAPPY);
  const out = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT },
  );
  const vis = Math.min(appear, out);
  const x = (1 - appear) * -80;

  return (
    <AbsoluteFill style={{ fontFamily: FONT.sans }}>
      <div
        style={{
          position: "absolute",
          left: SPACING.xl,
          bottom: SPACING.xl,
          opacity: vis,
          translate: `${x}px 0px`,
          display: "flex",
          flexDirection: "column",
          gap: SPACING.xs,
          paddingLeft: SPACING.md,
          borderLeft: `6px solid ${accent}`,
        }}
      >
        <div style={{ fontSize: TYPE.h2, fontWeight: 700, color: COLORS.fg }}>
          {name}
        </div>
        {role ? (
          <div style={{ fontSize: TYPE.caption, color: COLORS.muted }}>
            {role}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
