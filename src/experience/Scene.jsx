import { Canvas } from '@react-three/fiber';
import { Environment, Fog } from '@react-three/drei';
import Raven from './Raven';
export default function Scene({progress}){return <Canvas camera={{position:[0,1,7],fov:48}} dpr={[1,1.5]} gl={{antialias:true,alpha:true}}><fog attach="fog" args={['#050606',5,18]}/><ambientLight intensity={.28}/><directionalLight position={[-4,6,4]} intensity={1.5} color="#e7dfcf"/><directionalLight position={[5,2,-2]} intensity={2.2} color="#8e1518"/><Raven progress={progress}/></Canvas>}
