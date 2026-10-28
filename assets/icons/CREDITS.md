# Icons — one family per video

Icons are **not bundled** as files. They are pulled from npm as tree-shakeable React
components and imported by name, so each generated project ships only the handful of
glyphs it actually renders. Keeping them out of the repo keeps the skill light and
license-clean (same policy as `assets/README.md`).

## The rule: ONE family per video

Mixing icon families inside a single video is a classic AI-slop tell — stroke widths,
corner radii and optical grids stop agreeing and the frame reads as "assembled from
whatever was lying around." Pick **one** family at the top of a project and use it for
every glyph. Switch families *between* videos for variety (see
`references/anti-sameness.md`), never *within* one.

## Chosen family

**Primary: `lucide-react` — ISC** (permissive, MIT-equivalent; the cleanest license of
the candidates). One coherent 24×24, 2px-stroke grid of ~1500 glyphs covering
tech/business/comms/media/UI, named PascalCase exports that tree-shake cleanly, and an
animatable `strokeWidth` — ideal for Remotion/React.

```
npm install lucide-react
import { Rocket, ArrowRight } from 'lucide-react';
```

**Backup: `@phosphor-icons/react` — MIT.** Also a single coherent family, but with
`weight` variants (`thin | light | regular | bold | fill | duotone`) that give a
distinctly different visual register — reach for it when a video wants a heavier or
duotone look than Lucide's uniform stroke. Never load both in the same video.

## Candidate licenses (verified against npm, 2026-10-27)

| npm package | Latest version | License | Role |
|---|---|---|---|
| `lucide-react` | 1.62.0 | **ISC** | **Primary** |
| `@phosphor-icons/react` | 2.1.10 | **MIT** | Backup |
| `@tabler/icons-react` | 3.50.0 | MIT | Alternate (huge set, heavier stroke) |
| `@heroicons/react` | 2.2.0 | MIT | Alternate (smaller ~300 set, outline/solid/mini split) |

All four are MIT/ISC and safe to redistribute in generated project code; attribution is
not required but is recorded here for provenance. The icon code is installed via npm
per project and is not vendored into this repository.

## Curated starter set (Lucide export names, ~30)

A dependable spine of commonly-useful glyphs. Import by name from `lucide-react`.

**Tech / dev** — `Code`, `Terminal`, `GitBranch`, `Database`, `Cpu`, `Cloud`

**Business** — `TrendingUp`, `BarChart3`, `Target`, `Briefcase`, `DollarSign`, `Rocket`

**Communication** — `Mail`, `MessageCircle`, `Bell`, `Phone`, `Send`, `Share2`

**Media** — `Play`, `Pause`, `Image`, `Video`, `Mic`, `Music`

**Arrows / UI** — `ArrowRight`, `ArrowUpRight`, `ChevronRight`, `Check`, `Search`, `Sparkles`

Notes: `Image` shadows the DOM `Image` global and `X` (if added) collides with JSX —
alias on import when needed (`import { Image as ImageIcon } from 'lucide-react'`). Need a
glyph outside this set: use any Lucide name rather than reaching for a second family.
