"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "/iphone-15-model/scene.gltf";
const VIDEO_PATH = "/connecting-friends.mp4";

interface PhoneModelProps {
  rotationY: number;
  /** If true, skip the auto-rotation lerp (user is dragging) */
  enableOrbitOverride?: boolean;
}

export default function PhoneModel({
  rotationY,
  enableOrbitOverride = false,
}: PhoneModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const { gl } = useThree();

  // Store screen material ref
  const screenMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);

  // Find screen mesh
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "BasePhone_Screen_0") {
        screenMaterialRef.current =
          child.material as THREE.MeshStandardMaterial;
      }
    });
  }, [clonedScene]);

  // Create video element and apply as texture to the screen
  useEffect(() => {
    const mat = screenMaterialRef.current;
    if (!mat) return;

    // Create a hidden video element
    const video = document.createElement("video");
    video.src = VIDEO_PATH;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    videoRef.current = video;

    // Start playing
    video.play().catch((err) => {
      if (err.name === "AbortError") return; // Expected when unmounting quickly
      console.warn("[PhoneModel] Video autoplay blocked:", err);
    });

    const handleUserInteraction = () => {
      if (video.paused) {
        video.play().catch((err) => {
          console.warn("[PhoneModel] Play on interaction failed:", err);
        });
      }
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction);

    // Create a VideoTexture from the video element
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.flipY = false; // GLTF convention
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Zoom out more (1.3 means 30% more video area visible, preventing cut-off)
    const zoom = 1.4;

    // By setting the center to 0.5, 0.5, repeat scaling happens from the center of the texture
    videoTexture.center.set(0.5, 0.5);

    // Fix mirroring (flip X) and upside-down (flip Y), and apply zoom
    videoTexture.repeat.set(zoom, -zoom);

    // Prevent the video from repeating in the zoomed-out margins
    videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    videoTexture.wrapT = THREE.ClampToEdgeWrapping;

    videoTextureRef.current = videoTexture;

    // Apply to screen material
    mat.map = videoTexture;
    mat.emissiveMap = videoTexture;
    mat.emissive = new THREE.Color(1, 1, 1);
    mat.emissiveIntensity = 1;
    mat.needsUpdate = true;

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      
      // Prevent Three.js crash on unmount/resize
      mat.map = null;
      mat.emissiveMap = null;
      mat.needsUpdate = true;
      
      videoTexture.dispose();
    };
  }, [clonedScene]); // depend on clonedScene since screenMaterialRef is set from it

  // Smooth rotation + floating bob
  useFrame(() => {
    if (!groupRef.current) return;

    if (!enableOrbitOverride) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotationY,
        0.06
      );
    }

    // Subtle floating bob (reduced bounce)
    const t = performance.now() / 1000;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.015;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
