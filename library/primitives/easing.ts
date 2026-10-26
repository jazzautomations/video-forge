import {
  Easing,
  interpolate,
  spring,
  type SpringConfig,
} from "remotion";

// Reusable easing + spring presets. motion-principles rules 1-2:
// ease everything; linear is the tell; spring for enters.

/** Expressive ease-out — the reliable default for reveals. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** Symmetric ease for moves that start and end on screen. */
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export const SPRING_SOFT: Partial<SpringConfig> = { damping: 200 };
export const SPRING_SNAPPY: Partial<SpringConfig> = { damping: 20, mass: 0.6 };
export const SPRING_BOUNCY: Partial<SpringConfig> = { damping: 12, mass: 0.8 };

/**
 * Fade in, hold, fade out across a layer's LOCAL frames.
 * Pass only `inS` for a plain fade-in; pass `outStartS`+`totalS` for the full arc.
 */
export const fadeInOut = (
  frame: number,
  fps: number,
  inS = 0.4,
  outStartS?: number,
  outS = 0.4,
): number => {
  const inEnd = inS * fps;
  if (outStartS == null) {
    return interpolate(frame, [0, inEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_OUT,
    });
  }
  const outStart = outStartS * fps;
  const outEnd = (outStartS + outS) * fps;
  return interpolate(frame, [0, inEnd, outStart, outEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
};

/** Spring value (≈0→1) starting at `delayFrames`. Use for entrances. */
export const rise = (
  frame: number,
  fps: number,
  delayFrames = 0,
  config: Partial<SpringConfig> = SPRING_SOFT,
): number => spring({ frame: frame - delayFrames, fps, config });
