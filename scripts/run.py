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
 ap.add_argument('--wait',action='store_true',help='Run the durable background job but BLOCK in this one command until the MP4 is done, then exit with its code. One line, no external poll loop — the robust path for an autonomous agent.')
 a=ap.parse_args()
 if a.wait:a.background=True
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
 if a.wait:
  # Start the durable job, then block HERE until it finishes — one command for a driving model:
  # no hand-rolled poll loop (the step-burner that derails weak agents), yet the render still runs
  # under production_job, so a mid-way interruption can be resumed with --resume.
  import time
  r=subprocess.run(cmd,capture_output=True,text=True)
  sys.stdout.write(r.stdout);sys.stderr.write(r.stderr)
  if r.returncode!=0:raise SystemExit(r.returncode)
  lines=[l for l in r.stdout.splitlines() if l.strip()]
  try:job=json.loads(lines[-1])['job']
  except Exception:raise SystemExit('run.py --wait: could not read the job handle from production_job start')
  st={'status':'running'}
  while st.get('status')=='running':
   time.sleep(5)
   try:st=json.loads(Path(job).read_text())
   except Exception:pass
  print(json.dumps({'status':st.get('status'),'out':st.get('out'),'exitCode':st.get('exitCode')}))
  raise SystemExit(0 if st.get('status')=='complete' else 1)
 raise SystemExit(subprocess.run(cmd).returncode)

if __name__=='__main__':main()
