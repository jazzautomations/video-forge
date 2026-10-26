import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig} from 'remotion';

export type CameraKey = {frame:number; cx:number; cy:number; zoom:number};
export type SourceMask = {x:number;y:number;width:number;height:number;from:number;to:number};
export type CursorKey = {frame:number;x:number;y:number;click?:boolean};

/** Source-space camera and opaque masks stay aligned through zoom/pan. */
export const ScreenFocus: React.FC<{
  src:string; sourceWidth:number; sourceHeight:number; keys:CameraKey[];
  masks?:SourceMask[]; muted?:boolean; cursor?:CursorKey[];
}> = ({src, sourceWidth, sourceHeight, keys, masks=[], muted=true, cursor=[]}) => {
  const frame=useCurrentFrame(); const {width,height}=useVideoConfig();
  if (!keys.length) throw new Error('ScreenFocus needs at least one camera key');
  if (keys.some((k,i)=>k.zoom<=0 || (i>0 && k.frame<=keys[i-1].frame))) throw new Error('Camera keys must have positive zoom and strictly increasing frames');
  const a=[...keys].reverse().find(k=>k.frame<=frame)??keys[0];
  const b=keys.find(k=>k.frame>a.frame)??a;
  const progress=a===b?0:interpolate(frame,[a.frame,b.frame],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
  const mix=(x:number,y:number)=>x+(y-x)*progress;
  const cx=mix(a.cx,b.cx),cy=mix(a.cy,b.cy),zoom=mix(a.zoom,b.zoom);
  const ca=[...cursor].reverse().find(k=>k.frame<=frame)??cursor[0];
  const cb=ca?(cursor.find(k=>k.frame>ca.frame)??ca):undefined;
  const ct=ca&&cb&&ca!==cb?interpolate(frame,[ca.frame,cb.frame],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)}):0;
  const click=cursor.find(k=>k.click&&frame>=k.frame&&frame<k.frame+16);
  return <AbsoluteFill style={{backgroundColor:'#131713',overflow:'hidden'}}>
    <div style={{position:'absolute',width:sourceWidth,height:sourceHeight,transformOrigin:'0 0',transform:`translate(${width/2-cx*zoom}px,${height/2-cy*zoom}px) scale(${zoom})`}}>
      <OffthreadVideo src={src} muted={muted} style={{width:sourceWidth,height:sourceHeight,display:'block'}}/>
      {masks.filter(m=>frame>=m.from&&frame<m.to).map((m,i)=><div key={i} style={{position:'absolute',left:m.x,top:m.y,width:m.width,height:m.height,background:'#141414'}}/>)}
      {click&&<div style={{position:'absolute',left:click.x-28,top:click.y-28,width:56,height:56,border:'4px solid #D7FF64',borderRadius:'50%',transform:`scale(${1+(frame-click.frame)/12})`,opacity:1-(frame-click.frame)/16}}/>}
      {ca&&cb&&<svg width="42" height="54" viewBox="0 0 28 36" style={{position:'absolute',left:ca.x+(cb.x-ca.x)*ct,top:ca.y+(cb.y-ca.y)*ct,filter:'drop-shadow(0 4px 5px #0005)'}}><path d="M2 2 L2 29 L9 23 L14 34 L20 31 L15 21 L25 20 Z" fill="white" stroke="#172017" strokeWidth="2"/></svg>}
    </div>
  </AbsoluteFill>;
};
