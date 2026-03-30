import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Floating 3D Objects
function FloatingObject({ position, geometry, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time * speed * 0.3) * 0.2;
    meshRef.current.rotation.y = Math.cos(time * speed * 0.2) * 0.2;
    meshRef.current.position.y = position[1] + Math.sin(time * speed * 0.5) * 0.3;
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} castShadow>
        {geometry === 'box' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
        {geometry === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {geometry === 'torus' && <torusGeometry args={[0.4, 0.15, 16, 32]} />}
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

// Interactive Camera
function InteractiveCamera() {
  const cameraRef = useRef();
  
  useFrame((state) => {
    if (typeof window !== 'undefined') {
      const mouseX = (state.mouse.x * 0.5);
      const mouseY = (state.mouse.y * 0.5);
      
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouseX, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouseY, 0.05);
    }
  });
  
  return null;
}

// Main 3D Scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      {/* Floating Objects - Auction Items Theme */}
      <FloatingObject position={[-3, 1, -2]} geometry="box" color="#3b82f6" speed={1} />
      <FloatingObject position={[3, -1, -3]} geometry="sphere" color="#8b5cf6" speed={1.2} />
      <FloatingObject position={[0, 2, -4]} geometry="torus" color="#f59e0b" speed={0.8} />
      <FloatingObject position={[-2, -2, -2]} geometry="sphere" color="#10b981" speed={1.5} />
      <FloatingObject position={[2.5, 1.5, -3]} geometry="box" color="#ef4444" speed={0.9} />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      
      <InteractiveCamera />
    </>
  );
}

// Wrapper Component
export default function Hero3DBackground({ children }) {
  return (
    <div className="relative">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <Scene />
        </Canvas>
      </div>
      
      {/* Original Content - Fully Preserved */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
