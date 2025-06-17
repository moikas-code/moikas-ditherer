import { create_image_data, get_pixel, set_pixel } from '../utils/image_utils';

export const chromatic_aberration_effect = (
  source: ImageData,
  offset: number = 5
): ImageData => {
  const { width, height } = source;
  const result = create_image_data(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const red_x = Math.max(0, Math.min(width - 1, x - offset));
      const blue_x = Math.max(0, Math.min(width - 1, x + offset));
      
      const red_pixel = get_pixel(source.data, red_x, y, width);
      const green_pixel = get_pixel(source.data, x, y, width);
      const blue_pixel = get_pixel(source.data, blue_x, y, width);
      
      set_pixel(
        result.data,
        x,
        y,
        width,
        red_pixel.r,
        green_pixel.g,
        blue_pixel.b,
        green_pixel.a
      );
    }
  }
  
  return result;
};