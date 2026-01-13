# Implementation Plan - Project "Synapse"

This plan outlines the transformation of Prism IPTV into an immersive "Zero-UI" spatial experience called **Synapse**.

## Proposed Changes

### Core UI Engine
- [NEW] **CinemaVoidScene**: A unified Three.js context acting as the main stage.
- [NEW] **useChameleonEngine**: Hook for frame-by-frame color extraction.
- [NEW] **useCinemaVoidStore**: Central state for 3D environment and dynamic theme.
- **Aerogel Shaders**: Custom refractive materials for UI panels.

### Component Integration
- [x] **MediaPlayer**: Wrapped in `CinemaVoidScene` for immersive background.
- [x] **VrmMascot**: Shares global Three.js scene via Context API.
- [x] **PlayerControls**: Integrated as floating 3D "Gestural Glyphs" and "Neon Scrubber".

### AI Companion (Lumen)
- [x] **Diegetic Integration**: Avatar reacts to screen light, casts shadows, and is grounded on reflective floors.
- [x] **Visual Feedback**: Spatial Halo (voice-reactive), Thinking Sparks (state-based).
- [x] **Lifelike Logic**: Implemented eye saccades, gaze tracking, and randomized blinking.

## Verification Plan
### Automated Tests
- `npm run test` for core logic integrity.
- Custom WebGL shader validation scripts.

### Manual Verification
- Visual inspection of refractive panels.
- Testing gesture responsiveness and lighting transitions.
