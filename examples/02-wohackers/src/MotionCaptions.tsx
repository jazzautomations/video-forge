import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type TimedWord = {text: string; startMs: number; endMs: number};
export type CaptionPage = {startMs: number; endMs: number; words: TimedWord[]};

/** Paged kinetic subtitles. Supply timings from the final audio, not script estimates. */
export const MotionCaptions: React.FC<{
  pages: CaptionPage[]; accent?: string; fontSize?: number; bottom?: number;
}> = ({pages, accent = '#D7FF64', fontSize = 46, bottom = 56}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame * 1000 / fps;
  const page = pages.find(p => ms >= p.startMs && ms < p.endMs);
  if (!page) return null;
  const enter = interpolate(ms - page.startMs, [0, 140], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  return <div style={{position:'absolute', left:'8%', right:'8%', bottom, display:'flex', justifyContent:'center', pointerEvents:'none'}}>
    <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'.24em', maxWidth:'95%', background:'#101310ed', padding:'15px 26px', borderRadius:16, fontFamily:'sans-serif', fontWeight:750, fontSize, lineHeight:1.25, opacity:enter, transform:`translateY(${(1-enter)*12}px)`}}>
      {page.words.map((word, i) => {
        const active = ms >= word.startMs && ms < word.endMs;
        const lift = active ? interpolate(ms-word.startMs,[0,110],[.94,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}) : 1;
        return <span key={i} style={{display:'inline-block', color:active?accent:'#F4F4EE', transform:`scale(${lift})`, transformOrigin:'center bottom'}}>{word.text}</span>;
      })}
    </div>
  </div>;
};
