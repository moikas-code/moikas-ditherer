import { describe, it, expect } from 'vitest';
import { apply_effect } from '@core/effects';
import { create_image_data, set_pixel, get_pixel } from '@core/utils/image_utils';

describe('effects', () => {
  const create_test_image = () => {
    const image = create_image_data(10, 10);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        set_pixel(image.data, x, y, 10, 100, 150, 200, 255);
      }
    }
    return image;
  };

  it('should apply glitch effect', () => {
    const source = create_test_image();
    const result = apply_effect(source, 'glitch', { glitch_intensity: 0.5 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
    
    let has_difference = false;
    for (let i = 0; i < result.data.length; i++) {
      if (result.data[i] !== source.data[i]) {
        has_difference = true;
        break;
      }
    }
    expect(has_difference).toBe(true);
  });

  it('should apply posterize effect', () => {
    const source = create_test_image();
    const result = apply_effect(source, 'posterize', { posterize_levels: 4 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
    
    const pixel = get_pixel(result.data, 0, 0, 10);
    expect(pixel.r).toBe(85);
    expect(pixel.g).toBe(170);
    expect(pixel.b).toBe(170);
  });

  it('should apply invert effect', () => {
    const source = create_test_image();
    const result = apply_effect(source, 'invert');
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
    
    const pixel = get_pixel(result.data, 0, 0, 10);
    expect(pixel.r).toBe(155);
    expect(pixel.g).toBe(105);
    expect(pixel.b).toBe(55);
  });

  it('should apply mosaic effect', () => {
    const source = create_test_image();
    for (let x = 0; x < 5; x++) {
      set_pixel(source.data, x, 0, 10, 255, 0, 0, 255);
    }
    
    const result = apply_effect(source, 'mosaic', { mosaic_tile_size: 4 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
    
    const pixel1 = get_pixel(result.data, 0, 0, 10);
    const pixel2 = get_pixel(result.data, 3, 0, 10);
    expect(pixel1.r).toBe(pixel2.r);
    expect(pixel1.g).toBe(pixel2.g);
    expect(pixel1.b).toBe(pixel2.b);
  });

  it('should apply chromatic aberration effect', () => {
    const source = create_test_image();
    const result = apply_effect(source, 'chromatic', { chromatic_offset: 2 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
  });
});