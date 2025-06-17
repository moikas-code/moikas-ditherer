import {
  clone_image_data,
  get_pixel,
  set_pixel,
  find_closest_palette_color,
} from '../utils/image_utils';

const BAYER_MATRIX_2X2 = [
  [0, 2],
  [3, 1],
];

const BAYER_MATRIX_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_MATRIX_8X8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

export type BayerSize = 2 | 4 | 8;

const get_bayer_matrix = (size: BayerSize): number[][] => {
  switch (size) {
    case 2:
      return BAYER_MATRIX_2X2;
    case 4:
      return BAYER_MATRIX_4X4;
    case 8:
      return BAYER_MATRIX_8X8;
    default:
      return BAYER_MATRIX_4X4;
  }
};

export const ordered_dither = (
  source: ImageData,
  palette: string[],
  matrix_size: BayerSize = 4
): ImageData => {
  const result = clone_image_data(source);
  const { width, height, data } = result;
  const matrix = get_bayer_matrix(matrix_size);
  const matrix_max = matrix_size * matrix_size;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const old_pixel = get_pixel(data, x, y, width);
      const threshold = matrix[y % matrix_size]?.[x % matrix_size] ?? 0;
      const factor = (threshold / matrix_max - 0.5) * 128;

      const dithered_r = old_pixel.r + factor;
      const dithered_g = old_pixel.g + factor;
      const dithered_b = old_pixel.b + factor;

      const new_pixel = find_closest_palette_color(dithered_r, dithered_g, dithered_b, palette);
      set_pixel(data, x, y, width, new_pixel.r, new_pixel.g, new_pixel.b, old_pixel.a);
    }
  }

  return result;
};