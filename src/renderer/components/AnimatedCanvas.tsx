import { useRef, useEffect, memo } from 'react';
import type { AnimatedImage } from '@/types';

interface AnimatedCanvasProps {
  animatedImage: AnimatedImage;
  transform?: string;
  className?: string;
  isPlaying?: boolean;
}

export const AnimatedCanvas = memo<AnimatedCanvasProps>(({
  animatedImage,
  transform,
  className,
  isPlaying = true,
}) => {
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const animation_ref = useRef<number>(0);
  const frame_index_ref = useRef<number>(0);
  const last_frame_time_ref = useRef<number>(0);

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas || !isPlaying || animatedImage.frames.length === 0) return;

    canvas.width = animatedImage.width;
    canvas.height = animatedImage.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let is_mounted = true;

    const animate = (timestamp: number) => {
      if (!is_mounted) return;

      const current_frame = animatedImage.frames[frame_index_ref.current];
      if (!current_frame) return;

      // Check if enough time has passed for next frame
      if (timestamp - last_frame_time_ref.current >= current_frame.delay) {
        ctx.putImageData(current_frame.data, 0, 0);
        
        // Move to next frame
        frame_index_ref.current = (frame_index_ref.current + 1) % animatedImage.frames.length;
        last_frame_time_ref.current = timestamp;
      }

      animation_ref.current = requestAnimationFrame(animate);
    };

    // Draw first frame immediately
    const first_frame = animatedImage.frames[0];
    if (first_frame) {
      ctx.putImageData(first_frame.data, 0, 0);
    }

    // Start animation if more than one frame
    if (animatedImage.frames.length > 1) {
      animation_ref.current = requestAnimationFrame(animate);
    }

    return () => {
      is_mounted = false;
      if (animation_ref.current) {
        cancelAnimationFrame(animation_ref.current);
      }
    };
  }, [animatedImage, isPlaying]);

  return (
    <canvas
      ref={canvas_ref}
      className={className}
      style={{ transform }}
    />
  );
});