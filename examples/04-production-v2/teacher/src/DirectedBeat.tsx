import React from 'react';
import {AbsoluteFill,interpolate,Easing,useCurrentFrame,useVideoConfig} from 'remotion';

/** Shared framing/theme without changing footage timing or masks. A short graphic seam. */
export const DirectedBeat:React.FC<{children:React.ReactNode;accent:string;first?:boolean}>=({children,accent,first=false})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const exit=interpolate(frame,[0,Math.max(1,Math.round(fps*.22))],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 return <AbsoluteFill>{children}{!first&&exit>0&&<AbsoluteFill style={{background:accent,clipPath:`inset(0 0 0 ${100*(1-exit)}%)`}}/>}</AbsoluteFill>;
};
