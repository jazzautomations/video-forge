#!/usr/bin/env python3
"""Package portable skill sources, licenses and the reviewed example; exclude local caches."""
import argparse
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TOP={'SKILL.md','README.md','LICENSE','CONTRIBUTING.md','THIRD_PARTY_NOTICES.md','references','library','scripts','assets','examples'}
EXCLUDE={'node_modules','__pycache__','.cache','.jazz','.git','research','.local','capture','renders'}
PROOF_OUTPUTS={'video-forge-wohackers.mp4','video-forge-wohackers_sheet.png','verification.json','QA.md','final.mp4','final_sheet.png','production-report.json','jazz-free-model.mp4','jazz-free-model_sheet.png','cut-boundaries.png'}

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
 a.output.parent.mkdir(parents=True,exist_ok=True)
 count=0
 with zipfile.ZipFile(a.output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in sorted(ROOT.rglob('*')):
   rel=p.relative_to(ROOT)
   if rel.parts[0] not in TOP or any(x in EXCLUDE for x in rel.parts) or not p.is_file():continue
   if len(rel.parts)>1 and rel.parts[0]=='examples' and rel.parts[1] in {'02-wohackers','03-jazz-free-model'} and 'out' in rel.parts:continue
   if 'out' in rel.parts and p.name not in PROOF_OUTPUTS:continue
   if p.suffix in {'.pyc','.log'}:continue
   z.write(p,Path('video-forge')/rel);count+=1
 print(f'{a.output}: {count} files, {a.output.stat().st_size} bytes')

if __name__=='__main__':main()
