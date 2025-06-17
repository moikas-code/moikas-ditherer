import { z } from 'zod';

export const DitheringMethodSchema = z.enum([
  'floyd-steinberg',
  'ordered',
  'jitter',
  'atkinson',
  'sierra',
  'threshold',
]);

export type DitheringMethod = z.infer<typeof DitheringMethodSchema>;

export const EffectTypeSchema = z.enum([
  'glitch',
  'posterize',
  'invert',
  'mosaic',
  'chromatic',
]);

export type EffectType = z.infer<typeof EffectTypeSchema>;

export const ImageSettingsSchema = z.object({
  contrast: z.number().min(-100).max(100).default(0),
  midtones: z.number().min(-100).max(100).default(0),
  highlights: z.number().min(-100).max(100).default(0),
  scale: z.number().min(0.1).max(10).default(1),
});

export type ImageSettings = z.infer<typeof ImageSettingsSchema>;

export const ColorPaletteSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)),
});

export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

export interface ProcessedImage {
  data: ImageData;
  width: number;
  height: number;
}

export interface GifFrame {
  data: ImageData;
  delay: number;
  disposal?: number;
}

export interface AnimatedImage {
  frames: GifFrame[];
  width: number;
  height: number;
  loop?: number;
}

export type MediaType = 'image' | 'gif' | 'video';

declare global {
  interface Window {
    electronAPI: {
      onFileOpened: (callback: (filePath: string) => void) => void;
      onSaveImage: (callback: () => void) => void;
      showSaveDialog: (options: any) => Promise<any>;
      saveFile: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean }>;
    };
  }
}