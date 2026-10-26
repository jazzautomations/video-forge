// SPDX-FileCopyrightText: 2026 Trimora Inc.
// SPDX-License-Identifier: MIT
// Adapted for Video Forge: a raised open-hand greeting, away from the torso.
// Phase 1: character enters (0-18f) / Phase 2: waving (10-80f) / Phase 3: text appears (30-55f)
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FPS = 30;
export const DURATION_FRAMES = 90;

export type CharacterPresenterProps = {
  backgroundColor: string;
  skinColor: string;
  bodyColor: string;
  accentColor: string;
  textColor: string;
  title: string;
  subtitle: string;
};

export const defaultCharacterProps: CharacterPresenterProps = {
  backgroundColor: "#e0f2fe",
  skinColor: "#fbbf24",
  bodyColor: "#3b82f6",
  accentColor: "#1d4ed8",
  textColor: "#1e3a5f",
  title: "Hello!",
  subtitle: "Welcome aboard",
};

const FONT = '-apple-system, "Segoe UI", Roboto, sans-serif';

export const CharacterPresenter: React.FC<CharacterPresenterProps> = ({
  backgroundColor,
  skinColor,
  bodyColor,
  accentColor,
  textColor,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.min(width, height);
  const cx = width * 0.38;

  // Character slide up from below
  const charIn = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
    durationInFrames: 20,
  });

  const charOffsetY = interpolate(charIn, [0, 1], [height * 0.18, 0]);

  // Gentle idle bounce after entry
  const bounce = 0;

  const cy = height * 0.5 + charOffsetY + bounce;

  // Two small wrist waves beside the head, followed by a relaxed hold.
  // The hand stays above the shoulder through the entire gesture.
  const gestureT = Math.max(0, frame / fps - 0.55);
  const wristWave = gestureT < 1.5 ? Math.sin(gestureT / 1.5 * Math.PI * 4) * 10 : 0;

  // Text slide in
  const textIn = spring({
    frame: frame - Math.round(fps * .2),
    fps,
    config: { damping: 14, stiffness: 90 },
    durationInFrames: 20,
  });

  // Body dimensions
  const headR = scale * 0.09;
  const bodyW = scale * 0.13;
  const bodyH = scale * 0.17;
  const armW = scale * 0.042;
  const armH = scale * 0.11;
  const legW = scale * 0.042;
  const legH = scale * 0.11;

  // Right arm shoulder pivot
  const shoulderX = cx + bodyW * 0.48;
  const shoulderY = cy - bodyH * 0.32;

  // Head center
  const headCY = cy - bodyH * 0.5 - headR * 0.65;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Ground shadow */}
        <ellipse
          cx={cx}
          cy={cy + bodyH * 0.5 + legH + scale * 0.008}
          rx={bodyW * 0.75}
          ry={scale * 0.016}
          fill="rgba(0,0,0,0.08)"
        />

        {/* Legs */}
        <rect
          x={cx - bodyW * 0.28 - legW / 2}
          y={cy + bodyH * 0.44}
          width={legW}
          height={legH}
          rx={legW / 2}
          fill={accentColor}
        />
        <rect
          x={cx + bodyW * 0.28 - legW / 2}
          y={cy + bodyH * 0.44}
          width={legW}
          height={legH}
          rx={legW / 2}
          fill={accentColor}
        />

        {/* Body */}
        <rect
          x={cx - bodyW / 2}
          y={cy - bodyH * 0.5}
          width={bodyW}
          height={bodyH}
          rx={bodyW * 0.22}
          fill={bodyColor}
        />

        {/* Left arm (resting down) */}
        <rect
          x={cx - bodyW * 0.5 - armW}
          y={cy - bodyH * 0.28}
          width={armW}
          height={armH}
          rx={armW / 2}
          fill={skinColor}
        />

        {/* Raised upper arm and forearm; open palm beside the head. */}
        <path d={`M ${shoulderX} ${shoulderY} Q ${shoulderX + scale*.11} ${shoulderY + scale*.015} ${shoulderX + scale*.115} ${shoulderY - scale*.15}`}
          fill="none" stroke={skinColor} strokeWidth={armW} strokeLinecap="round"/>
        <g transform={`rotate(${wristWave} ${shoulderX + scale*.115} ${shoulderY - scale*.15})`}>
          <ellipse cx={shoulderX + scale*.115} cy={shoulderY - scale*.18} rx={scale*.027} ry={scale*.037} fill={skinColor}/>
          {[-.017,0,.017].map((dx,i)=><path key={i} d={`M ${shoulderX + scale*(.115+dx)} ${shoulderY - scale*.19} v ${-scale*(.045-Math.abs(dx)*.4)}`} stroke={skinColor} strokeWidth={scale*.012} strokeLinecap="round"/>)}
          <path d={`M ${shoulderX+scale*.095} ${shoulderY-scale*.175} l ${-scale*.024} ${-scale*.018}`} stroke={skinColor} strokeWidth={scale*.014} strokeLinecap="round"/>
        </g>

        {/* Head */}
        <circle cx={cx} cy={headCY} r={headR} fill={skinColor} />

        {/* Eyes */}
        <circle
          cx={cx - headR * 0.3}
          cy={headCY - headR * 0.12}
          r={headR * 0.1}
          fill="#1e1e2e"
        />
        <circle
          cx={cx + headR * 0.3}
          cy={headCY - headR * 0.12}
          r={headR * 0.1}
          fill="#1e1e2e"
        />

        {/* Smile */}
        <path
          d={`M ${cx - headR * 0.28} ${headCY + headR * 0.18} Q ${cx} ${headCY + headR * 0.45} ${cx + headR * 0.28} ${headCY + headR * 0.18}`}
          stroke="#1e1e2e"
          strokeWidth={scale * 0.007}
          strokeLinecap="round"
          fill="none"
        />

        {/* Hair tuft */}
        <path
          d={`M ${cx - headR * 0.15} ${headCY - headR * 0.88} Q ${cx} ${headCY - headR * 1.18} ${cx + headR * 0.15} ${headCY - headR * 0.88}`}
          stroke={accentColor}
          strokeWidth={scale * 0.01}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />
      </svg>

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          left: width * 0.54,
          top: "50%",
          transform: `translateY(-50%) translateX(${interpolate(
            textIn,
            [0, 1],
            [50, 0]
          )}px)`,
          opacity: textIn,
          display: "flex",
          flexDirection: "column",
          gap: scale * 0.014,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: scale * 0.1,
            fontWeight: 800,
            color: accentColor,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: FONT,
              fontSize: scale * 0.038,
              fontWeight: 400,
              color: textColor,
              opacity: 0.72,
            }}
          >
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
