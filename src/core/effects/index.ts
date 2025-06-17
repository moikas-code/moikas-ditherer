import { glitch_effect } from './glitch';
import { posterize_effect } from './posterize';
import { invert_effect } from './invert';
import { mosaic_effect } from './mosaic';
import { chromatic_aberration_effect } from './chromatic';
import type { EffectType } from '@/types';

export const apply_effect = (
  source: ImageData,
  effect: EffectType,
  options?: {
    glitch_intensity?: number;
    glitch_block_size?: number;
    posterize_levels?: number;
    mosaic_tile_size?: number;
    chromatic_offset?: number;
  }
): ImageData => {
  switch (effect) {
    case 'glitch':
      return glitch_effect(source, options?.glitch_intensity, options?.glitch_block_size);
    case 'posterize':
      return posterize_effect(source, options?.posterize_levels);
    case 'invert':
      return invert_effect(source);
    case 'mosaic':
      return mosaic_effect(source, options?.mosaic_tile_size);
    case 'chromatic':
      return chromatic_aberration_effect(source, options?.chromatic_offset);
    default:
      return source;
  }
};