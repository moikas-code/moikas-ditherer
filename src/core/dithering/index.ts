import { floyd_steinberg_dither } from './floyd_steinberg';
import { ordered_dither, type BayerSize } from './ordered';
import { jitter_dither } from './jitter';
import { atkinson_dither } from './atkinson';
import { sierra_dither } from './sierra';
import { threshold_dither } from './threshold';
import type { DitheringMethod } from '@/types';

export { type BayerSize };

export const apply_dithering = (
  source: ImageData,
  method: DitheringMethod,
  palette: string[],
  options?: {
    bayer_size?: BayerSize;
    jitter_amount?: number;
    threshold_value?: number;
  }
): ImageData => {
  switch (method) {
    case 'floyd-steinberg':
      return floyd_steinberg_dither(source, palette);
    case 'ordered':
      return ordered_dither(source, palette, options?.bayer_size);
    case 'jitter':
      return jitter_dither(source, palette, options?.jitter_amount);
    case 'atkinson':
      return atkinson_dither(source, palette);
    case 'sierra':
      return sierra_dither(source, palette);
    case 'threshold':
      return threshold_dither(source, palette, options?.threshold_value);
    default:
      return floyd_steinberg_dither(source, palette);
  }
};