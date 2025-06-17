import { clone_image_data, get_pixel, set_pixel } from '../utils/image_utils';

export const mosaic_effect = (
  source: ImageData,
  tile_size: number = 8
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;
  
  for (let tile_y = 0; tile_y < height; tile_y += tile_size) {
    for (let tile_x = 0; tile_x < width; tile_x += tile_size) {
      let total_r = 0;
      let total_g = 0;
      let total_b = 0;
      let pixel_count = 0;
      
      for (let y = tile_y; y < Math.min(tile_y + tile_size, height); y++) {
        for (let x = tile_x; x < Math.min(tile_x + tile_size, width); x++) {
          const pixel = get_pixel(data, x, y, width);
          total_r += pixel.r;
          total_g += pixel.g;
          total_b += pixel.b;
          pixel_count++;
        }
      }
      
      const avg_r = Math.round(total_r / pixel_count);
      const avg_g = Math.round(total_g / pixel_count);
      const avg_b = Math.round(total_b / pixel_count);
      
      for (let y = tile_y; y < Math.min(tile_y + tile_size, height); y++) {
        for (let x = tile_x; x < Math.min(tile_x + tile_size, width); x++) {
          const pixel = get_pixel(data, x, y, width);
          set_pixel(data, x, y, width, avg_r, avg_g, avg_b, pixel.a);
        }
      }
    }
  }
  
  return result;
};