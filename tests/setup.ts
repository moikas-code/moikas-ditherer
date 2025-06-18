import '@testing-library/jest-dom';
import { beforeAll } from 'vitest';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // @ts-ignore
  global.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace: string = 'srgb';

    constructor(width: any, height: number, settings?: any) {
      if (typeof width === 'object' && width instanceof Uint8ClampedArray) {
        // Handle new ImageData(data, width, height) constructor
        const data = width;
        this.width = height;
        this.height = settings || 1;
        this.data = data;
      } else {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    }
  };
});