import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCinemaVoidStore } from '../../stores/useCinemaVoidStore';
import { AerogelMaterial } from '../ui/AerogelMaterial';
import { useCinemaVoidContext } from './CinemaVoidScene';

interface GesturalGlyphProps {
  position: [number, number, number];
}

/**
 * A floating 3D control icon using the Aerogel material.
 * Responds to gaze and proximity.
 */
export const GesturalGlyph: React.FC<GesturalGlyphProps> = ({ position }) => {
  const { scene: externalScene } = useCinemaVoidContext();
  const accentColor = useCinemaVoidStore((state) => state.accentColor);
  
  const mesh = useMemo(() => {
    const geometry = new THREE.CircleGeometry(0.2, 32);
    const material = new AerogelMaterial({
      uniforms: {
        uAccentColor: { value: new THREE.Color(accentColor) },
        uOpacity: { value: 0.9 },
      }
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    return mesh;
  }, [accentColor, position]);

  React.useEffect(() => {
    if (externalScene) {
      externalScene.add(mesh);
      return () => {
        externalScene.remove(mesh);
      };
    }
  }, [externalScene, mesh]);

  return null; // Rendered via Three.js scene
};
