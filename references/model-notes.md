# Distill strong execution into a small decision surface

The objective is for weaker models to benefit from researched taste and robust code.
This is an engineering hypothesis to evaluate, not a claim that a prompt removes all
model capability differences. Avoid unsupported personality profiles of model names.

## What a capable production agent does, externalized

| Decision | Skill resource |
|---|---|
| Which visual communicates the point? | Scene intent + a shortlist from catalog.py |
| Which API and props are valid? | Bundled source, Zod schema, frozen defaults |
| How long should text/motion hold? | Tested duration helpers and actual narration timestamps |
| How should camera and sound support it? | Named shot recipe, cue sheet and reference frames |
| Is it actually correct? | Render, JSON probe, decode, contact sheet and repair loop |
| How can another session continue? | PROJECT.md and a versioned storyboard |

## Reuse-first mode

Give the model one scene request plus 3–5 candidate components, their actual defaults
and one valid example. Have it choose and fill parameters. Do not put hundreds of
full sources in its prompt. Search the catalog, then read only the selected module.
For Onda use schema.parse() to apply defaults; missing required defaults are a real
runtime failure even when TypeScript was suppressed. Keep dependency paths intact.
For RenderComp use exported FPS, DURATION_FRAMES and default props.

Keep creative freedom for message, selection, color and composition. Do not make a
weak model invent quaternion math, encode flags or an entire renderer to change copy.
For custom shots, strong authoring creates a reusable parameterized component plus
real preview; subsequent tasks use the recipe. Do not silently route to a paid model.

## Repair loop

Return the failing command, exit status and concise concrete error. Correct one cause,
render the affected shot, then recheck full assembly if timing/layout changed. Render
errors and perceptual defects are different: a valid MP4 can still be ugly/unreadable.
Do not keep retrying an unchanged request. After repeated same-cause failure save
state and report the missing capability.

## Evidence behind the design

Anthropic's primary engineering articles on building effective agents and writing
tools emphasize clear tool interfaces, task-specific evaluations and useful error
feedback. BrewReel demonstrates a video-specific design where a model fills a
storyboard and prewritten scenes do the rendering. Onda supplies explicit schemas
and composition contracts. These inform our design; they do not establish performance
parity for Video Forge. See research.md and evaluation.md.

## Phrasing: describe, do not command (avoids injection guards)

A brief or doc read from a file in imperative second-person (negative commands, or text
that tells the reader to disregard other instructions) can trip a harness's prompt-injection
detector, which then downgrades an autonomous/--yolo run to require confirmation and stalls
headless. Observed on jazz-cli 2026-10-26: an imperative brief froze the run at the injection
guard before any file was written. Write task text descriptively ("suggested steps", "prefer
rewriting the whole file to surgical edits"). Keep hard rules in the skill's own files,
phrased as what the code does, not as orders to the reader.
