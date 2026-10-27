import React from 'react';
import {AbsoluteFill,interpolate,Easing,useCurrentFrame,useVideoConfig} from 'remotion';

/** Shared framing/theme without changing footage timing or masks. A short graphic seam.
 *  `style` picks the seam shape so successive videos do not all cut the same way:
 *   - 'wipe'  (default): accent panel retracts left→right (original behaviour)
 *   - 'push'  : accent panel slides off to the left
 *   - 'fade'  : incoming scene eases up from the theme background (quiet, no color flash)
 *   - 'iris'  : accent panel contracts from a centered box
 *   - 'none'  : hard cut, no seam
 *  Duration is a fraction of a second so it never disturbs narration or footage timing. */
type BeatStyle='wipe'|'push'|'fade'|'iris'|'none';
export const DirectedBeat:React.FC<{children:React.ReactNode;accent:string;bg?:string;first?:boolean;style?:BeatStyle;seconds?:number}>=({children,accent,bg='#101710',first=false,style='wipe',seconds=.22})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const exit=interpolate(frame,[0,Math.max(1,Math.round(fps*seconds))],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const seam=()=>{
  if(first||style==='none'||exit<=0)return null;
  const p=1-exit; // 0 at scene start → 1 when seam is gone
  // 'fade' is the quiet one: ease the incoming scene up from the theme BACKGROUND, never
  // a full-screen accent flash (that reads as a strobe on bright accents).
  if(style==='fade')return <AbsoluteFill style={{background:bg,opacity:exit}}/>;
  // The graphic seams are an intentional accent sweep — a short colored shape in motion.
  if(style==='push')return <AbsoluteFill style={{background:accent,transform:`translateX(${-100*p}%)`}}/>;
  if(style==='iris')return <AbsoluteFill style={{background:accent,clipPath:`inset(${50*p}% ${50*p}% ${50*p}% ${50*p}%)`}}/>;
  return <AbsoluteFill style={{background:accent,clipPath:`inset(0 0 0 ${100*p}%)`}}/>; // wipe
 };
 return <AbsoluteFill>{children}{seam()}</AbsoluteFill>;
};
