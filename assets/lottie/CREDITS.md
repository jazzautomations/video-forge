# Lottie assets — credits & licenses

All animations in this directory are license-clean: each comes from a GitHub
repository whose root LICENSE is **MIT**. Every file was verified to be a valid,
self-contained Lottie animation (no external image dependencies) and checked for
After Effects **expressions** — expressions that read `time`/`random` break
frame-determinism, so files using them were **rejected** (see bottom).

Verified: 2026-10-27. Downloaded via `curl` from `raw.githubusercontent.com`.

| File | Category | License | Author | Source URL |
|------|----------|---------|--------|------------|
| `check-success.json` | success / check | MIT | useAnimations (https://useanimations.com) | https://github.com/useAnimations/react-useanimations/blob/master/icons/checkmark.json |
| `check-circle.json` | success / check | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/checkCircle.json |
| `loader-spinner.json` | loader / spinner | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/loading.json |
| `loader-dots.json` | loader / spinner | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/loading2.json |
| `loader-infinity.json` | loader (loop) | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/infinity.json |
| `star.json` | spot illustration | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/star.json |
| `heart.json` | spot illustration | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/heart.json |
| `settings-gear.json` | spot illustration (gear) | MIT | useAnimations | https://github.com/useAnimations/react-useanimations/blob/master/icons/settings.json |
| `celebration-newyear.json` | confetti / celebration | MIT | Airbnb (lottie-web demo) | https://github.com/airbnb/lottie-web/blob/master/demo/happy2016/data.json |
| `logo-reveal.json` | abstract / logo reveal | MIT | Airbnb (lottie-web "Bodymovin" demo) | https://github.com/airbnb/lottie-web/blob/master/demo/bodymovin/data.json |
| `character-cat.json` | spot illustration (cat) | MIT | Airbnb (lottie-web "Gatin" demo) | https://github.com/airbnb/lottie-web/blob/master/demo/gatin/data.json |
| `character-rocker.json` | spot illustration (character) | MIT | Airbnb (lottie-web "Adrock" demo) | https://github.com/airbnb/lottie-web/blob/master/demo/adrock/data.json |
| `abstract-background.json` | abstract background | MIT | Diffusion Studio | https://github.com/diffusionstudio/lottie/blob/main/public/projects/main-project/scene-1/lottie.json |
| `abstract-diamond-loop.json` | abstract loop | MIT | David Gamote (Gamote/lottie-react) | https://github.com/Gamote/lottie-react/blob/master/website/public/anim.json |

## License notes

- **useAnimations** (`react-useanimations`): repo LICENSE is MIT (Copyright
  2018-2026 useAnimations). The project README explicitly states: *"The code and
  the animations are free for personal and commercial use. Attribution is not
  required but appreciated."* So the animation JSON — not just the wrapper code —
  is covered.
- **Airbnb `lottie-web`**: repo LICENSE.md is the MIT License. The `demo/*`
  animations are Airbnb's own demo content shipped in that MIT repo.
- **Diffusion Studio `lottie`** and **Gamote `lottie-react`**: both repo roots
  carry the MIT License; the single sample animation in each is distributed
  within that MIT repo.

All 14 files were checked and contain **zero expressions** (fully baked), so they
are frame-deterministic and safe for video-forge rendering.

## Rejected (NOT kept)

- **`navidad` / lottie-web demo** (airbnb/lottie-web, MIT): license is fine, but
  the animation uses **50 After Effects expressions** (layer-style color
  expressions). Expressions break frame-determinism, so it was excluded per the
  baked-animation preference.
- **`xvrh/lottie-flutter` example assets** (`example/assets/lottiefiles/*.json`):
  the repo is MIT, but these JSON files were sourced from LottieFiles by a third
  party and carry their own (unverified) licensing — **uncertain**, so rejected.
- **`basmilius/meteocons`** (MIT): the `animations/configs/*.json` are build
  configs (`{"targets":[...],"includes":[...]}`), **not playable Lottie**. The
  rendered Lottie output is not committed as loose JSON in the repo.
- **`yako-dev/flutter-yako-celebrations`** (MIT): confetti/celebration effects are
  implemented with custom Flutter painters, **no Lottie JSON** to extract.
