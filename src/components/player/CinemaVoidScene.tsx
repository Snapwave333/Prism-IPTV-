import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCinemaVoidStore } from '../../stores/useCinemaVoidStore';
import { useChameleonEngine } from '../../hooks/useChameleonEngine';

export interface CinemaVoidContextType {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
}

const CinemaVoidContext = createContext<CinemaVoidContextType>({ scene: null, camera: null });

export const useCinemaVoidContext = () => useContext(CinemaVoidContext);

interface CinemaVoidSceneProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  children?: React.ReactNode;
}

/**
 * The core 3D environment for Project Synapse.
 * Unifies the Video Player, AI Companion, and UI in a single WebGL context.
 */
export const CinemaVoidScene: React.FC<CinemaVoidSceneProps> = ({ videoRef, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<CinemaVoidContextType>({ scene: null, camera: null });
  
  const accentColor = useCinemaVoidStore((state) => state.accentColor);
  const environmentIntensity = useCinemaVoidStore((state) => state.environmentIntensity);

  // Initialize Chameleon Engine for color extraction
  useChameleonEngine(videoRef as React.RefObject<HTMLVideoElement>);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting - Dynamic based on Accent Color
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(accentColor, 1.5, 20);
    pointLight.position.set(2, 2, 5);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.set(1024, 1024);
    scene.add(pointLight);

    const rimLight = new THREE.SpotLight(0xffffff, 2);
    rimLight.position.set(-2, 2, -1);
    rimLight.target.position.set(0, 0.8, 0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // 5. Plane & Floor
    // 5. Plane & Floor
    if (videoRef.current) {
        const videoTexture = new THREE.VideoTexture(videoRef.current);
        const videoMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(16, 9),
          new THREE.MeshBasicMaterial({ map: videoTexture })
        );
        videoMesh.scale.set(0.3, 0.3, 0.3);
        videoMesh.position.z = -5;
        scene.add(videoMesh);
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ 
        color: 0x050505, 
        roughness: 0.2, 
        metalness: 0.8 
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Defer context update to avoid "setState synchronously within value" warning
    setTimeout(() => {
      setContext({ scene, camera });
    }, 0);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Update reactive lights
      pointLight.color.set(accentColor);
      pointLight.intensity = environmentIntensity * 2;
      rimLight.color.set(accentColor);
      rimLight.intensity = environmentIntensity * 4;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [videoRef, accentColor, environmentIntensity]);

  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <CinemaVoidContext.Provider value={context}>
        {children}
      </CinemaVoidContext.Provider>
    </div>
  );
};
