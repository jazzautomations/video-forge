import React from 'react';
import {AbsoluteFill,Easing,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';

/** The demo's editorial direction as reusable code: hierarchy, rule, stagger and hold.
 *  Font size is computed to PROVABLY fit the frame width — the model never tunes pixels.
 *  Escape hatches (titleSize/maxTitleSize/fontFamily) exist but are rarely needed. */
export const EditorialTitle:React.FC<{
 title:string;subtitle?:string;eyebrow?:string;background?:string;color?:string;accent?:string;closing?:boolean;
 titleSize?:number;maxTitleSize?:number;fontFamily?:string;displayFont?:string;textFont?:string;advance?:number;
 anchor?:'nw'|'n'|'ne'|'w'|'c'|'e'|'sw'|'s'|'se';rule?:boolean;
}>=({title,subtitle,eyebrow,background='#101710',color='#F3F1E9',accent='#D7FF64',closing=false,titleSize,maxTitleSize,fontFamily,displayFont,textFont,advance=0.54,anchor='w',rule=true})=>{
 const text=textFont??fontFamily??'Arial,sans-serif';const display=displayFont??fontFamily??text;
 // Anchor the whole block to a point on a compass, so not every title is dead-center:
 // 'sw' = bottom-left editorial, 'ne' = top-right, 'c' = centered, 'w' = left (default).
 const A=anchor;
 const vert=A[0]==='n'?'flex-start':A[0]==='s'?'flex-end':'center';
 const horiz=(A==='n'||A==='s'||A==='c')?'center':A.endsWith('e')?'flex-end':'flex-start';
 const align:('left'|'center'|'right')=horiz==='center'?'center':horiz==='flex-end'?'right':'left';
 const ruleOrigin=horiz==='flex-end'?'right':horiz==='center'?'center':'left';
 const frame=useCurrentFrame();const {width,height,fps}=useVideoConfig();
 const progress=(start:number,seconds:number)=>interpolate(frame,[start*fps,(start+seconds)*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
 const hero=progress(.1,.6),ruleP=progress(.28,.6),sub=progress(.5,.45);
 const unit=Math.min(width/1920,height/1080);
 // Deterministic fit: usable width after padding × maxWidth, divided by an upper-bound
 // glyph advance for bold Arial (≈0.54·fontSize, letterSpacing is negative so this is safe).
 // size ≤ fit guarantees the single longest line never overflows horizontally.
 const avail=(width-2*120*unit)*0.96;
 const fit=avail/Math.max(1,title.length*Math.max(0.54,advance));
 const cap=maxTitleSize??174*unit;
 const size=titleSize??Math.min(cap,fit);
 const bg=closing?accent:background,fg=closing?background:color;
 return <AbsoluteFill style={{background:bg,color:fg,fontFamily:text,justifyContent:vert,alignItems:horiz,textAlign:align,padding:`${90*unit}px ${120*unit}px`,gap:28*unit}}>
  {eyebrow?<div style={{fontFamily:'monospace',fontSize:24*unit,letterSpacing:5*unit,color:closing?fg:accent,opacity:progress(0,.35)}}>{eyebrow}</div>:null}
  <div style={{overflow:'hidden'}}><div style={{fontFamily:display,fontSize:size,fontWeight:850,letterSpacing:-size*.045,lineHeight:1.02,maxWidth:'96%',transform:`translateY(${(1-hero)*160*unit}px)`}}>{title}</div></div>
  {rule?<div style={{width:'90%',height:4*unit,background:closing?fg:accent,transformOrigin:ruleOrigin,transform:`scaleX(${ruleP})`}}/>:null}
  {subtitle&&<div style={{fontSize:35*unit,lineHeight:1.35,maxWidth:'88%',opacity:sub,transform:`translateY(${(1-sub)*18*unit}px)`}}>{subtitle}</div>}
 </AbsoluteFill>;
};
