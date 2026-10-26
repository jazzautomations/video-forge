# Sound design — rule-based, so a weak model gets designed audio without taste

The storyboard carries the words and the mood; `scripts/produce.py` derives the sound
deterministically. You do not hand-mix. The chain is: Kokoro narration (frame-locked by
Remotion) → ffmpeg sidechain-ducks the music bed under the narration → two-pass EBU R128
master. Stems stay as separate files under the project's `public/` and `out/`.

## Mix chain (what produce.py does now)

1. **Narration** is synthesized per scene (Kokoro, Apache-2.0), measured, and scenes are
   auto-extended to fit (never clipped). A per-scene RMS/length guard turns empty/silent
   TTS into a hard error instead of a silently muted video.
2. **Remotion renders video + narration only** (music is no longer mixed in-engine; the
   old caption-window volume lambda ducked on the wrong signal).
3. **Music bed** is ducked under the narration with real sidechain compression via the
   vendored `library/vendor/ffmpeg/scripts/audio.py`:
   `--duck --duck-amount 12 --duck-threshold -24 --duck-attack 20 --duck-release 350
   --music-volume -20 --music-fade-out 1.5`. SFX (`public/sfx.wav`, when present) is mixed
   as a never-ducked `--effects` stem.
4. **Master**: `library/vendor/ffmpeg/scripts/loudness.py -I <target> --tp -1.5` (two-pass,
   linear mode — no single-pass pumping).

### Loudness target by destination

| destination | target | use |
|---|---|---|
| social (default) | −14 LUFS | YouTube, Reels, TikTok, autoplay feeds |
| podcast | −16 LUFS | Apple Podcasts / spoken-word |
| broadcast | −23 LUFS | EBU R128 broadcast |

### Duck knobs (only touch if narration is buried or the bed pumps)

- `--duck-amount` dB the bed drops under speech (8–14 typical).
- `--duck-threshold` dBFS speech level that triggers ducking (−30 ducks earlier, −18 later).
- `--duck-release` ms for the bed to recover after a phrase (250 snappy … 450 smooth).

## TTS engine policy (do not reach past this)

| Engine | License | Verdict |
|---|---|---|
| **Kokoro v1.0** (pf_dora pt-br, af_heart en) | Apache-2.0 (code + weights) | **Default.** Only clean, CPU-fast, expressive multilingual option. |
| Piper | GPL-3.0 | Optional EN/extra-voice alt; keep out of a bundled MIT distribution. |
| XTTS-v2 / F5-TTS-pt-br / Fish | weights CC-BY-NC | User-supplied, flag-gated (`--allow-noncommercial-tts`) only; never bundled, never default. |
| Bark | MIT code | Excluded: non-deterministic, hallucinates — unsafe for a weak driver. |
| MeloTTS | MIT | EN/ES/… only, **no Portuguese**. |

Kokoro has no SSML: control pacing with `voiceSpeed` and sentence pauses, not `<break>`
tags (they are read aloud). Voice, speed and language can be set per scene.

## Roadmap already wired for (drop-in)

`produce.py` mixes `public/sfx.wav` automatically when it exists, so a procedural SFX
palette (`scripts/sfx.py`: whoosh / riser / impact / stinger / tick, numpy @48k, each
reporting its attack so transients land on the frame) and a structured music bed
(chord + arp + perc with a build into the reveal) slot in without changing the mix chain.
See `research/audio-recommendations.json` for the full specification.
