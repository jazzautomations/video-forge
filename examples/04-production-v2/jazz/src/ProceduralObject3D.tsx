import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

/** True procedural mesh, lighting and camera. No wall-clock render loop. */
export const ProceduralObject3D: React.FC<{color?:string}> = ({color='#C6F56A'}) => {
  const frame=useCurrentFrame(); const {fps,width,height}=useVideoConfig();
  const t=frame/fps;
  return <ThreeCanvas width={width} height={height} camera={{position:[0,.3,5],fov:40}} style={{background:'#101710'}}>
    <ambientLight intensity={.6}/>
    <directionalLight position={[3,4,5]} intensity={3}/>
    <pointLight position={[-3,-1,2]} intensity={12} color='#FFAA66'/>
    <mesh scale={.78} rotation={[.3+Math.sin(t*.5)*.15,t*.45,.15]}>
      <torusKnotGeometry args={[1,.28,160,24]}/>
      <meshStandardMaterial color={color} metalness={.65} roughness={.25}/>
    </mesh>
  </ThreeCanvas>;
};
