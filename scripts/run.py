#!/usr/bin/env python3
"""Start production using the local environment created by setup_environment.py."""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

def main():
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('storyboard');ap.add_argument('--out',required=True)
 ap.add_argument('--environment',type=Path,default=Path('.video-forge-tools/environment.json'))
 ap.add_argument('--browser');ap.add_argument('--whisper-model',default='base')
 ap.add_argument('--resume',action='store_true')
 ap.add_argument('--draft',action='store_true',help='Fast silent preview render, then stop')
 ap.add_argument('--background',action='store_true',help='Launch via production_job and return immediately (for harnesses whose bash calls time out); poll with production_job.py status')
 a=ap.parse_args()
 if not a.environment.exists():ap.error('Prepare once: python3 scripts/setup_environment.py --out .video-forge-tools --audio')
 config=json.loads(a.environment.read_text())
 # Default: run produce.py directly and BLOCK until the MP4 is done, so one command = finished video.
 target='production_job.py' if a.background else 'produce.py'
 cmd=[config['python'],str(Path(__file__).with_name(target))]
 if a.background:cmd+=['start']
 cmd+=[a.storyboard,'--out',a.out,'--whisper-model',a.whisper_model]
 for key,flag in [('kokoroModel','--kokoro-model'),('voices','--voices')]:
  if config.get(key):cmd += [flag,config[key]]
 # Reuse a prepared node_modules when the environment names one, so the full video path
 # never shells out to npm install/ci. This removes the dependency-orchestration step that
 # trips up weaker driving models (hallucinated/garbled npm commands, blocked downloads).
 if config.get('nodeModules'):cmd += ['--node-modules',config['nodeModules']]
 if a.browser:cmd += ['--browser',a.browser]
 if a.resume:cmd += ['--resume']
 if a.draft:cmd += ['--draft']
 raise SystemExit(subprocess.run(cmd).returncode)

if __name__=='__main__':main()
