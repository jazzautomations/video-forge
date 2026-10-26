# Remotion core — the default engine

Remotion renders real video (MP4/WebM/GIF/stills) from React. It is the default
engine of this skill because it runs anywhere Node runs, is pure code (any code
agent can drive it), and has a large ecosystem. Use it unless the decision guide
in `engine-routing.md` sends you elsewhere.

## Setup (scaffold a project)

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video && npm i
```

Add packages with the version-matched installer (never plain `npm i remotion@x`):

```bash
npx remotion add @remotion/media @remotion/transitions @remotion/shapes zod
```

## The mental model

- A **Composition** declares id, dimensions, `fps`, `durationInFrames`.
- Everything is a React component rendered **per frame**. The current frame is the
  single source of truth for all motion.
- Nothing animates "over time" by itself — you compute every visual value *from the
  frame number*. This determinism is what makes renders reproducible.

## The one rule that trips up every agent

**Drive ALL animation from `useCurrentFrame()` + `interpolate()`.**
CSS `transition`, CSS `animation`, and Tailwind animation classes **do not render** —
they're invisible in the output. If you catch yourself writing `transition: ...`,
stop and convert it to an interpolation.

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const opacity = interpolate(frame, [0, fps], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.16, 1, 0.3, 1), // expressive ease-out
});
```

### Craft rules for interpolate()

- **Always clamp** both ends (`extrapolateLeft/Right: "clamp"`) unless you *want*
  values to shoot past the range.
- Keep the `interpolate()` call **inline in the `style` prop** — it stays editable in
  Studio and reads clearly.
- Animate with the **shorthand transform props** `scale`, `translate`, `rotate` — not a
  `transform: \`scale(${x})\`` string. For `scale`, pass `output: 'perceptual-scale'`
  so growth looks linear to the eye.
- Use **spring** for anything that should feel physical:
  `import { spring } from "remotion"; const s = spring({ frame, fps, config: { damping: 200 } });`
- Multi-keyframe fades (in then out) take arrays for input, output, and easing:
  `interpolate(frame, [0, 10, 170, 180], [0, 1, 1, 0], {...})`.

## Timing & layering (per-layer, not CSS)

Most components accept these props (wrap anything that doesn't in `<Sequence>`):

- `from={2 * fps}` — when the layer enters the timeline.
- `durationInFrames={5 * fps}` — how long it stays. For media, pass the media's natural
  duration.
- `trimBefore` / `trimAfter` — shift a component's internal clock (e.g. skip the first
  2s of a video: `trimBefore={2 * fps}`).
- `<Sequence layout="none">` is headless (no wrapper div); `layout="absolute-fill"`
  behaves like `<AbsoluteFill>`.

Think in `fps` multiples (`2 * fps`), never raw frame counts — it stays readable and
survives fps changes.

## Assets & media

- Put files in `public/`, reference with `staticFile("logo.png")`. Remote URLs work
  directly.
- Video/audio: `<Video>` / `<Audio>` from `@remotion/media`.
- Images on the canvas: `<CanvasImage>`. Animated GIF/APNG/WebP/AVIF: `<AnimatedImage>`.
- Fonts: `@remotion/google-fonts` (preferred) or `local-fonts`. Never rely on a system
  font being present in the render.

## Preview (Studio) and render

```bash
npx remotion studio --no-open            # prints the local URL; open it yourself
# visit a specific composition at /<composition-id>
npx remotion render                      # export (only when the user asks)
npx remotion still <comp-id> --frame=30 --scale=0.25   # fast one-frame sanity check
```

In sandboxed agents, add `--no-open`; if the file watcher errors (`EMFILE`), retry with
`--webpack-poll 1000`.

## Looking up current APIs (don't trust memorized APIs)

Remotion ships often. For any API detail, fetch the **live docs** instead of guessing:

- Append `.md` to any docs URL for the markdown source (token-cheap):
  `https://www.remotion.dev/docs/interpolate.md`, `.../sequence.md`, `.../spring.md`.
- Full-text search via Algolia (see `remotion-docs` skill if bundled) returns doc URLs.

## Make it editable in Studio (optional but nice)

Wrapping elements in `<Interactive.Div name="Title">` (from `remotion`) lets a human
nudge values in Studio and have them written back to code. Give each a human-readable
`name`. Pair with a Zod schema (`calculate-metadata`/`parameters`) to expose props.
