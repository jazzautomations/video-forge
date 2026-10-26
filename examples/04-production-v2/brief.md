# Same-brief production test

Produce a 20-second, 1920×1080, 30fps Video Forge demonstration for WoHackers.
The subject is making complete videos from reusable code. The audience should see
an editorial opening, the actual local product recording with purposeful zoom,
cursor/click and a mask over the fictional email, a clearly raised open-hand
character greeting, a real lit 3D mesh and a closing invitation.

Use charcoal #101710, paper #F3F1E9, lime #D7FF64 and consistent typography.
Require Portuguese narration, synchronized readable word-motion captions, a soft
sound bed/action cues and a complete verified MP4. The character must inherit the
same visual identity and must not move its hand across the front of the torso.
Use the shared production runner and components. You choose short Portuguese copy.
Do not write custom TSX, call another model, use hosted services or stop at a JSON.

The provided recording is screen.mp4 next to this brief. Its source canvas is
1920×1080; trim/leading blank removal has already been done. The action button is
at (1313,747); the click is around source 1.9s. A source-space opaque mask at
x=1550,y=32,width=300,height=60 covers the fictional email. The production recipe
shows how masks, camera and cursor are represented. Keep the mask for the whole
recording scene. Scene narration must be short enough for its slot.

Read SKILL.md, references/production-direction.md and assets/storyboard-production.json.
Write the storyboard and generated project in the task workspace.
Use an output sibling so scene src remains screen.mp4. Validate the storyboard and
execute scripts/produce.py; inspect its report and complete video rather than claim
that a plan alone passes. If speech is too long, shorten that scene's narration and
resume the same generated project. Save actual timings and tool results.
