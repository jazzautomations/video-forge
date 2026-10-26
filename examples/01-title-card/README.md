# Example 01 — Title card (verified render)

This is the smoke test that proves the library renders in a real Remotion project. The
`preview.png` here was rendered by these exact steps — it doubles as the integration test.

```bash
# 1. scaffold a blank Remotion project
npx create-video@latest --yes --blank --no-tailwind my-video && cd my-video && npm i

# 2. drop the library in
cp -r /path/to/video-forge/library ./src/vflib

# 3. register a composition that uses it
cat > src/Root.tsx <<'TSX'
import React from "react";
import { Composition, AbsoluteFill } from "remotion";
import { GradientBackground } from "./vflib/scenes/GradientBackground";
import { TitleCard } from "./vflib/scenes/TitleCard";

const Demo: React.FC = () => (
  <AbsoluteFill>
    <GradientBackground />
    <TitleCard eyebrow="video-forge" title="Funciona" subtitle="render de verdade, sem fuleiragem" />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="Demo" component={Demo} durationInFrames={120} fps={30} width={1920} height={1080} />
);
TSX

# 4. render a frame to verify
npx remotion still Demo preview.png --frame=70
```

Result: a 1920×1080 PNG with the eyebrow, title (spring rise), and subtitle (staggered
fade) over the drifting gradient — all driven by `useCurrentFrame()`. See `preview.png`.
