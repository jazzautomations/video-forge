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
 * Word-by-word kinetic reveal: each word rises + fades in, staggered (rule 6 —
 * animate words as objects, not a flat opacity fade on the whole block).
 */
export const KineticText: React.FC<{
  text: string;
  size?: number;
  color?: string;
  staggerFrames?: number;
}> = ({ text, size = TYPE.h1, color = COLORS.fg, staggerFrames = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.xl,
        fontFamily: FONT.sans,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `${SPACING.xs}px ${SPACING.md * 0.6}px`,
          maxWidth: 1500,
        }}
      >
        {words.map((word, i) => {
          const delay = i * staggerFrames;
          const o = interpolate(frame, [delay, delay + 0.35 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });
          return (
            <span
              key={`${word}-${i}`}
              style={{
                fontSize: size,
                fontWeight: 700,
                lineHeight: 1.1,
                color,
                opacity: o,
                translate: `0px ${(1 - o) * 24}px`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
