#!/usr/bin/env python3
"""Portable background production for harnesses whose shell calls time out quickly."""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT=Path(__file__).resolve().parent

def save(path,data):
    temp=path.with_suffix('.tmp');temp.write_text(json.dumps(data,indent=2)+'\n');temp.replace(path)

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    subs=ap.add_subparsers(dest='action',required=True)
    start=subs.add_parser('start');start.add_argument('storyboard');start.add_argument('--out',required=True)
    status=subs.add_parser('status');status.add_argument('job',type=Path)
    worker=subs.add_parser('_worker');worker.add_argument('job',type=Path)
    args,extra=ap.parse_known_args()
    if args.action=='status':
        data=json.loads(args.job.read_text());report=Path(data['out'])/'out/production-report.json'
        progress=Path(data['out'])/'out/progress.json'
        if progress.exists():data['progress']=json.loads(progress.read_text())
        if report.exists():data['report']=json.loads(report.read_text())
        print(json.dumps(data,ensure_ascii=False));return
    if args.action=='start':
        out=Path(args.out).resolve();job=out.parent/(out.name+'.job.json')
        if job.exists() and json.loads(job.read_text()).get('status')=='running':raise ValueError(f'Already running: {job}')
        out.parent.mkdir(parents=True,exist_ok=True)
        log=out.parent/(out.name+'.job.log')
        cmd=[sys.executable,str(ROOT/'produce.py'),str(Path(args.storyboard).resolve()),'--out',str(out),*extra]
        data={'status':'running','out':str(out),'command':cmd,'log':str(log),'started':time.time()}
        save(job,data)
        with log.open('a') as sink:
            proc=subprocess.Popen([sys.executable,str(Path(__file__).resolve()),'_worker',str(job)],stdout=sink,stderr=subprocess.STDOUT,start_new_session=True)
        data['pid']=proc.pid;save(job,data)
        print(json.dumps({'job':str(job),'status':'running','pid':proc.pid,'next':f'python {Path(__file__).name} status {job}'}));return
    data=json.loads(args.job.read_text());result=subprocess.run(data['command'])
    data.update({'status':'complete' if result.returncode==0 else 'failed','exitCode':result.returncode,'elapsedSeconds':round(time.time()-data['started'],3)})
    save(args.job,data)

if __name__=='__main__':main()
