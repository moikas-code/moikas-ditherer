import {
  clone_image_data,
  get_pixel,
  set_pixel,
  find_closest_palette_color,
  clamp,
} from '../utils/image_utils';

export const sierra_dither = (
  source: ImageData,
  palette: string[]
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const old_pixel = get_pixel(data, x, y, width);
      const new_pixel = find_closest_palette_color(old_pixel.r, old_pixel.g, old_pixel.b, palette);

      set_pixel(data, x, y, width, new_pixel.r, new_pixel.g, new_pixel.b, old_pixel.a);

      const error_r = old_pixel.r - new_pixel.r;
      const error_g = old_pixel.g - new_pixel.g;
      const error_b = old_pixel.b - new_pixel.b;

      distribute_error(data, x + 1, y, width, height, error_r, error_g, error_b, 5 / 32);
      distribute_error(data, x + 2, y, width, height, error_r, error_g, error_b, 3 / 32);
      distribute_error(data, x - 2, y + 1, width, height, error_r, error_g, error_b, 2 / 32);
      distribute_error(data, x - 1, y + 1, width, height, error_r, error_g, error_b, 4 / 32);
      distribute_error(data, x, y + 1, width, height, error_r, error_g, error_b, 5 / 32);
      distribute_error(data, x + 1, y + 1, width, height, error_r, error_g, error_b, 4 / 32);
      distribute_error(data, x + 2, y + 1, width, height, error_r, error_g, error_b, 2 / 32);
      distribute_error(data, x - 1, y + 2, width, height, error_r, error_g, error_b, 2 / 32);
      distribute_error(data, x, y + 2, width, height, error_r, error_g, error_b, 3 / 32);
      distribute_error(data, x + 1, y + 2, width, height, error_r, error_g, error_b, 2 / 32);
    }
  }

  return result;
};

const distribute_error = (
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  error_r: number,
  error_g: number,
  error_b: number,
  factor: number
) => {
  if (x < 0 || x >= width || y < 0 || y >= height) return;

  const pixel = get_pixel(data, x, y, width);
  set_pixel(
    data,
    x,
    y,
    width,
    clamp(pixel.r + error_r * factor),
    clamp(pixel.g + error_g * factor),
    clamp(pixel.b + error_b * factor),
    pixel.a
  );
};