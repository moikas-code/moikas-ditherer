import { clone_image_data, get_pixel, set_pixel } from '../utils/image_utils';

export const posterize_effect = (
  source: ImageData,
  levels: number = 4
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;
  
  const level_multiplier = 255 / (levels - 1);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = get_pixel(data, x, y, width);
      
      const r = Math.round(pixel.r / level_multiplier) * level_multiplier;
      const g = Math.round(pixel.g / level_multiplier) * level_multiplier;
      const b = Math.round(pixel.b / level_multiplier) * level_multiplier;
      
      set_pixel(data, x, y, width, r, g, b, pixel.a);
    }
  }
  
  return result;
};