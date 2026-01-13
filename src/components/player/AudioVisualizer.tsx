import React, { useEffect, useRef } from 'react';
import { audioService } from '../../services/audio';
import styles from './AudioVisualizer.module.css';

interface AudioVisualizerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Shared analyser from AudioService
    analyserRef.current = audioService.getAnalyser();
  }, [videoRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const render = () => {
      // Resize
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;

      analyser.getByteFrequencyData(dataArray);

      // Clear
      ctx.fillStyle = '#0a0a0a'; // Dark background
      ctx.fillRect(0, 0, width, height);

      // Calculate simple average for "beat"
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const beatScale = 1 + (average / 256) * 0.5;

      // Draw Center Glow
      const gradient = ctx.createRadialGradient(cx, cy, 50 * beatScale, cx, cy, 300 * beatScale);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)'); // Purple
      gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.1)'); // Blue
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 300 * beatScale, 0, Math.PI * 2);
      ctx.fill();

      // Draw Circular Bars
      const radius = 100;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(beatScale, beatScale);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * 150;
        const angle = i * (Math.PI * 2 / bufferLength); // Normalize to full circle

        // Symmetry: Mirror half for better loop? 
        // Let's just do full circle for now.
        
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle) * (radius + barHeight);
        const y2 = Math.sin(angle) * (radius + barHeight);

        ctx.strokeStyle = `hsl(${260 + (i / bufferLength) * 60}, 100%, 60%)`; // Purple to Pink
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};
