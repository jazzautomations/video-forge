# Compose tools per scene

Preserve existing projects. For new HTML/CSS motion start with HyperFrames; use
Remotion for React, typed props and its reusable scenes. Use FFmpeg directly for
edits that do not need new graphics. No tool must appear just to check a box.

| Job | Tool | Export / reuse |
|---|---|---|
| HTML kinetic type, UI, diagrams | HyperFrames + GSAP | Registry blocks and components; local HTML; MP4/alpha formats |
| React launch scenes, charts, schema-based batches | Remotion | Bundled RenderComp, Curvable, Onda; explicit composition render |
| Trim, grade, concat, captions, mix, censor | FFmpeg | Bundled helpers with JSON results and dry-run |
| True 3D geometry, cameras, materials | Three.js/R3F or Blender Python | Frame-driven render or image sequence; see three-and-blender.md |
| Equations / algorithm diagrams | Manim or Motion Canvas | Use their own render/export pipeline; normalize into final video |
| Real screen demonstration | Playwright capture / desktop recorder | Keep capture and telemetry; camera/caption layers added afterward |

Mixed example: HTML title → recorded product interaction → React chart → Blender
product turntable → HTML CTA. FFmpeg normalizes clips and mixes narration, music and
SFX. Keep a scene manifest with exact durations and frame boundaries. This is an
example, not a mandatory five-part format.

GSAP is valid in HyperFrames because the renderer seeks its paused registered
timeline. A normal browser autoplay loop is not the same contract. 2.5D CSS planes
are useful, but do not claim they are a modeled/rigged 3D scene.

Read installed CLI help. The checked-in source snapshot is the reference for bundled
components; today's upstream documentation may describe a later API. Pin versions in
project package locks. Source license, runtime license and asset license are separate.

## Optional design-asset and 3D-driver routes (researched; license-gated)

These are OPTIONAL helpers, not core engines. The 100%-local, no-paid, no-generative pipeline above
(HyperFrames / Remotion / FFmpeg / Blender-Python) is complete without them. Each is gated on the
hard constraints; where a tool mixes allowed and forbidden capabilities, only the allowed subset is
in scope. Source license, runtime license and asset license stay separate.

| Tool | License | Verdict | Fits constraints? |
|---|---|---|---|
| React Bits | MIT **+ Commons Clause** | Route-reference, NEVER vendor | Yes (free, local, deterministic code) |
| ahujasid/blender-mcp | MIT | Optional, RESTRICTED driver | Only with generative/cloud tools disabled |
| Penpot MCP (official) | MPL-2.0 | Optional design-asset source | Only when self-hosted |
| Graphify | MIT / Apache-2.0 | DROP from engine routing | N/A — not a design tool |
| Figma Dev Mode MCP | Proprietary (paid seat) | Optional-cloud; default SKIP | No (cloud; paid) |
| Framelink figma-context-mcp | MIT | Optional-cloud read route | No (cloud; needs Figma account) |

**React Bits (reactbits.dev, DavidHDev/react-bits).** Animated React components/backgrounds.
Installed "source you own" per-project via `shadcn` or `jsrepo`. License is **MIT + Commons Clause**:
you may use/modify the components inside a product and use the exported video commercially, but you
**may not redistribute the components themselves**. VERDICT: install only into THE USER'S project,
never copy the component source into this MIT skill repo (Commons Clause would taint it and is a
license violation to mix in). Keep it out of `THIRD_PARTY_NOTICES` since nothing is vendored.
INTEGRATION CAVEAT: components are `requestAnimationFrame`/timer-driven (GSAP/Framer-Motion/OGL), a
browser autoplay loop — **not** Remotion's `useCurrentFrame()` seek contract. To use in Remotion,
port the animation to `useCurrentFrame()+interpolate`, or capture it through the HyperFrames
paused-timeline path. Best used as design/structure reference, re-driven through the frame-seek engines.

**ahujasid/blender-mcp.** MIT driver for Blender. It adds no capability over the Blender-Python route
in `three-and-blender.md` (its `execute_blender_code` just pipes Python you can already run), but is a
convenient driver. ALLOW ONLY: `execute_blender_code`, `look`, `get_scene_info`, `get_addon_status`,
and `search_assets`/`import_asset` **restricted to Poly Haven (CC0)**. EXPLICITLY FORBID as
hard-constraint violations: `generate_3d` entirely (generative + cloud + partly paid: Tripo / Hyper3D
Rodin / Meshy / Hunyuan3D), Sketchfab (account/key + mixed licensing), and Poly Pizza if license isn't
checked per-asset. SECURITY: the addon opens an unauthenticated TCP socket (default `localhost:9876`)
that runs arbitrary Python — bind to localhost only, treat as code-exec, set `DISABLE_TELEMETRY=true`.
For a deterministic 3D hero shot, prefer the frame-driven Python render path already documented.

**Penpot MCP (official, help.penpot.app/mcp; or community ancrz/penpot-mcp-server, Apache-2.0).** A
design tool (SVG/PNG/mockups), not a renderer; 5 tools incl. `export_shape`. VERDICT: optional
design-asset source only, scoped to **self-hosted Penpot (Docker)** so it stays local/no-cloud/no-paid
(MPL-2.0). Use `export_shape` to emit layouts that then feed Remotion (still) / HyperFrames
(background) / FFmpeg (overlay). It adds a step, not an engine — include only when a weak model
genuinely benefits from laying out composition in a design tool first; otherwise skip.

**Graphify — DROP.** Not a brand/design tool. The real Graphify (graphify.com) is an MIT/Apache-2.0
code-knowledge-graph CLI for AI coding agents — unrelated to video design. Do NOT add it as a design
engine (doing so would be exactly the misinformation to avoid). At most, `agent-workflow.md` could
note it can index THIS repo to help a weak model navigate the 129-scene catalog — a dev-ergonomics
aside, not an engine. Any "website/PDF → design tokens" tool the task implied is a separate, unnamed
helper to vet on its own, not Graphify.

**Figma (Dev Mode MCP official; Framelink figma-context-mcp community).** Figma is inherently cloud;
the official Dev Mode server also requires a paid **Full/Dev seat**. VERDICT: optional-cloud,
**default = skip** — route here only when the user already owns a paid Figma seat and explicitly opts
into cloud. If a read-only Figma→asset path is ever wanted, prefer Framelink `figma-context-mcp` (MIT,
free personal token) and still flag it as cloud. Never part of the default 100%-local pipeline; it
produces design context/exports that feed Remotion/HyperFrames, not video itself.
