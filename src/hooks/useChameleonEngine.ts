import { useEffect, useRef } from 'react';
import { useCinemaVoidStore } from '../stores/useCinemaVoidStore';

/**
 * Hook to extract dominant color from a video element at regular intervals.
 * Part of the "Chameleon Engine" logic.
 */
export const useChameleonEngine = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const setAccentColor = useCinemaVoidStore((state) => state.setAccentColor);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 10; // Tiny resolution is enough for average color
      canvasRef.current.height = 10;
      contextRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
    }

    const extractColor = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
      if (!contextRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const ctx = contextRef.current;

      try {
        // Draw small version of video frame
        ctx.drawImage(video, 0, 0, 10, 10);
        const imageData = ctx.getImageData(0, 0, 10, 10).data;

        let r = 0, g = 0, b = 0;
        const count = imageData.length / 4;

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        setAccentColor(hex);
      } catch (err) {
        // cross-origin security might block drawImage if crossOrigin isn't set
        console.warn('[ChameleonEngine] Failed to extract color:', err);
      }
    };

    const interval = setInterval(extractColor, 1000 / 30); // 30Hz extraction

    return () => clearInterval(interval);
  }, [videoRef, setAccentColor]);
};
