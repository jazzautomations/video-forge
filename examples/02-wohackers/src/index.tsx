import React from 'react';
import {AbsoluteFill, Composition, OffthreadVideo, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {ScreenFocus} from './ScreenFocus';
import {MotionCaptions} from './MotionCaptions';
import {ProceduralObject3D} from './ProceduralObject3D';
import {WaveHello,defaultWaveHelloProps} from './wave-hello/WaveHello';
import captions from './captions.json';
import timing from './timing.json';

const Cta:React.FC=()=>{
 const frame=useCurrentFrame();const enter=interpolate(frame,[0,20],[0,1],{extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'#D7FF64',color:'#101710',fontFamily:'Arial,sans-serif',padding:115,justifyContent:'center',gap:30}}>
  <div style={{fontSize:25,letterSpacing:6,fontFamily:'monospace'}}>VIDEO FORGE / OPEN SOURCE</div>
  <div style={{fontSize:145,lineHeight:1,fontWeight:900,letterSpacing:-8,opacity:enter,transform:`translateY(${(1-enter)*45}px)`}}>Código que<br/>vira vídeo.</div>
  <div style={{fontSize:35}}>Pesquisa. Reuso. Direção. Render de verdade.</div>
 </AbsoluteFill>;
};
const Forge:React.FC=()=> <AbsoluteFill style={{background:'#101710'}}>
 <Sequence durationInFrames={120}><OffthreadVideo src={staticFile('intro.mp4')} muted/></Sequence>
 <Sequence from={120} durationInFrames={150}>
  <ScreenFocus src={staticFile('screen.mp4')} sourceWidth={1920} sourceHeight={1080}
    keys={[{frame:0,cx:960,cy:540,zoom:1},{frame:35,cx:960,cy:540,zoom:1},{frame:70,cx:1280,cy:690,zoom:1.5},{frame:115,cx:1280,cy:690,zoom:1.5},{frame:149,cx:960,cy:540,zoom:1}]}
    masks={[{x:1550,y:32,width:300,height:60,from:0,to:150}]} cursor={[{frame:0,x:1600,y:930},{frame:35,x:1313,y:747},{frame:57,x:1313,y:747,click:true},{frame:145,x:1420,y:900}]}/>
  <div style={{position:'absolute',left:70,top:55,background:'#101710',color:'#D7FF64',fontFamily:'monospace',fontSize:22,padding:'15px 24px'}}>CAPTURA REAL + CÂMERA + MÁSCARA</div>
 </Sequence>
 <Sequence from={270} durationInFrames={90}><WaveHello {...defaultWaveHelloProps} backgroundColor="#F3F1E9" bodyColor="#829F35" accentColor="#263A21" skinColor="#DFA06A" textColor="#172017" title="Dê vida." subtitle="Personagens também são código."/></Sequence>
 <Sequence from={360} durationInFrames={120}><ProceduralObject3D/><div style={{position:'absolute',left:100,top:90,color:'#F3F1E9',fontFamily:'Arial',fontSize:57,fontWeight:750}}>Geometria. Luz. Câmera.</div></Sequence>
 <Sequence from={480}><Cta/></Sequence>
 <MotionCaptions pages={captions.pages} fontSize={42}/>
 <div style={{position:'absolute',right:50,top:30,color:'#82945d',fontFamily:'monospace',fontSize:16}}>VIDEO FORGE / WO HACKERS</div>
</AbsoluteFill>;
registerRoot(()=> <Composition id="Forge" component={Forge} width={1920} height={1080} fps={30} durationInFrames={timing.frames}/>);
