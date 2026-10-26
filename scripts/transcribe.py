#!/usr/bin/env python3
"""Word timestamps + short caption pages from final narration. Requires faster-whisper."""
import argparse
import json
from pathlib import Path

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('audio')
    ap.add_argument('--model', default='base', help='Whisper model name or a downloaded local model directory')
    ap.add_argument('--language', default='pt')
    ap.add_argument('--words-per-page', type=int, default=5)
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    if args.words_per_page < 1:
        ap.error('--words-per-page must be positive')
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        ap.error('Install faster-whisper in the Python environment used to run this script')
    model = WhisperModel(args.model, device='cpu', compute_type='int8')
    segments, info = model.transcribe(args.audio, language=args.language, word_timestamps=True, vad_filter=True)
    words = []
    for segment in segments:
        for w in segment.words or []:
            if w.word.strip():
                words.append({'text': w.word.strip(), 'startMs': round(w.start*1000), 'endMs': round(w.end*1000)})
    pages=[]; current=[]
    def flush():
        if current:
            pages.append({'startMs': current[0]['startMs'], 'endMs': current[-1]['endMs'], 'words': list(current)})
            current.clear()
    for w in words:
        if current and (len(current) >= args.words_per_page or w['startMs'] - current[-1]['endMs'] > 650):
            flush()
        current.append(w)
        if w['text'].endswith(('.', '!', '?')):
            flush()
    flush()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({'language': info.language, 'words': words, 'pages': pages}, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'output': str(args.output), 'words': len(words), 'pages': len(pages)}, ensure_ascii=False))

if __name__ == '__main__':
    main()
