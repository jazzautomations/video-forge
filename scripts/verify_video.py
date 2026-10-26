#!/usr/bin/env python3
"""Probe and fully decode a delivery. Technical verification does not judge visual quality."""
import argparse
import json
import shutil
import subprocess
from fractions import Fraction
from pathlib import Path

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('video', type=Path)
    ap.add_argument('--width', type=int)
    ap.add_argument('--height', type=int)
    ap.add_argument('--fps', type=float)
    ap.add_argument('--duration', type=float)
    ap.add_argument('--require-audio', action='store_true')
    args = ap.parse_args()
    for tool in ['ffmpeg', 'ffprobe']:
        if not shutil.which(tool):
            ap.error(f'{tool} is required on PATH')
    p = subprocess.run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(args.video)], capture_output=True, text=True, timeout=60)
    if p.returncode:
        raise SystemExit(p.stderr)
    data = json.loads(p.stdout)
    videos = [s for s in data['streams'] if s['codec_type'] == 'video']
    audio = [s for s in data['streams'] if s['codec_type'] == 'audio']
    errors = []
    if not videos:
        raise SystemExit('No video stream')
    v = videos[0]
    fps = float(Fraction(v.get('avg_frame_rate', '0/1')))
    duration = float(data['format']['duration'])
    for key in ['width', 'height']:
        expected = getattr(args, key)
        if expected and v[key] != expected:
            errors.append(f'{key}: expected {expected}, found {v[key]}')
    if args.fps and abs(fps - args.fps) > .02:
        errors.append(f'fps: expected {args.fps}, found {fps}')
    if args.duration is not None and abs(duration - args.duration) > max(.12, 2 / max(1, fps)):
        errors.append(f'duration: expected {args.duration}, found {duration}')
    if args.require_audio and not audio:
        errors.append('Missing required audio stream')
    decode = subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(args.video), '-f', 'null', '-'], capture_output=True, text=True, timeout=600)
    if decode.returncode:
        errors.append('Decode failed: ' + decode.stderr[-2000:])
    result = {'ok': not errors, 'path': str(args.video.resolve()), 'duration': duration, 'width': v['width'], 'height': v['height'], 'fps': fps, 'audio_streams': len(audio), 'decoded': decode.returncode == 0, 'errors': errors, 'visual_review': 'required separately', 'audio_listening': 'required separately'}
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['ok'] else 1)

if __name__ == '__main__':
    main()
