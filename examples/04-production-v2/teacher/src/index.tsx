import React from 'react';
import {AbsoluteFill,Composition,Sequence,registerRoot,staticFile,useCurrentFrame,interpolate,Easing,Audio} from 'remotion';
import rawSpec from '../storyboard.json'; const spec: {width:number;height:number;fps:number;background?:string;textColor?:string;accent?:string;scenes:any[];brand?:string}=rawSpec;
import {EditorialTitle} from './EditorialTitle';
import {DirectedBeat} from './DirectedBeat';
import {MotionCaptions} from './MotionCaptions';
import production from '../production.json';
import {CharacterPresenter,defaultCharacterProps} from './CharacterPresenter';
import {ScreenFocus} from './ScreenFocus';
import {ProceduralObject3D} from './ProceduralObject3D';
const fps=spec.fps;
const frames=spec.scenes.map(s=>Math.max(1,Math.round(s.seconds*fps)));
const total=frames.reduce((a,b)=>a+b,0);
const Scene:React.FC<{s:any}>=({s})=>{if(s.kind==='title') return <EditorialTitle title={s.title} subtitle={s.subtitle} eyebrow={s.eyebrow??spec.brand} background={spec.background} color={spec.textColor} accent={spec.accent} closing={s.closing??false}/>;if(s.kind==='character') return <CharacterPresenter {...defaultCharacterProps} backgroundColor={spec.background??'#101710'} bodyColor={spec.accent??'#D7FF64'} accentColor={spec.accent??'#D7FF64'} textColor={spec.textColor??'#F3F1E9'} skinColor='#DFA06A' {...s.props}/>;if(s.kind==='screen') return <ScreenFocus {...s} src={staticFile(s.src)}/>;if(s.kind==='three') return <AbsoluteFill><ProceduralObject3D color={s.color??spec.accent}/>{s.title&&<div style={{position:'absolute',left:'6%',top:'9%',fontFamily:'Arial',fontSize:56,color:spec.textColor??'#F3F1E9',fontWeight:750}}>{s.title}</div>}</AbsoluteFill>;return null;};
const Video:React.FC=()=>{let at=0;return <AbsoluteFill style={{background:spec.background??'#101710'}}>
{spec.scenes.map((s,i)=>{const start=at;at+=frames[i];return <Sequence key={i} from={start} durationInFrames={frames[i]}><DirectedBeat accent={spec.accent??'#D7FF64'} first={i===0}><Scene s={s}/></DirectedBeat></Sequence>;})}
{production.narration&&<Audio src={staticFile('narration.wav')}/>}
{production.music&&<Audio src={staticFile('bed.wav')} volume={(f)=>{const ms=f/fps*1000;return (production.pages as any[]).some(p=>ms>=p.startMs-100&&ms<p.endMs+150)?.22:.5;}}/>}
<MotionCaptions pages={production.pages} accent={spec.accent} fontSize={spec.width*.023}/>
{spec.brand&&<div style={{position:'absolute',right:'3%',top:'3%',fontFamily:'monospace',fontSize:spec.width*.01,color:spec.accent??'#D7FF64'}}>{spec.brand}</div>}
</AbsoluteFill>;};
registerRoot(()=><Composition id="Video" component={Video} durationInFrames={total} fps={fps} width={spec.width} height={spec.height}/>);
