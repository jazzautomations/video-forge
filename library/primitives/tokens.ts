// Design tokens — the single source of palette, type scale, and spacing.
// motion-principles rule 9: lock these once per video and reuse everywhere.
// Override the values per project; keep the SHAPE so every scene stays consistent.

export const COLORS = {
  bg: "#0C0912", // primary background (toned near-black, not pure #000)
  bgAlt: "#15101F", // secondary background tone
  fg: "#EDEAF5", // primary text
  muted: "#9A90B8", // secondary/body text (passes 4.5:1 on bg)
  accent: "#B388FF", // brand accent
  accent2: "#5CE6B0", // success / highlight accent (differs in hue AND lightness)
} as const;

export const FONT = {
  // Load real web fonts via @remotion/google-fonts; these are the stacks.
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

// Modular type scale in px. Use ONLY these sizes; emphasize with weight/italic/color,
// never a new size (rule 9). All are >= 24px so nothing is unreadable on screen.
export const TYPE = {
  display: 120,
  h1: 72,
  h2: 44,
  body: 32,
  caption: 24,
} as const;

export const SPACING = { xs: 8, sm: 16, md: 32, lg: 64, xl: 128 } as const;

export const RADIUS = { sm: 8, md: 16, lg: 24, pill: 999 } as const;
