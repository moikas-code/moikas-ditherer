import { describe, it, expect } from 'vitest';
import { apply_dithering } from '@core/dithering';
import { create_image_data, set_pixel } from '@core/utils/image_utils';

describe('dithering algorithms', () => {
  const create_test_image = () => {
    const image = create_image_data(4, 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const gray = (x + y) * 32;
        set_pixel(image.data, x, y, 4, gray, gray, gray, 255);
      }
    }
    return image;
  };

  const test_palette = ['#000000', '#FFFFFF'];

  it('should apply floyd-steinberg dithering', () => {
    const source = create_test_image();
    const result = apply_dithering(source, 'floyd-steinberg', test_palette);
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
    
    let has_black = false;
    let has_white = false;
    
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] === 0) has_black = true;
      if (result.data[i] === 255) has_white = true;
    }
    
    expect(has_black).toBe(true);
    expect(has_white).toBe(true);
  });

  it('should apply ordered dithering', () => {
    const source = create_test_image();
    const result = apply_dithering(source, 'ordered', test_palette, { bayer_size: 4 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
  });

  it('should apply jitter dithering', () => {
    const source = create_test_image();
    const result = apply_dithering(source, 'jitter', test_palette, { jitter_amount: 0.5 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
  });

  it('should apply atkinson dithering', () => {
    const source = create_test_image();
    const result = apply_dithering(source, 'atkinson', test_palette);
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
  });

  it('should apply sierra dithering', () => {
    const source = create_test_image();
    const result = apply_dithering(source, 'sierra', test_palette);
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
  });

  it('should apply threshold dithering', () => {
    const source = create_test_image();
    const result = apply_dithering(source, 'threshold', test_palette, { threshold_value: 128 });
    
    expect(result.width).toBe(source.width);
    expect(result.height).toBe(source.height);
  });
});