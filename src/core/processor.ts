import { apply_dithering } from './dithering';
import { apply_effect } from './effects';
import {
  apply_contrast,
  apply_midtones,
  apply_highlights,
  clone_image_data,
  create_image_data,
  get_pixel,
  set_pixel,
} from './utils/image_utils';
import { GifOptimizer } from './utils/gif_optimizer';
import type { DitheringMethod, EffectType, ImageSettings, AnimatedImage } from '@/types';

export interface ProcessingOptions {
  dithering?: {
    method: DitheringMethod;
    palette: string[];
    bayer_size?: 2 | 4 | 8;
    jitter_amount?: number;
    threshold_value?: number;
  };
  effects?: Array<{
    type: EffectType;
    glitch_intensity?: number;
    glitch_block_size?: number;
    posterize_levels?: number;
    mosaic_tile_size?: number;
    chromatic_offset?: number;
  }>;
  settings?: ImageSettings;
}

export const process_image = (
  source: ImageData,
  options: ProcessingOptions
): ImageData => {
  let result = clone_image_data(source);

  if (options.settings) {
    result = apply_image_settings(result, options.settings);
  }

  if (options.effects) {
    for (const effect of options.effects) {
      result = apply_effect(result, effect.type, effect);
    }
  }

  if (options.dithering) {
    result = apply_dithering(
      result,
      options.dithering.method,
      options.dithering.palette,
      options.dithering
    );
  }

  return result;
};

export const process_animated_image = async (
  source: AnimatedImage,
  options: ProcessingOptions & { optimization?: { enabled: boolean; targetFPS?: number; reduceColors?: boolean; maxColors?: number } },
  onProgress?: (progress: number) => void
): Promise<AnimatedImage> => {
  const processed_frames = source.frames.map((frame, index) => {
    // Scale frame if needed
    let frame_data = frame.data;
    if (options.settings?.scale && options.settings.scale !== 1) {
      frame_data = scale_image(frame_data, options.settings.scale);
    }

    // Process the frame
    const processed_data = process_image(frame_data, options);

    // Report progress
    if (onProgress) {
      onProgress((index + 1) / source.frames.length);
    }

    return {
      ...frame,
      data: processed_data,
    };
  });

  let result: AnimatedImage = {
    ...source,
    frames: processed_frames,
    width: processed_frames[0]?.data.width || source.width,
    height: processed_frames[0]?.data.height || source.height,
  };

  // Apply optimization if enabled
  if (options.optimization?.enabled) {
    const optimizer = new GifOptimizer();
    try {
      result = await optimizer.optimize_animated_image(result, {
        targetFPS: options.optimization.targetFPS,
        reduceColors: options.optimization.reduceColors,
        maxColors: options.optimization.maxColors,
        skipDuplicateFrames: true,
      });
    } finally {
      optimizer.dispose();
    }
  }

  return result;
};

const apply_image_settings = (
  source: ImageData,
  settings: ImageSettings
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = get_pixel(data, x, y, width);

      let r = pixel.r;
      let g = pixel.g;
      let b = pixel.b;

      if (settings.contrast !== 0) {
        r = apply_contrast(r, settings.contrast);
        g = apply_contrast(g, settings.contrast);
        b = apply_contrast(b, settings.contrast);
      }

      if (settings.midtones !== 0) {
        r = apply_midtones(r, settings.midtones);
        g = apply_midtones(g, settings.midtones);
        b = apply_midtones(b, settings.midtones);
      }

      if (settings.highlights !== 0) {
        r = apply_highlights(r, settings.highlights);
        g = apply_highlights(g, settings.highlights);
        b = apply_highlights(b, settings.highlights);
      }

      set_pixel(data, x, y, width, r, g, b, pixel.a);
    }
  }

  return result;
};

export const scale_image = (
  source: ImageData,
  scale: number
): ImageData => {
  // If scale is 1, return the original image
  if (scale === 1) return source;

  const new_width = Math.round(source.width * scale);
  const new_height = Math.round(source.height * scale);
  
  // Use canvas for better performance when scaling
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = new_width;
    canvas.height = new_height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Use imageSmoothingEnabled for pixelated look
      ctx.imageSmoothingEnabled = false;
      
      // Create temporary canvas for source image
      const source_canvas = document.createElement('canvas');
      source_canvas.width = source.width;
      source_canvas.height = source.height;
      const source_ctx = source_canvas.getContext('2d');
      
      if (source_ctx) {
        source_ctx.putImageData(source, 0, 0);
        ctx.drawImage(source_canvas, 0, 0, new_width, new_height);
        return ctx.getImageData(0, 0, new_width, new_height);
      }
    }
  }

  // Fallback to manual scaling
  const result = create_image_data(new_width, new_height);
  const inv_scale = 1 / scale;

  for (let y = 0; y < new_height; y++) {
    for (let x = 0; x < new_width; x++) {
      const src_x = Math.min(Math.floor(x * inv_scale), source.width - 1);
      const src_y = Math.min(Math.floor(y * inv_scale), source.height - 1);
      const src_index = (src_y * source.width + src_x) * 4;
      const dst_index = (y * new_width + x) * 4;
      
      result.data[dst_index] = source.data[src_index];
      result.data[dst_index + 1] = source.data[src_index + 1];
      result.data[dst_index + 2] = source.data[src_index + 2];
      result.data[dst_index + 3] = source.data[src_index + 3];
    }
  }

  return result;
};