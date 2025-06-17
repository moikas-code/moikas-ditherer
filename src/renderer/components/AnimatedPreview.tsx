import React, { useState } from 'react';
import { AnimatedCanvas } from './AnimatedCanvas';
import type { AnimatedImage } from '@/types';
import './ImagePreview.css';

interface AnimatedPreviewProps {
  original: AnimatedImage;
  processed: AnimatedImage | null;
  isProcessing: boolean;
}

export const AnimatedPreview: React.FC<AnimatedPreviewProps> = ({
  original,
  processed,
  isProcessing,
}) => {
  const [view_mode, set_view_mode] = useState<'split' | 'original' | 'processed'>('split');
  const [zoom, set_zoom] = useState(1);
  const [pan, set_pan] = useState({ x: 0, y: 0 });
  const [is_panning, set_is_panning] = useState(false);
  const [last_mouse_pos, set_last_mouse_pos] = useState({ x: 0, y: 0 });
  const [is_playing, set_is_playing] = useState(true);

  const handle_wheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    set_zoom(prev => Math.max(0.1, Math.min(10, prev * delta)));
  };

  const handle_mouse_down = (e: React.MouseEvent) => {
    set_is_panning(true);
    set_last_mouse_pos({ x: e.clientX, y: e.clientY });
  };

  const handle_mouse_move = (e: React.MouseEvent) => {
    if (!is_panning) return;

    const dx = e.clientX - last_mouse_pos.x;
    const dy = e.clientY - last_mouse_pos.y;

    set_pan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    set_last_mouse_pos({ x: e.clientX, y: e.clientY });
  };

  const handle_mouse_up = () => {
    set_is_panning(false);
  };

  const reset_view = () => {
    set_zoom(1);
    set_pan({ x: 0, y: 0 });
  };

  const get_transform = () => {
    return `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  };

  return (
    <div className="image-preview">
      <div className="preview-controls">
        <div className="view-mode-buttons">
          <button
            className={view_mode === 'split' ? 'active' : ''}
            onClick={() => set_view_mode('split')}
          >
            Split View
          </button>
          <button
            className={view_mode === 'original' ? 'active' : ''}
            onClick={() => set_view_mode('original')}
          >
            Original
          </button>
          <button
            className={view_mode === 'processed' ? 'active' : ''}
            onClick={() => set_view_mode('processed')}
          >
            Processed
          </button>
        </div>
        
        <div className="playback-controls">
          <button
            onClick={() => set_is_playing(!is_playing)}
            className="play-pause-button"
          >
            {is_playing ? 'Pause' : 'Play'}
          </button>
        </div>
        
        <div className="zoom-controls">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <button onClick={reset_view}>Reset</button>
        </div>
      </div>

      <div
        className="preview-viewport"
        onWheel={handle_wheel}
        onMouseDown={handle_mouse_down}
        onMouseMove={handle_mouse_move}
        onMouseUp={handle_mouse_up}
        onMouseLeave={handle_mouse_up}
        style={{ cursor: is_panning ? 'grabbing' : 'grab' }}
      >
        {view_mode === 'split' ? (
          <div className="split-view">
            <div className="preview-pane original-pane">
              <div className="pane-label">Original</div>
              <AnimatedCanvas
                animatedImage={original}
                transform={get_transform()}
                isPlaying={is_playing}
              />
            </div>
            <div className="preview-pane processed-pane">
              <div className="pane-label">Processed</div>
              {isProcessing ? (
                <div className="processing-indicator">
                  <div className="loading-spinner" />
                  <p>Processing...</p>
                </div>
              ) : processed ? (
                <AnimatedCanvas
                  animatedImage={processed}
                  transform={get_transform()}
                  isPlaying={is_playing}
                />
              ) : null}
            </div>
          </div>
        ) : view_mode === 'original' ? (
          <div className="single-view">
            <AnimatedCanvas
              animatedImage={original}
              transform={get_transform()}
              isPlaying={is_playing}
            />
          </div>
        ) : (
          <div className="single-view">
            {isProcessing ? (
              <div className="processing-indicator">
                <div className="loading-spinner" />
                <p>Processing...</p>
              </div>
            ) : processed ? (
              <AnimatedCanvas
                animatedImage={processed}
                transform={get_transform()}
                isPlaying={is_playing}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};