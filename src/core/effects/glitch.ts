import { clone_image_data, get_pixel_index } from '../utils/image_utils';

export const glitch_effect = (
  source: ImageData,
  intensity: number = 0.5,
  block_size: number = 16
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;
  const glitch_probability = intensity;

  for (let y = 0; y < height; y += block_size) {
    for (let x = 0; x < width; x += block_size) {
      if (Math.random() < glitch_probability) {
        apply_glitch_block(data, x, y, width, height, block_size);
      }
    }
  }

  apply_color_shift(data, width, height, intensity);
  apply_scan_lines(data, width, height, intensity);

  return result;
};

const apply_glitch_block = (
  data: Uint8ClampedArray,
  start_x: number,
  start_y: number,
  width: number,
  height: number,
  block_size: number
) => {
  const glitch_type = Math.floor(Math.random() * 4);
  const end_x = Math.min(start_x + block_size, width);
  const end_y = Math.min(start_y + block_size, height);

  switch (glitch_type) {
    case 0: {
      const shift_amount = Math.floor(Math.random() * block_size * 2) - block_size;
      for (let y = start_y; y < end_y; y++) {
        for (let x = start_x; x < end_x; x++) {
          const source_x = Math.max(0, Math.min(width - 1, x + shift_amount));
          const source_idx = get_pixel_index(source_x, y, width);
          const target_idx = get_pixel_index(x, y, width);
          
          data[target_idx] = data[source_idx] ?? 0;
          data[target_idx + 1] = data[source_idx + 1] ?? 0;
          data[target_idx + 2] = data[source_idx + 2] ?? 0;
        }
      }
      break;
    }
    case 1: {
      const color_shift = Math.floor(Math.random() * 3);
      for (let y = start_y; y < end_y; y++) {
        for (let x = start_x; x < end_x; x++) {
          const idx = get_pixel_index(x, y, width);
          const temp = data[idx + color_shift] ?? 0;
          data[idx + color_shift] = data[idx + ((color_shift + 1) % 3)] ?? 0;
          data[idx + ((color_shift + 1) % 3)] = temp;
        }
      }
      break;
    }
    case 2: {
      const invert = Math.random() > 0.5;
      for (let y = start_y; y < end_y; y++) {
        for (let x = start_x; x < end_x; x++) {
          const idx = get_pixel_index(x, y, width);
          if (invert) {
            data[idx] = 255 - (data[idx] ?? 0);
            data[idx + 1] = 255 - (data[idx + 1] ?? 0);
            data[idx + 2] = 255 - (data[idx + 2] ?? 0);
          } else {
            const avg = ((data[idx] ?? 0) + (data[idx + 1] ?? 0) + (data[idx + 2] ?? 0)) / 3;
            data[idx] = data[idx + 1] = data[idx + 2] = avg;
          }
        }
      }
      break;
    }
    case 3: {
      const noise_intensity = Math.random() * 100;
      for (let y = start_y; y < end_y; y++) {
        for (let x = start_x; x < end_x; x++) {
          const idx = get_pixel_index(x, y, width);
          const noise = (Math.random() - 0.5) * noise_intensity;
          data[idx] = Math.max(0, Math.min(255, (data[idx] ?? 0) + noise));
          data[idx + 1] = Math.max(0, Math.min(255, (data[idx + 1] ?? 0) + noise));
          data[idx + 2] = Math.max(0, Math.min(255, (data[idx + 2] ?? 0) + noise));
        }
      }
      break;
    }
  }
};

const apply_color_shift = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number
) => {
  const shift_amount = Math.floor(intensity * 10);
  
  for (let y = 0; y < height; y++) {
    if (Math.random() < intensity * 0.1) {
      for (let x = 0; x < width; x++) {
        const idx = get_pixel_index(x, y, width);
        const shift_x = Math.max(0, Math.min(width - 1, x + shift_amount));
        const shift_idx = get_pixel_index(shift_x, y, width);
        
        const temp_r = data[idx] ?? 0;
        data[idx] = data[shift_idx] ?? 0;
        data[shift_idx + 2] = temp_r;
      }
    }
  }
};

const apply_scan_lines = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number
) => {
  const line_spacing = Math.max(2, Math.floor((1 - intensity) * 5));
  const darkness = intensity * 0.3;
  
  for (let y = 0; y < height; y++) {
    if (y % line_spacing === 0) {
      for (let x = 0; x < width; x++) {
        const idx = get_pixel_index(x, y, width);
        data[idx] = (data[idx] ?? 0) * (1 - darkness);
        data[idx + 1] = (data[idx + 1] ?? 0) * (1 - darkness);
        data[idx + 2] = (data[idx + 2] ?? 0) * (1 - darkness);
      }
    }
  }
};