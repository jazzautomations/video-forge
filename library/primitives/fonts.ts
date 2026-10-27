// Load the token fonts from the project's LOCAL vendored .woff2 — no network, matches what
// build_project.py emits. This replaces the old @remotion/google-fonts path so hand-built
// projects stay 100% local/offline/reproducible too.
//
// Setup: copy the faces you use from assets/fonts into your project's public/fonts, then
// import this module ONCE in your Root/Composition file. The exported family names (INTER,
// JETBRAINS_MONO) match tokens.ts. If the files are missing, the render falls back to the
// system stack instead of failing.
import { staticFile, delayRender, continueRender } from "remotion";

const faces = [
  { family: "Inter", weight: 400, file: "inter-400.woff2" },
  { family: "Inter", weight: 600, file: "inter-600.woff2" },
  { family: "Inter", weight: 700, file: "inter-700.woff2" },
  { family: "JetBrains Mono", weight: 400, file: "jetbrains-mono-400.woff2" },
  { family: "JetBrains Mono", weight: 700, file: "jetbrains-mono-700.woff2" },
];

for (const { family, weight, file } of faces) {
  const handle = delayRender(`font:${file}`);
  const ff = new FontFace(family, `url(${staticFile("fonts/" + file)}) format('woff2')`, {
    weight: String(weight),
    style: "normal",
    display: "block",
  });
  ff.load()
    .then((loaded) => {
      (document as any).fonts.add(loaded);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
}

export const INTER = "'Inter', system-ui, -apple-system, sans-serif";
export const JETBRAINS_MONO = "'JetBrains Mono', ui-monospace, monospace";
