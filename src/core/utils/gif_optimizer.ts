import type { AnimatedImage, GifFrame } from '@/types';
import type { ProcessingOptions } from '../processor';

interface OptimizationOptions {
  reduceColors?: boolean;
  skipDuplicateFrames?: boolean;
  targetFPS?: number;
  maxColors?: number;
}

export class GifOptimizer {
  private worker_pool: Worker[] = [];
  private current_worker = 0;

  constructor(worker_count: number = navigator.hardwareConcurrency || 4) {
    // We'll use web workers for parallel processing in the future
    this.worker_pool = new Array(worker_count);
  }

  async optimize_animated_image(
    animated: AnimatedImage,
    options: OptimizationOptions = {}
  ): Promise<AnimatedImage> {
    const {
      skipDuplicateFrames = true,
      targetFPS = 30,
      reduceColors = true,
      maxColors = 256,
    } = options;

    let optimized_frames = animated.frames;

    // Skip duplicate frames
    if (skipDuplicateFrames) {
      optimized_frames = this.remove_duplicate_frames(optimized_frames);
    }

    // Reduce frame rate if needed
    if (targetFPS && animated.frames.length > 1) {
      optimized_frames = this.reduce_frame_rate(optimized_frames, targetFPS);
    }

    // Reduce colors if needed
    if (reduceColors && maxColors < 256) {
      optimized_frames = await this.reduce_colors(optimized_frames, maxColors);
    }

    return {
      ...animated,
      frames: optimized_frames,
    };
  }

  private remove_duplicate_frames(frames: GifFrame[]): GifFrame[] {
    if (frames.length <= 1) return frames;

    const result: GifFrame[] = [frames[0]!];
    let last_hash = this.hash_image_data(frames[0]!.data);

    for (let i = 1; i < frames.length; i++) {
      const current_hash = this.hash_image_data(frames[i]!.data);
      
      if (current_hash !== last_hash) {
        result.push(frames[i]!);
        last_hash = current_hash;
      } else {
        // Extend the delay of the previous frame
        result[result.length - 1]!.delay += frames[i]!.delay;
      }
    }

    return result;
  }

  private reduce_frame_rate(frames: GifFrame[], targetFPS: number): GifFrame[] {
    const min_delay = 1000 / targetFPS;
    const result: GifFrame[] = [];
    let accumulated_delay = 0;

    for (const frame of frames) {
      accumulated_delay += frame.delay;
      
      if (accumulated_delay >= min_delay) {
        result.push({
          ...frame,
          delay: accumulated_delay,
        });
        accumulated_delay = 0;
      }
    }

    return result;
  }

  private async reduce_colors(frames: GifFrame[], maxColors: number): Promise<GifFrame[]> {
    // Simple color quantization
    return frames.map(frame => {
      const quantized = this.quantize_colors(frame.data, maxColors);
      return {
        ...frame,
        data: quantized,
      };
    });
  }

  private quantize_colors(imageData: ImageData, maxColors: number): ImageData {
    const result = new ImageData(imageData.width, imageData.height);
    const factor = Math.ceil(256 / Math.pow(maxColors, 1/3));

    for (let i = 0; i < imageData.data.length; i += 4) {
      result.data[i] = Math.round(imageData.data[i]! / factor) * factor;
      result.data[i + 1] = Math.round(imageData.data[i + 1]! / factor) * factor;
      result.data[i + 2] = Math.round(imageData.data[i + 2]! / factor) * factor;
      result.data[i + 3] = imageData.data[i + 3]!;
    }

    return result;
  }

  private hash_image_data(imageData: ImageData): string {
    // Simple hash for duplicate detection
    let hash = 0;
    const step = Math.max(1, Math.floor(imageData.data.length / 1000));
    
    for (let i = 0; i < imageData.data.length; i += step) {
      hash = ((hash << 5) - hash) + imageData.data[i]!;
      hash = hash & hash;
    }
    
    return hash.toString();
  }

  dispose() {
    this.worker_pool.forEach(worker => worker?.terminate());
    this.worker_pool = [];
  }
}

export const process_gif_in_chunks = async (
  frames: GifFrame[],
  chunk_size: number,
  process_chunk: (chunk: GifFrame[]) => Promise<GifFrame[]>,
  on_progress?: (progress: number) => void
): Promise<GifFrame[]> => {
  const result: GifFrame[] = [];
  const total_chunks = Math.ceil(frames.length / chunk_size);
  
  for (let i = 0; i < frames.length; i += chunk_size) {
    const chunk = frames.slice(i, i + chunk_size);
    const processed = await process_chunk(chunk);
    result.push(...processed);
    
    if (on_progress) {
      const progress = Math.min(1, (i + chunk_size) / frames.length);
      on_progress(progress);
    }
  }
  
  return result;
};