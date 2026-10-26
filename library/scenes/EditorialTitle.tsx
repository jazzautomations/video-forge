import React from 'react';
import {AbsoluteFill,Easing,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';

/** The demo's editorial direction as reusable code: hierarchy, rule, stagger and hold.
 *  Font size is computed to PROVABLY fit the frame width — the model never tunes pixels.
 *  Escape hatches (titleSize/maxTitleSize/fontFamily) exist but are rarely needed. */
export const EditorialTitle:React.FC<{
 title:string;subtitle?:string;eyebrow?:string;background?:string;color?:string;accent?:string;closing?:boolean;
 titleSize?:number;maxTitleSize?:number;fontFamily?:string;
}>=({title,subtitle,eyebrow,background='#101710',color='#F3F1E9',accent='#D7FF64',closing=false,titleSize,maxTitleSize,fontFamily='Arial,sans-serif'})=>{
 const frame=useCurrentFrame();const {width,height,fps}=useVideoConfig();
 const progress=(start:number,seconds:number)=>interpolate(frame,[start*fps,(start+seconds)*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
 const hero=progress(.1,.6),rule=progress(.28,.6),sub=progress(.5,.45);
 const unit=Math.min(width/1920,height/1080);
 // Deterministic fit: usable width after padding × maxWidth, divided by an upper-bound
 // glyph advance for bold Arial (≈0.54·fontSize, letterSpacing is negative so this is safe).
 // size ≤ fit guarantees the single longest line never overflows horizontally.
 const avail=(width-2*120*unit)*0.96;
 const fit=avail/Math.max(1,title.length*0.54);
 const cap=maxTitleSize??174*unit;
 const size=titleSize??Math.min(cap,fit);
 const bg=closing?accent:background,fg=closing?background:color;
 return <AbsoluteFill style={{background:bg,color:fg,fontFamily,justifyContent:'center',padding:`${90*unit}px ${120*unit}px`,gap:28*unit}}>
  <div style={{fontFamily:'monospace',fontSize:24*unit,letterSpacing:5*unit,color:closing?fg:accent,opacity:progress(0,.35)}}>{eyebrow}</div>
  <div style={{overflow:'hidden'}}><div style={{fontSize:size,fontWeight:850,letterSpacing:-size*.045,lineHeight:1.02,maxWidth:'96%',transform:`translateY(${(1-hero)*160*unit}px)`}}>{title}</div></div>
  <div style={{width:'90%',height:4*unit,background:closing?fg:accent,transformOrigin:'left',transform:`scaleX(${rule})`}}/>
  {subtitle&&<div style={{fontSize:35*unit,lineHeight:1.35,maxWidth:'88%',opacity:sub,transform:`translateY(${(1-sub)*18*unit}px)`}}>{subtitle}</div>}
 </AbsoluteFill>;
};
