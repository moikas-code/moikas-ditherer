import { parseGIF, decompressFrames } from 'gifuct-js';
import type { GifFrame, AnimatedImage } from '@/types';

export const parse_gif_file = async (arrayBuffer: ArrayBuffer): Promise<AnimatedImage> => {
  const gif = parseGIF(arrayBuffer);
  const frames = decompressFrames(gif, true);
  
  const gif_frames: GifFrame[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) throw new Error('Could not create canvas context');
  
  let width = 0;
  let height = 0;
  
  for (const frame of frames) {
    if (frame.dims) {
      width = Math.max(width, frame.dims.width + frame.dims.left);
      height = Math.max(height, frame.dims.height + frame.dims.top);
    }
  }
  
  canvas.width = width;
  canvas.height = height;
  
  for (const frame of frames) {
    const imageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );
    
    // Clear canvas based on disposal method
    if (frame.disposalType === 2) {
      ctx.clearRect(0, 0, width, height);
    }
    
    // Draw frame at correct position
    ctx.putImageData(imageData, frame.dims.left, frame.dims.top);
    
    // Get full canvas image data
    const fullImageData = ctx.getImageData(0, 0, width, height);
    
    gif_frames.push({
      data: fullImageData,
      delay: frame.delay * 10, // Convert to milliseconds
      disposal: frame.disposalType,
    });
  }
  
  return {
    frames: gif_frames,
    width,
    height,
    loop: 0, // Default to infinite loop
  };
};

export const create_gif_encoder = async () => {
  const GIF = (await import('gif.js')).default;
  
  return new GIF({
    workers: navigator.hardwareConcurrency || 4,
    quality: 1, // Lower value = higher quality (1-30)
    workerScript: '/gif.worker.js',
    background: '#000',
    transparent: null,
    repeat: 0, // Loop forever
  });
};

export const encode_gif = async (
  frames: GifFrame[],
  width: number,
  height: number
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const gif = await create_gif_encoder();
      
      for (const frame of frames) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.putImageData(frame.data, 0, 0);
          gif.addFrame(canvas, { delay: frame.delay });
        }
      }
      
      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });
      
      gif.on('error', reject);
      
      gif.render();
    } catch (error) {
      reject(error);
    }
  });
};