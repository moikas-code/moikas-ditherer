import React, { useCallback, useRef } from 'react';
import './ImageUploader.css';

import type { AnimatedImage } from '@/types';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
  onAnimatedUpload?: (animated: AnimatedImage) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onAnimatedUpload }) => {
  const file_input_ref = useRef<HTMLInputElement>(null);

  const handle_file = useCallback(
    async (file: File) => {
      if (!file) return;

      // Check if it's a GIF
      if (file.type === 'image/gif' && onAnimatedUpload) {
        const { parse_gif_file } = await import('@core/utils/gif_utils');
        const arrayBuffer = await file.arrayBuffer();
        const animated = await parse_gif_file(arrayBuffer);
        onAnimatedUpload(animated);
      } else {
        // Handle static images
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const image_data = ctx.getImageData(0, 0, img.width, img.height);
              onImageUpload(image_data);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload, onAnimatedUpload]
  );

  const handle_file_change = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handle_file(file);
    },
    [handle_file]
  );

  const handle_drag_over = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handle_drop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      handle_file(file);
    },
    [handle_file]
  );

  return (
    <div
      className="image-uploader"
      onDragOver={handle_drag_over}
      onDrop={handle_drop}
    >
      <div className="upload-content">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        
        <h3>Drop your image here</h3>
        <p>or click to browse</p>
        
        <button
          onClick={() => file_input_ref.current?.click()}
          className="browse-button"
        >
          Browse Files
        </button>
        
        <input
          ref={file_input_ref}
          type="file"
          accept="image/*"
          onChange={handle_file_change}
          style={{ display: 'none' }}
        />
        
        <p className="supported-formats">
          Supports: JPG, PNG, GIF, BMP, WebP
        </p>
      </div>
    </div>
  );
};