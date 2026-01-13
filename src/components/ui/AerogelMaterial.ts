import * as THREE from 'three';

/**
 * Custom shader material for the "Aerogel" glassmorphism effect.
 * Features: High blur, refraction, and chromatic aberration.
 */
export class AerogelMaterial extends THREE.ShaderMaterial {
  constructor(parameters?: THREE.ShaderMaterialParameters) {
    super({
      ...parameters,
      uniforms: {
        tDiffuse: { value: null },
        uAccentColor: { value: new THREE.Color('#00FFFF') },
        uOpacity: { value: 0.8 },
        uRefractionRatio: { value: 0.985 },
        uChromaticAberration: { value: 0.02 },
        ...parameters?.uniforms,
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uAccentColor;
        uniform float uOpacity;
        uniform float uRefractionRatio;
        uniform float uChromaticAberration;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec3 viewDir = normalize(vViewPosition);
          vec3 refractionDir = refract(-viewDir, vNormal, uRefractionRatio);
          
          // Basic refraction with chromatic aberration
          float r = texture2D(tDiffuse, vUv + refractionDir.xy * uChromaticAberration).r;
          float g = texture2D(tDiffuse, vUv).g;
          float b = texture2D(tDiffuse, vUv - refractionDir.xy * uChromaticAberration).b;
          
          vec3 background = vec3(r, g, b);
          
          // Blend with accent color and frosted glass texture
          vec3 color = mix(background, uAccentColor, 0.2);
          
          // Add soft rim light
          float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
          color += uAccentColor * pow(rim, 3.0) * 0.5;

          gl_FragColor = vec4(color, uOpacity);
        }
      `,
    });
  }
}
