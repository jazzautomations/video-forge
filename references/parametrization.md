# Parametrizing & generating videos in code

The "generation" this skill cares about is an agent (or a program) **generating videos in
code — deterministically, from structured input.** No AI video models: every pixel is
defined by code and data. These are the parameters, schemas, and practices for doing it well.

## Composition parameters (the knobs of every video)

`<Composition>` takes: `id`, `component`, `durationInFrames`, `fps`, `width`, `height`,
`defaultProps`, `schema`, `calculateMetadata`.

Common format presets (pick one per project, then freeze it):
- Landscape 1920×1080 @ 30 · Vertical 1080×1920 @ 30 (Reels/Shorts/TikTok) · Square 1080×1080.
- 30 fps for most; 60 for fast/sporty motion.

## Typed props with a Zod schema (data-driven + Studio-editable)

Give every reusable composition a schema. It validates inputs, generates Studio UI
controls, and lets an agent/program pass validated `inputProps` to produce many variants.

```tsx
import { z } from "zod";
import { zColor } from "@remotion/zod-types"; // color-picker type
import { Composition } from "remotion";

export const promoSchema = z.object({
  brand: z.string(),
  tagline: z.string(),
  statValue: z.number().min(0),
  accent: zColor(),
});

<Composition
  id="Promo"
  component={Promo}
  schema={promoSchema}
  defaultProps={{ brand: "Jazz", tagline: "automação", statValue: 1000, accent: "#B388FF" }}
  durationInFrames={315}
  fps={30}
  width={1920}
  height={1080}
/>;
```

## calculateMetadata — derive duration/dimensions/props from data

Compute metadata from the actual content instead of hardcoding it: duration from an
audio/clip length, frame count from the number of items, props fetched from an API. Runs
before render.

```tsx
import { getAudioDurationInSeconds } from "@remotion/media-utils";

export const calculateMetadata = async ({ props }) => {
  const seconds = await getAudioDurationInSeconds(props.voiceover);
  return { durationInFrames: Math.ceil(seconds * 30), props };
};
```

## Render parameters (CLI + programmatic)

```bash
npx remotion render <id> out.mp4 --props=./props.json --codec=h264 --crf=18 --scale=1
npx remotion still  <id> out.png --frame=30 --scale=0.25
```
Programmatic (SaaS / batch), from `@remotion/renderer`: `selectComposition()` to resolve
metadata, then `renderMedia({ composition, codec, inputProps, outputLocation })` or
`renderStill()`.

Key render params: `codec` (h264/h265/vp8/vp9/prores/gif), `crf`/quality,
`pixelFormat` (`yuva420p` for transparency), `imageFormat`, `scale`, `everyNthFrame`,
`muted`, `audioCodec`, `concurrency`, `frames` range.

## Generate many videos from a dataset (the real power)

One composition → thousands of videos. Loop the dataset; for each row, render with that
row's `inputProps` (validated by the Zod schema). Deterministic: same props → same video.
This is the GitHub-Unwrapped pattern (personalized video at scale).

```ts
for (const row of dataset) {
  const inputProps = promoSchema.parse(row);           // validate first
  await renderMedia({ composition, codec: "h264", inputProps, outputLocation: `out/${row.id}.mp4` });
}
```

## Best practices for generating good code-video

- **Validate inputs with the schema** — never trust free-form props (`schema.parse(input)`).
- **Derive duration from content** via `calculateMetadata` whenever data varies; don't hardcode.
- **Parametrize the tokens** (palette/accent/strings) so one template serves many brands.
- **Pin fps/dimensions** per project and derive all timing in `fps` units.
- **For batch**, resolve the composition once (`selectComposition`) and reuse the bundle.
- **Keep it deterministic** — no unseeded randomness, no `Date.now()`; pass variability in as props.

Useful packages: `@remotion/zod-types` (zColor), `@remotion/media-utils`
(`getAudioDurationInSeconds`, `getVideoMetadata`), `@remotion/renderer` (programmatic render).
Fetch exact signatures from the live docs — append `.md` to the `remotion.dev/docs/*` URL.
