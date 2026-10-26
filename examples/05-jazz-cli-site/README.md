# 05 · Product promo from a public page (Jazz CLI, 38 s)

What a strong session did on 2026-10-26, kept as the recipe for a weak model.
The first attempt failed for one reason: the "screen" scene was a capture of the
operator's own desktop (terminal + editor), not the product. Nobody can tell what is
being advertised from that. The fix is footage of the product page itself.

1. Record the page and learn where things are:
   `VF_BROWSER_PATH=<chromium> node scripts/record-page.mjs https://jazz-cli.jazzautomations.com.br/ targets.json capture`
   `targets.json` is the one here: hero, install command, staged terminal session,
   reference-machine table. `marks.json` gives each target's time and a clamped camera key.
2. Cut one clip per scene (ScreenFocus plays a clip from its start), starting after the
   `page-ready` mark: `ffmpeg -i capture/page.webm -ss <mark> -t <scene s> -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -an capture/site-a.mp4`
3. Write `storyboard.json` (this folder): title → three screen scenes with camera keys from
   marks.json → character → three → closing title. Narration spells the product name
   `Jazz C L I`; written `Jazz CLI` the pt-br voice says "Dia é 151".
4. `python3 scripts/produce.py storyboard.json --out film --kokoro-model … --voices …`
   without `--browser` (Remotion's own chrome-headless-shell renders the WebGL scene).
   Then open `out/final_sheet.png` and a 1 fps contact sheet before calling it done.

Measured on an old machine: capture 25 s, narration + captions 1.5 min, render 7 min.
`build_project.py` now rejects camera keys that show outside the recording; both
mistakes made while writing this storyboard were exactly that.
