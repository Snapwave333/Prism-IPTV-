import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useCinemaVoidStore } from '../../stores/useCinemaVoidStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useCinemaVoidContext } from './CinemaVoidScene';

/**
 * An audio-reactive, neon-based playhead scrubber that floats in the void.
 */
export const NeonScrubber: React.FC = () => {
  const { scene: externalScene } = useCinemaVoidContext();
  const accentColor = useCinemaVoidStore((state) => state.accentColor);
  const { currentTime, duration } = usePlayerStore();
  
  const meshRef = useRef<THREE.Mesh | null>(null);

  const geometry = useMemo(() => new THREE.PlaneGeometry(10, 0.05), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: accentColor,
    transparent: true,
    opacity: 0.6,
  }), [accentColor]);

  // The "Playhead" is a smaller, brighter segment
  const playheadMesh = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: accentColor });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0;
    return mesh;
  }, [accentColor]);

  React.useEffect(() => {
    if (externalScene) {
      const group = new THREE.Group();
      const baseLine = new THREE.Mesh(geometry, material);
      group.add(baseLine);
      group.add(playheadMesh);
      
      group.position.set(0, -2, 0); // Position at the bottom of the "Void"
      externalScene.add(group);
      
      meshRef.current = playheadMesh;

      return () => {
        externalScene.remove(group);
      };
    }
  }, [externalScene, geometry, material, playheadMesh]);

  // Update playhead position based on time
  React.useEffect(() => {
    if (meshRef.current && duration > 0) {
      const progress = currentTime / duration;
      meshRef.current.position.x = (progress - 0.5) * 10;
    }
  }, [currentTime, duration]);

  return null;
};
