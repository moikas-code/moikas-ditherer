import {
  clone_image_data,
  get_pixel,
  set_pixel,
  find_closest_palette_color,
} from '../utils/image_utils';

export const jitter_dither = (
  source: ImageData,
  palette: string[],
  amount: number = 0.5
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;
  const jitter_strength = amount * 64;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const old_pixel = get_pixel(data, x, y, width);
      
      const random_factor = (Math.random() - 0.5) * jitter_strength;
      
      const dithered_r = old_pixel.r + random_factor;
      const dithered_g = old_pixel.g + random_factor;
      const dithered_b = old_pixel.b + random_factor;

      const new_pixel = find_closest_palette_color(dithered_r, dithered_g, dithered_b, palette);
      set_pixel(data, x, y, width, new_pixel.r, new_pixel.g, new_pixel.b, old_pixel.a);
    }
  }

  return result;
};