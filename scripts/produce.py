#!/usr/bin/env python3
"""Storyboard -> assets, timed voice, script-corrected captions, render, master and QA.

Uses the same reusable production path for any driving agent. No model-authored JSX.
Run with a Python environment containing kokoro-onnx, soundfile, faster-whisper and
compatible PyAV when narration is requested. Existing model paths can be overridden.
"""
import argparse
import difflib
import hashlib
import json
import math
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

from build_project import validate

ROOT=Path(__file__).resolve().parents[1]

def run(cmd,cwd=None,log=None):
    result=subprocess.run([str(x) for x in cmd],cwd=cwd,capture_output=True,text=True)
    if log:
        Path(log).write_text(result.stdout+'\n'+result.stderr)
    if result.returncode:
        raise RuntimeError(f'Command failed ({result.returncode}): {cmd}\n{result.stderr[-4000:]}\n{result.stdout[-1000:]}')
    return result

def normalized(word):
    return re.sub(r'[^\w]','',unicodedata.normalize('NFKD',word.lower()).encode('ascii','ignore').decode())

def restore_script(asr,text):
    """Preserve the authored words; replacement timings stay inside ASR speech spans.

    This is ASR-assisted correction, not phoneme-level forced alignment. Record
    replacements for review rather than silently pretending ASR was exact.
    """
    wanted=text.split(); output=[];changes=[]
    matcher=difflib.SequenceMatcher(None,[normalized(x['text']) for x in asr],[normalized(x) for x in wanted],autojunk=False)
    for tag,a,b,c,d in matcher.get_opcodes():
        if tag=='equal':
            output.extend({**asr[a+i],'text':word} for i,word in enumerate(wanted[c:d]));continue
        changes.append({'asr':' '.join(x['text'] for x in asr[a:b]),'script':' '.join(wanted[c:d]),'kind':tag})
        if c==d:continue
        if a==b:
            # ASR produced no tokens for these authored words — it dropped them. A swallowed
            # short function word ("a", "o", "e", "é") is an ASR artifact, not a reason to fail
            # the whole render, so place the dropped words in the gap between the previous output
            # word and the next ASR word (still recorded in `changes`). Refuse only when a lot was
            # dropped at once, which signals a genuine transcription failure worth reviewing.
            tokens=wanted[c:d]
            if sum(len(normalized(w)) for w in tokens)>12:
                raise ValueError('ASR omitted substantial script words; review audio instead of fabricating timestamps: '+' '.join(tokens))
            prev_end=output[-1]['endMs'] if output else (asr[a]['startMs'] if a<len(asr) else 0)
            nxt_start=asr[a]['startMs'] if a<len(asr) else prev_end+140*len(tokens)
            if nxt_start<=prev_end:nxt_start=prev_end+140*len(tokens)
            lengths=[max(1,len(normalized(w))) for w in tokens];total=sum(lengths);at=prev_end
            for word,length in zip(tokens,lengths):
                until=at+(nxt_start-prev_end)*length/total
                output.append({'text':word,'startMs':round(at),'endMs':round(until)});at=until
            continue
        start,end=asr[a]['startMs'],asr[b-1]['endMs'];tokens=wanted[c:d]
        lengths=[max(1,len(normalized(w))) for w in tokens];total=sum(lengths);at=start
        for word,length in zip(tokens,lengths):
            until=at+(end-start)*length/total
            output.append({'text':word,'startMs':round(at),'endMs':round(until)});at=until
    return output,changes

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('storyboard',type=Path);ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--resume',action='store_true',help='Resume an existing generated project after a script/timing repair')
    ap.add_argument('--draft',action='store_true',help='Render a fast silent draft (no narration/captions/music) to preview motion, then stop')
    ap.add_argument('--browser',help="Chrome executable for Remotion. Leave unset: Remotion's own chrome-headless-shell (downloaded into node_modules/.remotion) renders WebGL with --gl=angle; a Playwright or system Chromium fails 'three' scenes with 'Error creating WebGL context'")
    ap.add_argument('--gl',default='angle')
    ap.add_argument('--kokoro-model',type=Path,default=Path.home()/'.cache/hyperframes/tts/models/kokoro-v1.0.onnx')
    ap.add_argument('--voices',type=Path,default=Path.home()/'.cache/hyperframes/tts/voices/voices-v1.0.bin')
    ap.add_argument('--whisper-model',default='base')
    ap.add_argument('--node-modules',type=Path,help='Reuse an existing compatible dependency installation; otherwise npm ci/install')
    args=ap.parse_args();started=time.monotonic()
    spec=json.loads(args.storyboard.read_text());errors=validate(spec)
    if errors:raise ValueError(json.dumps(errors))
    scenes=spec['scenes'];voiced=any(s.get('narration') for s in scenes)
    if args.draft:voiced=False;spec['music']=False  # fast silent preview: motion only, no audio stages
    for tool in ['ffmpeg','ffprobe','npm']:
        if not shutil.which(tool):raise ValueError(f'Missing {tool} on PATH')
    if voiced and (not args.kokoro_model.is_file() or not args.voices.is_file()):
        raise ValueError('Narration requested but local Kokoro model/voices are missing. Supply --kokoro-model and --voices; no silent substitute was made.')
    out=args.out.resolve()
    if args.resume:
        if not (out/'storyboard.json').is_file() or not (out/'src/index.tsx').is_file():raise ValueError('Resume needs a generated project with storyboard.json and src/index.tsx')
        previous=json.loads((out/'storyboard.json').read_text())
        if {s['kind'] for s in previous['scenes']}!={s['kind'] for s in scenes}:raise ValueError('Scene kinds changed; compile to a new output directory')
        shutil.copy2(args.storyboard,out/'storyboard.json')
    else:
        run([sys.executable,ROOT/'scripts/build_project.py',args.storyboard.resolve(),'--out',out])
    for s in scenes:
        if s['kind']=='screen':
            source=(args.storyboard.resolve().parent/s['src']).resolve()
            if not source.is_file():raise ValueError(f'Missing recording: {source}')
            target=out/'public'/s['src']
            if not target.resolve().is_relative_to((out/'public').resolve()):raise ValueError('Scene src must be relative to project public/')
            target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
    fps=spec['fps'];requested=[round(s['seconds']*fps)/fps for s in scenes]
    production={'narration':voiced,'music':bool(spec.get('music',voiced)),'pages':[],'corrections':[]}
    def progress(stage,**details):
        (out/'out/progress.json').write_text(json.dumps({'stage':stage,'elapsedSeconds':round(time.monotonic()-started,2),**details})+'\n')
    rate=24000;lead=.25;tail=.2;scene_samples={}
    progress('prepare-audio')
    if voiced:
        import numpy as np
        import soundfile as sf
        from kokoro_onnx import Kokoro
        kokoro=Kokoro(str(args.kokoro_model),str(args.voices))
        # Pass 1 - synthesize speech and MEASURE it. A scene whose narration runs long is
        # extended deterministically (never clipped, never aborted). Cached speech is reused
        # on --resume so an interrupted run does not re-synthesize completed scenes.
        for index,scene in enumerate(scenes):
            text=scene.get('narration','').strip()
            if not text:continue
            progress('narration-synth',scene=index,totalScenes=len(scenes))
            speech=out/'public'/f'speech-{index:02d}.wav';sig_file=out/'out'/f'speech-{index:02d}.sha'
            sig=hashlib.sha256('|'.join([text,spec.get('voice','pf_dora'),str(spec.get('voiceSpeed',1.0)),spec.get('voiceLanguage','pt-br')]).encode()).hexdigest()
            if args.resume and speech.is_file() and sig_file.is_file() and sig_file.read_text().strip()==sig:
                samples,sr=sf.read(str(speech),dtype='float32')
            else:
                samples,sr=kokoro.create(text,voice=spec.get('voice','pf_dora'),speed=spec.get('voiceSpeed',1.0),lang=spec.get('voiceLanguage','pt-br'))
                if sr!=rate:raise ValueError(f'Unexpected sample rate {sr}; expected {rate}')
                sf.write(speech,samples,rate);sig_file.write_text(sig)
            scene_samples[index]=np.asarray(samples,dtype=np.float32)
            clip=scene_samples[index];clip_dur=len(clip)/rate;clip_rms=float(np.sqrt(np.mean(clip**2))) if len(clip) else 0.0
            if clip_dur<0.15 or clip_rms<1e-3:raise ValueError(f'scenes[{index}]: TTS returned empty/silent audio ({clip_dur:.3f}s, rms={clip_rms:.4f}) for narration {text!r}; fix the narration text, voice or voiceLanguage')
            needed=len(samples)/rate+lead+tail
            if needed>requested[index]:requested[index]=math.ceil(needed*fps)/fps
        del kokoro
        import gc;gc.collect()
    durations=requested;duration=sum(durations)
    # Persist the possibly-extended durations so the Remotion render matches the audio exactly.
    for index,s in enumerate(scenes):s['seconds']=durations[index]
    (out/'storyboard.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
    if voiced:
        import numpy as np
        import soundfile as sf
        from faster_whisper import WhisperModel
        whisper=WhisperModel(args.whisper_model,device='cpu',compute_type='int8')
        track=np.zeros(round(duration*rate),dtype=np.float32);offset=0
        # Pass 2 - place each measured clip on the master track and align captions to it.
        for index,seconds in enumerate(durations):
            samples=scene_samples.get(index)
            if samples is not None:
                progress('captions',scene=index,totalScenes=len(scenes))
                start=round((offset+lead)*rate);track[start:start+len(samples)]=samples
                speech=out/'public'/f'speech-{index:02d}.wav'
                segments,_=whisper.transcribe(str(speech),language=spec.get('captionLanguage','pt'),word_timestamps=True)
                words=[{'text':w.word.strip(),'startMs':round(w.start*1000),'endMs':round(w.end*1000)} for segment in segments for w in segment.words or [] if w.word.strip()]
                if not words:raise ValueError(f'No speech timestamps for scene {index}')
                words,corrections=restore_script(words,scenes[index].get('narration','').strip());production['corrections'].extend({'scene':index,**c} for c in corrections)
                page=[]
                for w in words:
                    w={**w,'startMs':round(w['startMs']+(offset+lead)*1000),'endMs':round(w['endMs']+(offset+lead)*1000)}
                    page.append(w)
                    if len(page)>=5 or w['text'].endswith(('.', '!', '?',',')):
                        production['pages'].append({'startMs':page[0]['startMs'],'endMs':page[-1]['endMs'],'words':page});page=[]
                if page:production['pages'].append({'startMs':page[0]['startMs'],'endMs':page[-1]['endMs'],'words':page})
            offset+=seconds
        sf.write(out/'public/narration.wav',track,rate)
        del whisper
        import gc;gc.collect()
    if production['music']:
        import numpy as np
        import soundfile as sf
        rate=48000;t=np.arange(round(duration*rate))/rate
        fade=np.minimum(1,np.minimum(t/1.5,np.maximum(0,(duration-t)/1.5)))
        bed=sum(a*np.sin(2*np.pi*f*t) for f,a in [(110,.025),(164.81,.015),(220,.009)])*fade
        cue=0
        for seconds in durations[:-1]:
            cue+=seconds;delta=t-cue;gate=(delta>=0)&(delta<.2)
            bed[gate]+=.07*np.exp(-delta[gate]*25)*np.sin(2*np.pi*(700*delta[gate]-500*delta[gate]**2))
        sf.write(out/'public/bed.wav',bed,rate)
    (out/'production.json').write_text(json.dumps(production,ensure_ascii=False,indent=2)+'\n')
    if args.node_modules:
        if not (out/'node_modules').exists(): (out/'node_modules').symlink_to(args.node_modules.resolve(),target_is_directory=True)
    else:run(['npm','install','--ignore-scripts'],out,out/'out/install.log')
    progress('typescript')
    run(['npm','run','check'],out,out/'out/typescript.log')
    cmd=[out/'node_modules/.bin/remotion','render','src/index.tsx','Video','out/render.mp4','--gl='+args.gl,'--concurrency=1','--log=error']
    if args.browser:cmd+=['--browser-executable='+args.browser]
    progress('render')
    run(cmd,out,out/'out/render.log')
    progress('master-and-verify')
    final=out/'out/final.mp4';render=out/'out/render.mp4';av=ROOT/'library/vendor/ffmpeg/scripts';sfx=out/'public/sfx.wav'
    if production['narration'] or production['music']:
        mixed=render
        if production['narration'] and production['music']:
            # Real sidechain ducking: the music bed drops under the narration automatically.
            mixed=out/'out/mixed.mp4'
            mix=[sys.executable,av/'audio.py',render,'--music',out/'public/bed.wav','--music-volume','-20','--duck','--duck-amount','12','--duck-threshold','-24','--duck-attack','20','--duck-release','350','--music-fade-out','1.5']
            if sfx.is_file():mix+=['--effects',sfx,'--effects-volume','-10']
            run(mix+['-o',mixed],log=out/'out/mix.log')
        elif production['music']:
            # Music only: lay the bed under the silent video.
            mixed=out/'out/mixed.mp4'
            run(['ffmpeg','-v','error','-y','-i',render,'-i',out/'public/bed.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-shortest','-movflags','+faststart',mixed])
        # Two-pass EBU R128 master (-14 LUFS social default) replaces the old single-pass loudnorm.
        run([sys.executable,av/'loudness.py',mixed,'-I','-14','--tp','-1.5','-o',final],log=out/'out/loudness.log')
    else:shutil.copy2(render,final)
    check=[sys.executable,ROOT/'scripts/verify_video.py',final,'--duration',str(duration),'--width',str(spec['width']),'--height',str(spec['height']),'--fps',str(fps)]
    if production['narration'] or production['music']:check+=['--require-audio']
    verified=run(check);(out/'out/verification.json').write_text(verified.stdout)
    run([sys.executable,ROOT/'library/vendor/ffmpeg/scripts/look.py',final,'--tiles','3x2'],log=out/'out/contact-sheet.log')
    result={'ok':True,'video':str(final),'duration':duration,'elapsedSeconds':round(time.monotonic()-started,3),'storyboardSha256':hashlib.sha256(args.storyboard.read_bytes()).hexdigest(),'narration':voiced,'captionPages':len(production['pages']),'correctionsToReview':production['corrections'],'visualReview':'Open final_sheet.png before claiming aesthetic success'}
    progress('complete')
    (out/'out/production-report.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n');print(json.dumps(result,ensure_ascii=False))

if __name__=='__main__':
    try:main()
    except Exception as e:
        print(json.dumps({'ok':False,'error':str(e)},ensure_ascii=False),file=sys.stderr);raise SystemExit(1)
