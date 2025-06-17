import {
  clone_image_data,
  get_pixel,
  set_pixel,
  rgb_to_grayscale,
  find_closest_palette_color,
} from '../utils/image_utils';

export const threshold_dither = (
  source: ImageData,
  palette: string[],
  threshold: number = 128
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const old_pixel = get_pixel(data, x, y, width);
      const grayscale = rgb_to_grayscale(old_pixel.r, old_pixel.g, old_pixel.b);
      
      let new_pixel;
      if (grayscale > threshold) {
        new_pixel = find_closest_palette_color(255, 255, 255, palette);
      } else {
        new_pixel = find_closest_palette_color(0, 0, 0, palette);
      }
      
      set_pixel(data, x, y, width, new_pixel.r, new_pixel.g, new_pixel.b, old_pixel.a);
    }
  }

  return result;
};