export const create_image_data = (width: number, height: number): ImageData => {
  return new ImageData(width, height);
};

export const clone_image_data = (source: ImageData): ImageData => {
  const cloned = new ImageData(source.width, source.height);
  cloned.data.set(source.data);
  return cloned;
};

export const get_pixel_index = (x: number, y: number, width: number): number => {
  return (y * width + x) * 4;
};

export const get_pixel = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
  const index = get_pixel_index(x, y, width);
  return {
    r: data[index] ?? 0,
    g: data[index + 1] ?? 0,
    b: data[index + 2] ?? 0,
    a: data[index + 3] ?? 255,
  };
};

export const set_pixel = (
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  r: number,
  g: number,
  b: number,
  a: number = 255
) => {
  const index = get_pixel_index(x, y, width);
  data[index] = r;
  data[index + 1] = g;
  data[index + 2] = b;
  data[index + 3] = a;
};

export const rgb_to_grayscale = (r: number, g: number, b: number): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

export const clamp = (value: number, min: number = 0, max: number = 255): number => {
  return Math.max(min, Math.min(max, value));
};

export const find_closest_palette_color = (
  r: number,
  g: number,
  b: number,
  palette: string[]
): { r: number; g: number; b: number } => {
  let min_distance = Infinity;
  let closest_color = { r: 0, g: 0, b: 0 };

  for (const color of palette) {
    const palette_r = parseInt(color.slice(1, 3), 16);
    const palette_g = parseInt(color.slice(3, 5), 16);
    const palette_b = parseInt(color.slice(5, 7), 16);

    const distance = Math.sqrt(
      Math.pow(r - palette_r, 2) +
      Math.pow(g - palette_g, 2) +
      Math.pow(b - palette_b, 2)
    );

    if (distance < min_distance) {
      min_distance = distance;
      closest_color = { r: palette_r, g: palette_g, b: palette_b };
    }
  }

  return closest_color;
};

export const apply_contrast = (value: number, contrast: number): number => {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return clamp(factor * (value - 128) + 128);
};

export const apply_midtones = (value: number, midtones: number): number => {
  const normalized = value / 255;
  const adjusted = Math.pow(normalized, 1 - midtones / 100);
  return clamp(adjusted * 255);
};

export const apply_highlights = (value: number, highlights: number): number => {
  const normalized = value / 255;
  const factor = highlights / 100;
  const adjusted = normalized + (1 - normalized) * factor;
  return clamp(adjusted * 255);
};