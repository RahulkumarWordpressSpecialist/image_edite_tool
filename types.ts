export enum ImageFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export interface ImageState {
  file: File | null;
  originalUrl: string | null;
  previewUrl: string | null;
  name: string;
  size: number;
  type: string;
}

export interface EditorSettings {
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturation: number; // 0-200, default 100
  blur: number;       // 0-20, default 0
  rotation: number;   // degrees
  flipH: boolean;
  flipV: boolean;
}

export interface CompressionSettings {
  quality: number;    // 0-100
  format: ImageFormat;
  maxWidth: number;
  maxHeight: number;
  scale: number;      // 0.1 - 1.0 (10% to 100%)
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}