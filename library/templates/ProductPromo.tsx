import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { GradientBackground } from "../scenes/GradientBackground";
import { TitleCard } from "../scenes/TitleCard";
import { KineticText } from "../scenes/KineticText";
import { CountUp } from "../scenes/CountUp";
import { COLORS } from "../primitives/tokens";

/**
 * A ready-to-fill 4-beat promo: intro → punchline → stat → CTA.
 * The agent should copy this, tweak the props/text, and adjust durations — NOT rebuild
 * a promo from scratch. Transitions carry motion between scenes (rule 7).
 *
 * Composition duration = sum of Sequence frames minus the overlap of each Transition.
 * With the values below (4×90 − 15 − 15 − 15) set durationInFrames = 315 at 30fps.
 */
export type ProductPromoProps = {
  brand: string;
  tagline: string;
  punchline: string;
  statValue: number;
  statLabel: string;
  cta: string;
};

export const ProductPromo: React.FC<ProductPromoProps> = ({
  brand,
  tagline,
  punchline,
  statValue,
  statLabel,
  cta,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Persistent backdrop behind every scene */}
      <GradientBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <TitleCard eyebrow="apresenta" title={brand} subtitle={tagline} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: 15, config: { damping: 200 } })}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <KineticText text={punchline} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <CountUp to={statValue} label={statLabel} suffix="+" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ durationInFrames: 15, config: { damping: 200 } })}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <TitleCard title={cta} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
