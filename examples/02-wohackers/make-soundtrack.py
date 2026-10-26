#!/usr/bin/env python3
# Deterministic authored audio bed and short action accents. No sampled media.
import math,struct,wave
from pathlib import Path
rate=48000;duration=23.5
cues=[4,9,12,16,19]
with wave.open(str(Path(__file__).parent/'public/bed.wav'),'wb') as out:
 out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
 samples=bytearray()
 for i in range(int(rate*duration)):
  t=i/rate;fade=min(1,t/1.5,max(0,(duration-t)/2))
  bed=sum(math.sin(2*math.pi*f*t)*a for f,a in [(110,.025),(164.81,.015),(220,.009)])
  bed*=fade*(.8+.2*math.sin(2*math.pi*.5*t))
  for hit in cues:
   d=t-hit
   if 0<=d<.25:bed+=.11*math.exp(-d*22)*math.sin(2*math.pi*(700*d-500*d*d))
  samples+=struct.pack('<h',int(max(-1,min(1,bed))*32767))
 out.writeframes(samples)
print('public/bed.wav',duration)
