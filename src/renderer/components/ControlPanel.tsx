import React from 'react';
import { ColorPicker } from './ColorPicker';
import type { DitheringMethod, EffectType, ImageSettings, ColorPalette } from '@/types';
import './ControlPanel.css';

interface ControlPanelProps {
  ditheringMethod: DitheringMethod;
  onDitheringMethodChange: (method: DitheringMethod) => void;
  activeEffects: EffectType[];
  onEffectsChange: (effects: EffectType[]) => void;
  settings: ImageSettings;
  onSettingsChange: (settings: ImageSettings) => void;
  palette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  onReset: () => void;
  disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  ditheringMethod,
  onDitheringMethodChange,
  activeEffects,
  onEffectsChange,
  settings,
  onSettingsChange,
  palette,
  onPaletteChange,
  onReset,
  disabled,
}) => {
  const toggle_effect = (effect: EffectType) => {
    if (activeEffects.includes(effect)) {
      onEffectsChange(activeEffects.filter(e => e !== effect));
    } else {
      onEffectsChange([...activeEffects, effect]);
    }
  };

  const update_setting = (key: keyof ImageSettings, value: number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const update_palette = (index: number, color: string) => {
    const new_colors = [...palette.colors];
    new_colors[index] = color;
    onPaletteChange({
      ...palette,
      colors: new_colors,
      primary: index === 0 ? color : palette.primary,
      secondary: index === 1 ? color : palette.secondary,
    });
  };

  const add_palette_color = () => {
    onPaletteChange({
      ...palette,
      colors: [...palette.colors, '#808080'],
    });
  };

  const remove_palette_color = (index: number) => {
    if (palette.colors.length <= 2) return;
    const new_colors = palette.colors.filter((_, i) => i !== index);
    onPaletteChange({
      ...palette,
      colors: new_colors,
    });
  };

  return (
    <div className="control-panel">
      <div className="control-section">
        <h3>Dithering Method</h3>
        <select
          value={ditheringMethod}
          onChange={(e) => onDitheringMethodChange(e.target.value as DitheringMethod)}
          disabled={disabled}
        >
          <option value="floyd-steinberg">Floyd-Steinberg</option>
          <option value="ordered">Ordered (Bayer)</option>
          <option value="jitter">Jitter</option>
          <option value="atkinson">Atkinson</option>
          <option value="sierra">Sierra</option>
          <option value="threshold">Threshold</option>
        </select>
      </div>

      <div className="control-section">
        <h3>Effects</h3>
        <div className="effect-buttons">
          {(['glitch', 'posterize', 'invert', 'mosaic', 'chromatic'] as EffectType[]).map(effect => (
            <button
              key={effect}
              className={`effect-button ${activeEffects.includes(effect) ? 'active' : 'text-white'}`}
              onClick={() => toggle_effect(effect)}
              disabled={disabled}
            >
              {effect.charAt(0).toUpperCase() + effect.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <h3>Image Settings</h3>
        
        <div className="control-item">
          <label>
            Contrast: {settings.contrast}
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.contrast}
            onChange={(e) => update_setting('contrast', Number(e.target.value))}
            disabled={disabled}
          />
        </div>

        <div className="control-item">
          <label>
            Midtones: {settings.midtones}
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.midtones}
            onChange={(e) => update_setting('midtones', Number(e.target.value))}
            disabled={disabled}
          />
        </div>

        <div className="control-item">
          <label>
            Highlights: {settings.highlights}
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.highlights}
            onChange={(e) => update_setting('highlights', Number(e.target.value))}
            disabled={disabled}
          />
        </div>

        <div className="control-item">
          <label>
            Scale: {settings.scale.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={settings.scale}
            onChange={(e) => update_setting('scale', Number(e.target.value))}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="control-section">
        <h3>Color Palette</h3>
        <div className="palette-colors">
          {palette.colors.map((color, index) => (
            <div key={index} className="palette-color-item">
              <ColorPicker
                color={color}
                onChange={(new_color) => update_palette(index, new_color)}
                disabled={disabled}
              />
              {palette.colors.length > 2 && (
                <button
                  className="remove-color-button"
                  onClick={() => remove_palette_color(index)}
                  disabled={disabled}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            className="add-color-button"
            onClick={add_palette_color}
            disabled={disabled}
          >
            + Add Color
          </button>
        </div>
      </div>

      <div className="control-actions">
        <button
          className="reset-button"
          onClick={onReset}
          disabled={disabled}
        >
          Reset All
        </button>
      </div>
    </div>
  );
};