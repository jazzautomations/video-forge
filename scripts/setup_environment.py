#!/usr/bin/env python3
"""Prepare a project-local production environment and report exact portable paths."""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.request
import venv
from pathlib import Path

MODELS={
 'kokoro-v1.0.onnx':('7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5','models'),
 'voices-v1.0.bin':('bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d','voices'),
}

def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()

def main():
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('--out',type=Path,required=True);ap.add_argument('--audio',action='store_true',help='Install local speech dependencies and download missing open model files')
 a=ap.parse_args();out=a.out.resolve();out.mkdir(parents=True,exist_ok=True)
 interpreter=out/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
 if not interpreter.exists():venv.create(out,with_pip=True)
 result={'python':str(interpreter),'ffmpeg':shutil.which('ffmpeg'),'ffprobe':shutil.which('ffprobe'),'npm':shutil.which('npm'),'node':shutil.which('node')}
 if a.audio:
  requirements=Path(__file__).resolve().parents[1]/'assets/audio-requirements.txt'
  expected=dict(line.split('==') for line in requirements.read_text().splitlines() if line.strip() and not line.startswith('#'))
  probe='import json,importlib.metadata as m; print(json.dumps({k:m.version(k) for k in '+repr(list(expected))+'}))'
  installed=subprocess.run([str(interpreter),'-c',probe],capture_output=True,text=True)
  ready=installed.returncode==0 and json.loads(installed.stdout)==expected
  if not ready:
   if shutil.which('uv'):subprocess.run(['uv','pip','install','--python',str(interpreter),'-r',str(requirements)],check=True)
   else:subprocess.run([str(interpreter),'-m','pip','install','--disable-pip-version-check','-r',str(requirements)],check=True)
  files={}
  for name,(sha,folder) in MODELS.items():
   cached=Path.home()/'.cache/hyperframes/tts'/folder/name
   target=cached if cached.is_file() else out/'models'/name
   if not target.exists():
    target.parent.mkdir(parents=True,exist_ok=True);temp=target.with_suffix('.part')
    urllib.request.urlretrieve('https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'+name,temp)
    if digest(temp)!=sha:raise ValueError(f'Model checksum mismatch: {name}')
    temp.replace(target)
   if digest(target)!=sha:raise ValueError(f'Unexpected cached model version: {target}')
   files[name]=str(target)
  result.update({'kokoroModel':files['kokoro-v1.0.onnx'],'voices':files['voices-v1.0.bin'],'whisperModel':'base (downloaded by faster-whisper on first use unless a local model directory is passed)'})
 (out/'environment.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps(result,indent=2))

if __name__=='__main__':main()
