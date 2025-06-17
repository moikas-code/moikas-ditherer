import React, { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  disabled = false,
}) => {
  const [is_open, set_is_open] = useState(false);
  const [temp_color, set_temp_color] = useState(color);
  const picker_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    set_temp_color(color);
  }, [color]);

  useEffect(() => {
    const handle_click_outside = (e: MouseEvent) => {
      if (picker_ref.current && !picker_ref.current.contains(e.target as Node)) {
        set_is_open(false);
      }
    };

    if (is_open) {
      document.addEventListener('mousedown', handle_click_outside);
    }

    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
    };
  }, [is_open]);

  const handle_color_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const new_color = e.target.value;
    set_temp_color(new_color);
    onChange(new_color);
  };

  const preset_colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0',
    '#800000', '#008000', '#000080', '#808000', '#800080',
    '#008080', '#FFA500', '#A52A2A', '#8B4513', '#FFB6C1',
  ];

  return (
    <div className="color-picker" ref={picker_ref}>
      <button
        className="color-display"
        style={{ backgroundColor: color }}
        onClick={() => !disabled && set_is_open(!is_open)}
        disabled={disabled}
      >
        <span className="color-value">{color}</span>
      </button>

      {is_open && !disabled && (
        <div className="color-picker-dropdown">
          <input
            type="color"
            value={temp_color}
            onChange={handle_color_change}
            className="color-input"
          />
          
          <div className="preset-colors">
            {preset_colors.map(preset_color => (
              <button
                key={preset_color}
                className="preset-color"
                style={{ backgroundColor: preset_color }}
                onClick={() => {
                  onChange(preset_color);
                  set_is_open(false);
                }}
              />
            ))}
          </div>
          
          <div className="color-input-text">
            <input
              type="text"
              value={temp_color}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(value)) {
                  set_temp_color(value);
                  onChange(value);
                }
              }}
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
};