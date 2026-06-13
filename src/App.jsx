import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, Sky } from '@react-three/drei'
import { Suspense } from 'react'
import Experience from './Experience'
import './App.css'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
]

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 60 }}
        shadows
      >
        <color attach="background" args={['#000']} />
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
        />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Experience />
          </Physics>
        </Suspense>
      </Canvas>
      <div className="crosshair" />
    </KeyboardControls>
  )
}

export default App
