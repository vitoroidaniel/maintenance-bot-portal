import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function Raven({ progress=0 }) {
  const root=useRef(); const { scene }=useGLTF('/models/raven-web.glb');
  const raven=useMemo(()=>scene.clone(true),[scene]);
  useEffect(()=>{raven.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=new THREE.MeshStandardMaterial({color:'#090a0c',roughness:.7,metalness:.08});}});},[raven]);
  useFrame(({clock})=>{if(!root.current)return; const t=clock.elapsedTime; const p=THREE.MathUtils.clamp(progress,0,1); root.current.position.set(THREE.MathUtils.lerp(-6,3.8,p), THREE.MathUtils.lerp(2.2,.6,p)+Math.sin(t*2.4)*.08, THREE.MathUtils.lerp(-8,1.5,p)); root.current.rotation.set(-.12+Math.sin(t*1.8)*.025, -.72+Math.sin(t*.8)*.08, -.16+Math.sin(t*1.3)*.05); const s=THREE.MathUtils.lerp(.65,1.75,p); root.current.scale.setScalar(s);});
  return <group ref={root}><primitive object={raven}/><pointLight color="#ffb36b" intensity={2.5} distance={4} position={[.25,.15,.6]}/><mesh position={[.22,.05,.55]}><sphereGeometry args={[.055,16,16]}/><meshBasicMaterial color="#ff9b52" toneMapped={false}/></mesh></group>
}
useGLTF.preload('/models/raven-web.glb');
