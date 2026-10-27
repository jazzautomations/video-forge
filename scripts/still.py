#!/usr/bin/env python3
"""Render ONE frame of a storyboard to a PNG — the cheap hero-frame path the taste critic
loop needs (references/taste.md §3). Without this, "render a frame, look, fix, repeat" forces
a full narrate+encode render per iteration, which defeats a bounded, weak-model loop.

    python3 scripts/still.py ./storyboard.json --frame 90 --out hero.png [--node-modules PATH]

--frame is a frame index at the storyboard's fps (default 30). Pick the HELD moment of the
scene you are judging, not frame 0. --node-modules points at an already-installed project's
node_modules to skip `npm install` (seconds instead of minutes); otherwise it installs once.
Backed by `npx remotion still`, which deterministically seeks that single frame.
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

def _run(cmd, cwd=None, env=None):
    r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(f"\n$ {' '.join(str(c) for c in cmd)}\n{r.stdout[-1500:]}\n{r.stderr[-1500:]}\n")
    return r

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('storyboard')
    ap.add_argument('--frame', type=int, default=90)
    ap.add_argument('--out', required=True)
    ap.add_argument('--node-modules')
    ap.add_argument('--keep', action='store_true', help='keep the temp project (reuse its node_modules next time)')
    a = ap.parse_args()

    sb = Path(a.storyboard).resolve()
    if not sb.is_file():
        sys.exit(f"storyboard not found: {sb}")
    work = Path(tempfile.mkdtemp(prefix='vf-still-'))
    proj = work / 'proj'
    r = _run([sys.executable, str(ROOT / 'scripts/build_project.py'), str(sb), '--out', str(proj)])
    if r.returncode != 0:
        sys.exit("build_project failed (see log above)")

    nm = a.node_modules
    if nm and Path(nm).is_dir():
        (proj / 'node_modules').symlink_to(Path(nm).resolve())
    else:
        print("[still] installing deps (pass --node-modules to skip next time)...", file=sys.stderr)
        if _run(['npm', 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error'], cwd=str(proj)).returncode != 0:
            sys.exit("npm install failed")

    out = Path(a.out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    r = _run(['npx', 'remotion', 'still', 'src/index.tsx', 'Video', str(out),
              f'--frame={a.frame}', '--log=error'], cwd=str(proj))
    if r.returncode != 0 or not out.exists():
        sys.exit("remotion still failed (see log above)")

    if not (a.keep or a.node_modules):
        shutil.rmtree(work, ignore_errors=True)
    print(json.dumps({'ok': True, 'out': str(out), 'frame': a.frame,
                      'project': str(proj) if (a.keep or a.node_modules) else '(removed)'}, indent=2))

if __name__ == '__main__':
    main()
