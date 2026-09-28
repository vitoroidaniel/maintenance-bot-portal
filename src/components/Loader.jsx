import React,{Suspense,useEffect,useMemo,useRef,useState}from'react';
import{Canvas,useFrame}from'@react-three/fiber';
import{Environment,useAnimations,useGLTF}from'@react-three/drei';
import*as THREE from'three';
import gsap from'gsap';

const MODEL='/models/raven.glb';
const flightWords=['fly','flight','flying','soar','glide','takeoff','take off','wing'];
function AnimatedRaven({onLoaded}){
 const root=useRef();const gltf=useGLTF(MODEL);const{actions,names}=useAnimations(gltf.animations,root);
 const clip=useMemo(()=>names?.find(n=>flightWords.some(w=>n.toLowerCase().includes(w)))||names?.[0],[names]);
 useEffect(()=>{if(!root.current)return;gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.material){o.material.roughness=Math.max(.5,o.material.roughness??.5)}}});const a=clip&&actions?.[clip];if(a){a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.18).play()}onLoaded?.();return()=>a?.fadeOut(.15)},[actions,clip,gltf,onLoaded]);
 useFrame(({clock})=>{if(!root.current)return;const t=clock.getElapsedTime();const p=THREE.MathUtils.smootherstep(Math.min(t/4.15,1),0,1);root.current.position.set(THREE.MathUtils.lerp(-4.7,.15,p),THREE.MathUtils.lerp(.8,-.02,p)+Math.sin(t*2.25)*.055,THREE.MathUtils.lerp(-7,2.05,p));root.current.rotation.set(.02,THREE.MathUtils.lerp(.46,-.08,p),Math.sin(t*.75)*.035);const s=THREE.MathUtils.lerp(.58,1.65,p);root.current.scale.setScalar(s)});
 return <group ref={root}><primitive object={gltf.scene}/></group>
}
function Stage({onLoaded}){return <Canvas dpr={[1,1.6]} shadows camera={{position:[0,.1,6],fov:34}} gl={{alpha:false,antialias:true,powerPreference:'high-performance'}}><color attach="background" args={['#060505']}/><fog attach="fog" args={['#060505',4,12]}/><ambientLight intensity={.18}/><directionalLight castShadow position={[-4,5,5]} intensity={2.5} color="#e8e7d8"/><pointLight position={[3,1,1]} intensity={22} distance={8} color="#d20d00"/><Suspense fallback={null}><AnimatedRaven onLoaded={onLoaded}/><Environment preset="night"/></Suspense></Canvas>}
export default function Loader(){
 const root=useRef();const[hasModel,setHasModel]=useState(null);const[loaded,setLoaded]=useState(false);
 useEffect(()=>{fetch(MODEL,{method:'HEAD',cache:'no-store'}).then(r=>setHasModel(r.ok)).catch(()=>setHasModel(false))},[]);
 useEffect(()=>{if(hasModel===null)return;const wait=hasModel&&!loaded?1.2:.15;const tl=gsap.timeline({delay:wait});tl.fromTo('.loader-kicker',{opacity:0,y:10},{opacity:1,y:0,duration:.45}).fromTo('.loader-word',{opacity:0,letterSpacing:'.25em'},{opacity:1,letterSpacing:'-.03em',duration:.8,ease:'power3.out'},.1).to('.loader-ui',{opacity:0,duration:.3},3.05).to('.intro-flash',{scaleX:1,duration:.62,ease:'power4.inOut'},3.08).to(root.current,{opacity:0,duration:.32},3.62).set(root.current,{display:'none'});return()=>tl.kill()},[hasModel,loaded]);
 return <div className="loader" ref={root}>{hasModel?<div className="intro-stage"><Stage onLoaded={()=>setLoaded(true)}/></div>:<div className="loader-fallback"/>}<div className="loader-ui"><span className="loader-kicker">REKKA / SOFTWARE — MMXXVI</span><div className="loader-word">RAVEN</div><span className="loader-status">{hasModel===false?'3D RAVEN ASSET REQUIRED / SEE public/models/README.txt':loaded?'FLIGHT SYSTEM / READY':'LOADING FLIGHT SYSTEM /'}</span></div><div className="intro-flash"/></div>
}
