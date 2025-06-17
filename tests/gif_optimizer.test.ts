import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GifOptimizer } from '@core/utils/gif_optimizer';
import type { AnimatedImage, GifFrame } from '@/types';

describe('GifOptimizer', () => {
  let optimizer: GifOptimizer;

  beforeEach(() => {
    optimizer = new GifOptimizer(2);
  });

  afterEach(() => {
    optimizer.dispose();
  });

  const create_test_frame = (color: number, delay: number = 100): GifFrame => {
    const data = new ImageData(10, 10);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = color;
      data.data[i + 1] = color;
      data.data[i + 2] = color;
      data.data[i + 3] = 255;
    }
    return { data, delay, disposal: 0 };
  };

  const create_test_animated = (frames: GifFrame[]): AnimatedImage => ({
    frames,
    width: 10,
    height: 10,
    loop: 0,
  });

  describe('remove_duplicate_frames', () => {
    it('should remove consecutive duplicate frames', async () => {
      const frames = [
        create_test_frame(100, 50),
        create_test_frame(100, 50), // duplicate
        create_test_frame(200, 50),
        create_test_frame(200, 50), // duplicate
        create_test_frame(100, 50),
      ];

      const animated = create_test_animated(frames);
      const optimized = await optimizer.optimize_animated_image(animated, {
        skipDuplicateFrames: true,
        reduceColors: false,
      });

      expect(optimized.frames).toHaveLength(3);
      expect(optimized.frames[0].delay).toBe(100); // 50 + 50
      expect(optimized.frames[1].delay).toBe(100); // 50 + 50
      expect(optimized.frames[2].delay).toBe(50);
    });
  });

  describe('reduce_frame_rate', () => {
    it('should reduce frame rate to target FPS', async () => {
      const frames = [
        create_test_frame(100, 16), // ~60fps
        create_test_frame(150, 16),
        create_test_frame(200, 16),
        create_test_frame(250, 16),
      ];

      const animated = create_test_animated(frames);
      const optimized = await optimizer.optimize_animated_image(animated, {
        targetFPS: 30,
        skipDuplicateFrames: false,
        reduceColors: false,
      });

      // At 30fps, min delay is 33.33ms
      expect(optimized.frames.length).toBeLessThan(frames.length);
      optimized.frames.forEach(frame => {
        expect(frame.delay).toBeGreaterThanOrEqual(33);
      });
    });
  });

  describe('color_quantization', () => {
    it('should reduce colors when enabled', async () => {
      const frames = [
        create_test_frame(123),
        create_test_frame(234),
      ];

      const animated = create_test_animated(frames);
      const optimized = await optimizer.optimize_animated_image(animated, {
        reduceColors: true,
        maxColors: 16,
        skipDuplicateFrames: false,
      });

      // Check that colors were quantized
      const frame1_color = optimized.frames[0].data.data[0];
      const frame2_color = optimized.frames[1].data.data[0];
      
      // Colors should be quantized to fewer levels
      expect(frame1_color % 8).toBe(0);
      expect(frame2_color % 8).toBe(0);
    });
  });
});