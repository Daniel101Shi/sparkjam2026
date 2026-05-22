"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  OrbitControls,
  Bounds,
  Center,
} from "@react-three/drei";
import PhoneModel from "./PhoneModel";

interface PhoneSceneProps {
  rotationY: number;
  /** Enable drag-to-rotate on mobile */
  interactive?: boolean;
}

function LoadingFallback() {
  return (
    <mesh rotation={[0, 0, 0]}>
      <boxGeometry args={[0.5, 1, 0.05]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

export default function PhoneScene({
  rotationY,
  interactive = false,
}: PhoneSceneProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 0.35],
          fov: 45,
          near: 0.001,
          far: 100,
        }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} />
        <directionalLight position={[-3, 3, -3]} intensity={0.6} />
        <pointLight position={[0, 2, 3]} intensity={0.8} color="#ffffff" />

        {/* Environment for realistic reflections */}
        <Environment preset="city" />

        {/* Subtle ground shadow */}
        <ContactShadows
          position={[0, -0.12, 0]}
          opacity={0.25}
          scale={0.5}
          blur={2.5}
          far={0.5}
        />

        {/* Orbit controls — only active in interactive (mobile) mode */}
        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={(2 * Math.PI) / 3}
          />
        )}

        {/* Phone model — auto-centered and bounded */}
        <Suspense fallback={<LoadingFallback />}>
          <Bounds fit clip observe margin={1.6}>
            <Center>
              <PhoneModel
                rotationY={rotationY}
                enableOrbitOverride={interactive}
              />
            </Center>
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  );
}
