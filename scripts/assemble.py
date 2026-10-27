#!/usr/bin/env python3
"""Assemble ONE film from segments rendered by DIFFERENT engines.

This is the multi-engine / "reference edit" path: a film is a list of segments, each
produced by the engine that fits it best, then normalised and joined into one MP4 by the
bundled FFmpeg layer (join.py handles differing resolution/fps/audio; audio.py mixes a
music bed). It is how HyperFrames (HTML/GSAP), Remotion (React scenes) and real footage
live in the same video.

Manifest JSON (pass its path, or '-' to read stdin):
{
  "width": 1920, "height": 1080, "fps": 30,
  "transition": "fade", "transitionSeconds": 0.5,   # xfade between segments (see join.py)
  "out": "film.mp4",
  "music": "bed.wav",            # optional: ducked under the film audio
  "segments": [
    {"engine": "hyperframes", "dir": "library/hyperframes/editorial"},
    {"engine": "remotion", "storyboard": "promo.json", "nodeModules": "/path/to/node_modules"},
    {"engine": "video", "src": "capture.mp4", "start": 2, "duration": 6}
  ]
}

Engines:
  video        a pre-rendered clip; optional {start,duration} trims it with cut.py.
               (Use this for a Remotion storyboard you already rendered with run.py,
                e.g. a narrated film, or for downloaded/recorded footage.)
  hyperframes  render {dir} (a HyperFrames project) with `npx hyperframes render`.
  remotion     compile {storyboard} with build_project.py and render it SILENT; reuses
               {nodeModules} if given, else runs `npm install --ignore-scripts`.

Robust FFmpeg: a broken `ffprobe` that reports duration 0 silently breaks joins and
HyperFrames' own artifact check. assemble.py probes a candidate ffprobe on a 1 s test clip
and refuses to run on a broken one; override the toolchain with --ffmpeg-dir or
$VIDEO_FORGE_FFMPEG_DIR (a dir holding ffmpeg+ffprobe), or "ffmpegDir" in the manifest.

Run with --dry-run to see the plan (segments, engines, output) without rendering.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FF = ROOT / 'library/vendor/ffmpeg/scripts'

def _run(cmd, env=None, cwd=None, quiet=False):
    r = subprocess.run(cmd, env=env, cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0 and not quiet:
        sys.stderr.write(f"\n$ {' '.join(str(c) for c in cmd)}\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}\n")
    return r

def _probe_duration(ffprobe, path):
    r = subprocess.run([ffprobe, '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'default=nw=1:nk=1', str(path)], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0

def resolve_ffmpeg_dir(preferred):
    """Return a dir whose ffmpeg+ffprobe actually work (duration probe != 0), or exit."""
    cands = []
    for p in (preferred, os.environ.get('VIDEO_FORGE_FFMPEG_DIR')):
        if p:
            cands.append(Path(p))
    # the dir of whatever ffmpeg/ffprobe is on PATH
    for name in ('ffprobe', 'ffmpeg'):
        w = shutil.which(name)
        if w:
            cands.append(Path(w).parent)
    cands.append(ROOT / 'library/vendor/ffmpeg/bin')
    seen, ordered = set(), []
    for c in cands:
        c = c.resolve()
        if c not in seen:
            seen.add(c); ordered.append(c)
    tmp = Path(tempfile.mkdtemp())
    test = tmp / 'probe.mp4'
    for d in ordered:
        ffmpeg, ffprobe = d / 'ffmpeg', d / 'ffprobe'
        if not (ffmpeg.exists() and ffprobe.exists()):
            continue
        r = subprocess.run([str(ffmpeg), '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=d=1:s=320x240:r=30',
                            '-pix_fmt', 'yuv420p', '-y', str(test)], capture_output=True, text=True)
        if r.returncode != 0 or not test.exists():
            continue
        if 0.9 <= _probe_duration(str(ffprobe), test) <= 1.1:
            shutil.rmtree(tmp, ignore_errors=True)
            return d
    shutil.rmtree(tmp, ignore_errors=True)
    sys.exit("No working ffmpeg+ffprobe found. A broken ffprobe (reports duration 0) will "
             "silently sink joins and HyperFrames. Pass --ffmpeg-dir <dir> or set "
             "$VIDEO_FORGE_FFMPEG_DIR to a dir that holds a real ffmpeg and ffprobe.")

def env_with(ffdir):
    env = os.environ.copy()
    env['PATH'] = f"{ffdir}{os.pathsep}{env.get('PATH','')}"
    return env

def render_hyperframes(seg, work, env, fps):
    proj = (ROOT / seg['dir']) if not Path(seg['dir']).is_absolute() else Path(seg['dir'])
    if not (proj / 'package.json').is_file():
        sys.exit(f"hyperframes segment: {proj} has no package.json")
    out = work / f"{proj.name}.mp4"
    r = _run(['npx', '--no-install', 'hyperframes', 'render', '--output', str(out),
              '--fps', str(fps), '--quality', 'high'], env=env, cwd=str(proj))
    if r.returncode != 0 or not out.exists():
        sys.exit(f"hyperframes render failed for {proj} (see log above)")
    return out

def render_remotion(seg, work, env, idx):
    sb = (ROOT / seg['storyboard']) if not Path(seg['storyboard']).is_absolute() else Path(seg['storyboard'])
    proj = work / f"remotion_{idx}"
    r = _run([sys.executable, str(ROOT / 'scripts/build_project.py'), str(sb), '--out', str(proj)], env=env)
    if r.returncode != 0:
        sys.exit(f"remotion build failed for {sb}")
    nm = seg.get('nodeModules')
    if nm and Path(nm).is_dir():
        (proj / 'node_modules').symlink_to(Path(nm).resolve())
    else:
        if _run(['npm', 'install', '--ignore-scripts', '--no-audit', '--no-fund'], env=env, cwd=str(proj)).returncode != 0:
            sys.exit(f"npm install failed for {sb}")
    out = proj / 'out' / 'video.mp4'
    if _run(['npx', 'remotion', 'render', 'src/index.tsx', 'Video', str(out), '--log=error'],
            env=env, cwd=str(proj)).returncode != 0 or not out.exists():
        sys.exit(f"remotion render failed for {sb}")
    return out

def prep_video(seg, work, env, idx):
    src = Path(seg['src'])
    if not src.is_absolute():
        src = (ROOT / seg['src']) if (ROOT / seg['src']).exists() else Path.cwd() / seg['src']
    if not src.is_file():
        sys.exit(f"video segment: {src} not found")
    if 'start' in seg or 'duration' in seg:
        out = work / f"clip_{idx}.mp4"
        cmd = [sys.executable, str(FF / 'cut.py'), str(src)]
        if 'start' in seg: cmd += ['--start', str(seg['start'])]
        if 'duration' in seg: cmd += ['--duration', str(seg['duration'])]
        cmd += ['--accurate', '-o', str(out), '--json-brief']
        if _run(cmd, env=env).returncode != 0 or not out.exists():
            sys.exit(f"cut failed for {src}")
        return out
    return src

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('manifest')
    ap.add_argument('--out')
    ap.add_argument('--ffmpeg-dir')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    raw = sys.stdin.read() if a.manifest == '-' else Path(a.manifest).read_text()
    m = json.loads(raw)
    W, H = int(m.get('width', 1920)), int(m.get('height', 1080))
    fps = int(m.get('fps', 30))
    transition = m.get('transition', 'fade')
    tsecs = m.get('transitionSeconds', 0.5)
    out = Path(a.out or m.get('out') or 'film.mp4')
    segs = m.get('segments') or []
    if not segs:
        sys.exit("manifest has no segments")
    for i, s in enumerate(segs):
        if s.get('engine') not in ('video', 'hyperframes', 'remotion'):
            sys.exit(f"segment[{i}]: engine must be video|hyperframes|remotion")

    if a.dry_run:
        print(json.dumps({'ok': True, 'dry_run': True, 'out': str(out), 'size': [W, H], 'fps': fps,
                          'transition': transition, 'segments': [s.get('engine') for s in segs]}, indent=2))
        return

    ffdir = resolve_ffmpeg_dir(a.ffmpeg_dir or m.get('ffmpegDir'))
    env = env_with(ffdir)
    print(f"[assemble] ffmpeg toolchain: {ffdir}", file=sys.stderr)
    work = Path(tempfile.mkdtemp(prefix='vf-assemble-'))
    clips = []
    for i, s in enumerate(segs):
        eng = s['engine']
        print(f"[assemble] segment {i+1}/{len(segs)}: {eng}", file=sys.stderr)
        if eng == 'hyperframes':
            clips.append(render_hyperframes(s, work, env, fps))
        elif eng == 'remotion':
            clips.append(render_remotion(s, work, env, i))
        else:
            clips.append(prep_video(s, work, env, i))

    joined = work / 'joined.mp4'
    jcmd = [sys.executable, str(FF / 'join.py')] + [str(c) for c in clips] + \
           ['-o', str(joined), '--width', str(W), '--height', str(H), '--fps', str(fps),
            '--transition', transition, '--json-brief']
    if transition != 'none':
        jcmd += ['--duration', str(tsecs)]
    if _run(jcmd, env=env).returncode != 0 or not joined.exists():
        sys.exit("join failed (see log above)")

    final = joined
    if m.get('music'):
        music = (ROOT / m['music']) if not Path(m['music']).is_absolute() and (ROOT / m['music']).exists() else Path(m['music'])
        mixed = work / 'mixed.mp4'
        if _run([sys.executable, str(FF / 'audio.py'), str(joined), '--music', str(music),
                 '--duck', '-o', str(mixed), '--json-brief'], env=env).returncode == 0 and mixed.exists():
            final = mixed
        else:
            print("[assemble] music mix failed; keeping the un-scored join", file=sys.stderr)

    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(final, out)
    dur = _probe_duration(str(ffdir / 'ffprobe'), out)
    # best-effort verification via the bundled checker
    _run([sys.executable, str(ROOT / 'scripts/verify_video.py'), str(out),
          '--width', str(W), '--height', str(H), '--fps', str(fps)], env=env, quiet=True)
    print(json.dumps({'ok': True, 'out': str(out), 'duration': round(dur, 3),
                      'size': [W, H], 'fps': fps, 'segments': len(clips),
                      'engines': [s['engine'] for s in segs]}, indent=2))

if __name__ == '__main__':
    main()
