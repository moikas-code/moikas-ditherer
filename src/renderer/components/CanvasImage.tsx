import React, { useRef, useEffect, memo } from 'react';

interface CanvasImageProps {
  imageData: ImageData;
  transform?: string;
  className?: string;
}

export const CanvasImage = memo<CanvasImageProps>(({ imageData, transform, className }) => {
  const canvas_ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
  }, [imageData]);

  return (
    <canvas
      ref={canvas_ref}
      className={className}
      style={{ transform }}
    />
  );
});