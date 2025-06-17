import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { AnimatedPreview } from './components/AnimatedPreview';
import { ControlPanel } from './components/ControlPanel';
import { process_image, scale_image, process_animated_image } from '@core/processor';
import { useDebounce } from './hooks/useDebounce';
import type { DitheringMethod, EffectType, ImageSettings, ColorPalette, AnimatedImage, MediaType } from '@/types';
import './App.css';

const DEFAULT_PALETTE: ColorPalette = {
  primary: '#000000',
  secondary: '#FFFFFF',
  colors: ['#000000', '#FFFFFF'],
};

const DEFAULT_SETTINGS: ImageSettings = {
  contrast: 0,
  midtones: 0,
  highlights: 0,
  scale: 1,
};

export const App: React.FC = () => {
  const [original_image, set_original_image] = useState<ImageData | null>(null);
  const [processed_image, set_processed_image] = useState<ImageData | null>(null);
  const [original_animated, set_original_animated] = useState<AnimatedImage | null>(null);
  const [processed_animated, set_processed_animated] = useState<AnimatedImage | null>(null);
  const [media_type, set_media_type] = useState<MediaType>('image');
  const [dithering_method, set_dithering_method] = useState<DitheringMethod>('floyd-steinberg');
  const [active_effects, set_active_effects] = useState<EffectType[]>([]);
  const [settings, set_settings] = useState<ImageSettings>(DEFAULT_SETTINGS);
  const [palette, set_palette] = useState<ColorPalette>(DEFAULT_PALETTE);
  const [is_processing, set_is_processing] = useState(false);
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const processing_ref = useRef<number>(0);

  // Debounce settings changes for better performance
  const debounced_settings = useDebounce(settings, 150);
  const debounced_palette = useDebounce(palette, 150);

  const handle_image_upload = useCallback((image_data: ImageData) => {
    set_original_image(image_data);
    set_processed_image(null);
    set_original_animated(null);
    set_processed_animated(null);
    set_media_type('image');
  }, []);

  const handle_animated_upload = useCallback((animated: AnimatedImage) => {
    set_original_animated(animated);
    set_processed_animated(null);
    set_original_image(null);
    set_processed_image(null);
    set_media_type('gif');
  }, []);

  const process_current_image = useCallback(() => {
    if (!original_image) return;

    // Cancel any pending processing
    processing_ref.current++;
    const current_processing_id = processing_ref.current;

    set_is_processing(true);
    
    // Use requestIdleCallback for better performance
    const process = () => {
      // Check if this processing was cancelled
      if (current_processing_id !== processing_ref.current) {
        return;
      }

      try {
        let result = original_image;
        
        if (debounced_settings.scale !== 1) {
          result = scale_image(result, debounced_settings.scale);
        }

        result = process_image(result, {
          dithering: {
            method: dithering_method,
            palette: debounced_palette.colors,
          },
          effects: active_effects.map(effect => ({ type: effect })),
          settings: debounced_settings,
        });

        // Check again if this processing was cancelled
        if (current_processing_id === processing_ref.current) {
          set_processed_image(result);
        }
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        if (current_processing_id === processing_ref.current) {
          set_is_processing(false);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(process, { timeout: 1000 });
    } else {
      requestAnimationFrame(process);
    }
  }, [original_image, dithering_method, active_effects, debounced_settings, debounced_palette]);

  const process_current_animated = useCallback(() => {
    if (!original_animated) return;

    // Cancel any pending processing
    processing_ref.current++;
    const current_processing_id = processing_ref.current;

    set_is_processing(true);

    const process = async () => {
      // Check if this processing was cancelled
      if (current_processing_id !== processing_ref.current) {
        return;
      }

      try {
        const result = await process_animated_image(original_animated, {
          dithering: {
            method: dithering_method,
            palette: debounced_palette.colors,
          },
          effects: active_effects.map(effect => ({ type: effect })),
          settings: debounced_settings,
          optimization: {
            enabled: true,
            targetFPS: 30,
            reduceColors: true,
            maxColors: 256,
          },
        });

        // Check again if this processing was cancelled
        if (current_processing_id === processing_ref.current) {
          set_processed_animated(result);
        }
      } catch (error) {
        console.error('Error processing animated image:', error);
      } finally {
        if (current_processing_id === processing_ref.current) {
          set_is_processing(false);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => process(), { timeout: 2000 });
    } else {
      requestAnimationFrame(() => process());
    }
  }, [original_animated, dithering_method, active_effects, debounced_settings, debounced_palette]);

  useEffect(() => {
    if (original_image) {
      process_current_image();
    } else if (original_animated) {
      process_current_animated();
    }
  }, [original_image, original_animated, dithering_method, active_effects, debounced_settings, debounced_palette, process_current_image, process_current_animated]);

  const handle_save = useCallback(async () => {
    if (media_type === 'gif' && processed_animated) {
      // Save as GIF
      const { encode_gif } = await import('@core/utils/gif_utils');
      const blob = await encode_gif(
        processed_animated.frames,
        processed_animated.width,
        processed_animated.height
      );

      if (window.electronAPI) {
        const buffer = await blob.arrayBuffer();
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: 'dithered.gif',
          filters: [
            { name: 'GIF', extensions: ['gif'] },
          ],
        });
        
        if (!result.canceled && result.filePath) {
          await window.electronAPI.saveFile(result.filePath, buffer);
        }
      } else {
        // Fallback for browser environment
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dithered.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else if (processed_image && canvas_ref.current) {
      // Save as static image
      const canvas = canvas_ref.current;
      canvas.width = processed_image.width;
      canvas.height = processed_image.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.putImageData(processed_image, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        if (window.electronAPI) {
          const buffer = await blob.arrayBuffer();
          const result = await window.electronAPI.showSaveDialog({
            defaultPath: 'dithered-image.png',
            filters: [
              { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
            ],
          });
          
          if (!result.canceled && result.filePath) {
            await window.electronAPI.saveFile(result.filePath, buffer);
          }
        } else {
          // Fallback for browser environment
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'dithered-image.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    }
  }, [processed_image, processed_animated, media_type]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onFileOpened(async (file_path: string) => {
        try {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const image_data = ctx.getImageData(0, 0, img.width, img.height);
              handle_image_upload(image_data);
            }
          };
          img.src = `file://${file_path}`;
        } catch (error) {
          console.error('Error loading file:', error);
        }
      });

      window.electronAPI.onSaveImage(() => {
        handle_save();
      });
    }
  }, [handle_image_upload, handle_save]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>MOIKA DITHERER</h1>
        <div className="header-status">
          <span className={`status-indicator ${is_processing ? 'processing' : ''}`}></span>
          <span className="status-text">{is_processing ? 'PROCESSING' : 'FX'}</span>
        </div>
      </div>
      
      <div className="app-content">
        <div className="preview-section">
          {!original_image && !original_animated ? (
            <ImageUploader 
              onImageUpload={handle_image_upload}
              onAnimatedUpload={handle_animated_upload}
            />
          ) : media_type === 'gif' && original_animated ? (
            <>
              <AnimatedPreview
                original={original_animated}
                processed={processed_animated}
                isProcessing={is_processing}
              />
              {!window.electronAPI && processed_animated && (
                <button 
                  className="save-button"
                  onClick={handle_save}
                >
                  Save GIF
                </button>
              )}
            </>
          ) : original_image ? (
            <>
              <ImagePreview
                original={original_image}
                processed={processed_image}
                isProcessing={is_processing}
              />
              {!window.electronAPI && processed_image && (
                <button 
                  className="save-button"
                  onClick={handle_save}
                >
                  Save Image
                </button>
              )}
            </>
          ) : null}
        </div>
        
        <ControlPanel
          ditheringMethod={dithering_method}
          onDitheringMethodChange={set_dithering_method}
          activeEffects={active_effects}
          onEffectsChange={set_active_effects}
          settings={settings}
          onSettingsChange={set_settings}
          palette={palette}
          onPaletteChange={set_palette}
          onReset={() => {
            set_original_image(null);
            set_processed_image(null);
            set_original_animated(null);
            set_processed_animated(null);
            set_media_type('image');
            set_active_effects([]);
            set_settings(DEFAULT_SETTINGS);
            set_palette(DEFAULT_PALETTE);
          }}
          disabled={!original_image && !original_animated}
        />
      </div>
      
      <canvas ref={canvas_ref} style={{ display: 'none' }} />
    </div>
  );
};