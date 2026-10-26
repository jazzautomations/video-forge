// Load the token fonts once. Import this module in your Root/Composition file so the
// families referenced in tokens.ts ('Inter', 'JetBrains Mono') are actually available
// in the render (never rely on a system font being installed).
//
// Requires: npx remotion add @remotion/google-fonts  (ships with create-video)
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: INTER } = loadInter("normal", {
  weights: ["400", "600", "700"],
});
export const { fontFamily: JETBRAINS_MONO } = loadMono("normal", {
  weights: ["400", "500", "700"],
});
