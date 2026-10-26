# Contributing to Video Forge

Contribute reusable code, small production recipes and demonstrated fixes. Preserve
user intent; avoid adding universal taste rules from a single example.

Every authored component should expose useful typed parameters/defaults, support
absolute-time seeking and include a rendered example. Check hero frames and transitions.
A 3D component should use real geometry/material/light/camera when advertised as 3D.

Vendor permissively licensed source only after inspecting its license and dependencies.
Preserve LICENSE/copyright, source tree/version and any asset notices. Do not relicense
upstream code as ours. Keep source snapshots unchanged; adapt them in project code.
Runtime packages are installed as project dependencies, not copied into the skill.

Update library/catalog.json for new modules. Keep discovery concise; detailed APIs
belong with each module or in a conditional reference. Do not load the whole catalog
into the model context. Run relevant helper commands and render examples before
claiming they work. scripts/verify_video.py checks technical output; visual and audio
review are separate. Model quality claims require paired evaluation; see
references/evaluation.md.
