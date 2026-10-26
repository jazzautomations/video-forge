# Narration, motion captions and sound design

Use supplied speech or synthesize narration when requested. The prohibition on
image/video generation does not prohibit TTS. Start with script/scene intent, generate
or record the actual audio, measure it, then lock scene timing. Do not estimate final
word timings by dividing script length.

## Voice

HyperFrames offers `tts` (inspect installed --help), including local Kokoro support.
The Kokoro project is Apache-2.0; voices and downloads still need provenance. For Piper
note version drift: the maintained OHF-Voice/piper1-gpl is GPL-3.0, unlike archived MIT
implementations. Do not label all Piper distributions MIT. Existing paid TTS services
are optional when authorized; never require API keys to use the whole skill.
An offline espeak voice can verify a pipeline, but label it a rough technical voice,
not finished professional narration. Do not clone someone's voice without authorization.

Acronyms and product names are the usual TTS failure. Kokoro pt-br reads "Jazz CLI" as
"Dia é 151"; written "Jazz C L I" (letters separated by spaces) it is read correctly.
Spell initialisms with spaces in the narration text, write numbers as words when the
reading matters ("dois giga"), and keep the on-screen title in normal spelling. The
produce.py report lists `correctionsToReview`: a replacement on a product name means
the voice said something else; listen to that scene's speech-NN.wav or respell it.

## Word-timed motion captions

Transcribe the final speech with a local supported Whisper setup or HyperFrames.
Keep words as `{text,startMs,endMs}` and pages/phrases with explicit boundaries.
Remap every timestamp after edits: output time = source word time - cut in + output
segment start. Preserve names, numbers and Portuguese accents; manually inspect ASR.

Bundled `library/scenes/MotionCaptions.tsx` has deterministic page reveal, word-level
highlight and a small active-word motion. Onda's Captions component is another source;
its schema accepts word timestamps. Choose readable grouping, not all words at once.
Use a highlight sweep, underline, pill, word lift or a scarce hero-word promotion.
Keep contrast over moving footage and place captions away from critical UI/face areas.
Test the final crop and platform controls, not only the 1920px editing viewport.

## Sound

Keep narration, bed and SFX as separate files/stems. Put cues on meaningful actions,
not on every visual movement. Duck music under speech, fade joins and avoid clipping.
The vendored audio/loudness/check helpers provide local processing and measured output.
Use 48 kHz for a mixed video workflow when normalizing; keep sample timing explicit.
For final loudness targets choose the destination and content, not a universal number.
A technical mix test does not replace listening; report unavailable audio review.

Do not retime narration just to fit an arbitrary equal-length scene grid. Let speech
and reading time shape the edit, then use transition overlap in the total duration.
