import { describe, it, expect } from 'vitest';
import {
  create_image_data,
  clone_image_data,
  get_pixel_index,
  get_pixel,
  set_pixel,
  rgb_to_grayscale,
  clamp,
  find_closest_palette_color,
  apply_contrast,
  apply_midtones,
  apply_highlights,
} from '@core/utils/image_utils';

describe('image_utils', () => {
  describe('create_image_data', () => {
    it('should create ImageData with correct dimensions', () => {
      const width = 10;
      const height = 10;
      const image_data = create_image_data(width, height);
      
      expect(image_data.width).toBe(width);
      expect(image_data.height).toBe(height);
      expect(image_data.data.length).toBe(width * height * 4);
    });
  });

  describe('clone_image_data', () => {
    it('should create a deep copy of ImageData', () => {
      const original = create_image_data(5, 5);
      original.data[0] = 255;
      
      const cloned = clone_image_data(original);
      
      expect(cloned.width).toBe(original.width);
      expect(cloned.height).toBe(original.height);
      expect(cloned.data[0]).toBe(255);
      
      cloned.data[0] = 0;
      expect(original.data[0]).toBe(255);
    });
  });

  describe('get_pixel_index', () => {
    it('should calculate correct pixel index', () => {
      const width = 10;
      expect(get_pixel_index(0, 0, width)).toBe(0);
      expect(get_pixel_index(1, 0, width)).toBe(4);
      expect(get_pixel_index(0, 1, width)).toBe(40);
      expect(get_pixel_index(5, 2, width)).toBe(100);
    });
  });

  describe('get_pixel and set_pixel', () => {
    it('should get and set pixel values correctly', () => {
      const image_data = create_image_data(5, 5);
      
      set_pixel(image_data.data, 2, 2, 5, 100, 150, 200, 255);
      const pixel = get_pixel(image_data.data, 2, 2, 5);
      
      expect(pixel.r).toBe(100);
      expect(pixel.g).toBe(150);
      expect(pixel.b).toBe(200);
      expect(pixel.a).toBe(255);
    });
  });

  describe('rgb_to_grayscale', () => {
    it('should convert RGB to grayscale correctly', () => {
      expect(Math.round(rgb_to_grayscale(255, 255, 255))).toBe(255);
      expect(Math.round(rgb_to_grayscale(0, 0, 0))).toBe(0);
      expect(Math.round(rgb_to_grayscale(255, 0, 0))).toBe(76);
      expect(Math.round(rgb_to_grayscale(0, 255, 0))).toBe(150);
      expect(Math.round(rgb_to_grayscale(0, 0, 255))).toBe(29);
    });
  });

  describe('clamp', () => {
    it('should clamp values to range', () => {
      expect(clamp(300)).toBe(255);
      expect(clamp(-50)).toBe(0);
      expect(clamp(128)).toBe(128);
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(150, 0, 100)).toBe(100);
    });
  });

  describe('find_closest_palette_color', () => {
    it('should find closest color in palette', () => {
      const palette = ['#000000', '#FFFFFF', '#FF0000'];
      
      const black = find_closest_palette_color(10, 10, 10, palette);
      expect(black).toEqual({ r: 0, g: 0, b: 0 });
      
      const white = find_closest_palette_color(250, 250, 250, palette);
      expect(white).toEqual({ r: 255, g: 255, b: 255 });
      
      const red = find_closest_palette_color(200, 50, 50, palette);
      expect(red).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('apply_contrast', () => {
    it('should apply contrast adjustment', () => {
      expect(apply_contrast(128, 0)).toBe(128);
      expect(Math.round(apply_contrast(140, 50))).toBeGreaterThan(140);
      expect(Math.round(apply_contrast(140, -50))).toBeLessThan(140);
    });
  });

  describe('apply_midtones', () => {
    it('should apply midtones adjustment', () => {
      expect(apply_midtones(128, 0)).toBe(128);
      expect(apply_midtones(128, 50)).not.toBe(128);
    });
  });

  describe('apply_highlights', () => {
    it('should apply highlights adjustment', () => {
      expect(apply_highlights(200, 0)).toBe(200);
      expect(apply_highlights(200, 50)).toBeGreaterThan(200);
      expect(apply_highlights(200, -50)).toBeLessThan(200);
    });
  });
});