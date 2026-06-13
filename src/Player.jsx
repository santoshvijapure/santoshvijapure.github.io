import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export default function Player() {
  const rigidBodyRef = useRef()
  const operatorRef = useRef()
  const [, getKeys] = useKeyboardControls()
  const { camera } = useThree()

  // Bobbing state
  const bobbingPhase = useRef(0)

  useFrame((state) => {
    if (!rigidBodyRef.current) return

    const keys = getKeys()
    const velocity = rigidBodyRef.current.linvel()

    // Movement Logic
    frontVector.set(0, 0, Number(keys.backward) - Number(keys.forward))
    sideVector.set(Number(keys.left) - Number(keys.right), 0, 0)

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation)

    rigidBodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })

    const translation = rigidBodyRef.current.translation()
    // Move the camera to eye level
    camera.position.set(translation.x, translation.y + 1.2, translation.z)

    // Operator Weapon bobbing and position update
    if (operatorRef.current) {
      const isMoving = keys.forward || keys.backward || keys.left || keys.right
      let bobOffset = 0

      if (isMoving) {
        bobbingPhase.current += 10 * state.delta
        bobOffset = Math.sin(bobbingPhase.current) * 0.05
      }

      // Match camera position and rotation
      operatorRef.current.position.copy(camera.position)
      operatorRef.current.rotation.copy(camera.rotation)

      // Apply local offsets (right, down + bob, forward)
      operatorRef.current.translateX(0.3)
      operatorRef.current.translateY(-0.3 + bobOffset)
      operatorRef.current.translateZ(-0.5)
    }
  })

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 2, 0]}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider args={[0.75, 0.3]} />
      </RigidBody>

      <PointerLockControls />

      {/* Operator Model */}
      <group ref={operatorRef}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.4]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.05, 0.1]} castShadow>
          <boxGeometry args={[0.08, 0.15, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0, -0.21]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
        </mesh>
      </group>
    </>
  )
}
