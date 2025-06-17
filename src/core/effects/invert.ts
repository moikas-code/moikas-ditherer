import { clone_image_data, get_pixel, set_pixel } from '../utils/image_utils';

export const invert_effect = (source: ImageData): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = get_pixel(data, x, y, width);
      
      const r = 255 - pixel.r;
      const g = 255 - pixel.g;
      const b = 255 - pixel.b;
      
      set_pixel(data, x, y, width, r, g, b, pixel.a);
    }
  }
  
  return result;
};