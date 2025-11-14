import React, { useRef, useEffect, useState } from 'react';
import { EditorSettings, CompressionSettings, ImageFormat } from '../types';

interface EditorCanvasProps {
  imageUrl: string | null;
  editorSettings: EditorSettings;
  compressionSettings: CompressionSettings;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  imageUrl,
  editorSettings,
  compressionSettings,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Load image object when URL changes
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImageObj(img);
  }, [imageUrl]);

  // Draw canvas whenever settings change
  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions considering scale and max constraints
    let targetWidth = imageObj.width * compressionSettings.scale;
    let targetHeight = imageObj.height * compressionSettings.scale;

    if (targetWidth > compressionSettings.maxWidth) {
      const ratio = compressionSettings.maxWidth / targetWidth;
      targetWidth = compressionSettings.maxWidth;
      targetHeight = targetHeight * ratio;
    }
    if (targetHeight > compressionSettings.maxHeight) {
      const ratio = compressionSettings.maxHeight / targetHeight;
      targetHeight = compressionSettings.maxHeight;
      targetWidth = targetWidth * ratio;
    }

    // Handle rotation dimensions swap
    const isRotated90or270 = editorSettings.rotation % 180 !== 0;
    canvas.width = isRotated90or270 ? targetHeight : targetWidth;
    canvas.height = isRotated90or270 ? targetWidth : targetHeight;

    // --- Drawing Pipeline ---
    
    // 1. Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Filters
    // Note: Canvas filter accepts a CSS-like string
    ctx.filter = `
      brightness(${editorSettings.brightness}%) 
      contrast(${editorSettings.contrast}%) 
      saturate(${editorSettings.saturation}%) 
      blur(${editorSettings.blur}px)
    `;

    // 3. Transforms (Translate to center to rotate, then back)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((editorSettings.rotation * Math.PI) / 180);
    ctx.scale(
      editorSettings.flipH ? -1 : 1, 
      editorSettings.flipV ? -1 : 1
    );

    // 4. Draw Image (Centered)
    // We draw at the target dimensions but centered around (0,0) in the transformed context
    ctx.drawImage(
      imageObj,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight
    );

    ctx.restore();
    
    // Notify parent that canvas is updated (e.g. for generating previews/blobs)
    onCanvasReady(canvas);

  }, [imageObj, editorSettings, compressionSettings, onCanvasReady]);

  if (!imageUrl) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0a0f1d] rounded-lg shadow-inner border border-slate-800 p-4">
      {/* Checkerboard background for transparency */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), 
                               linear-gradient(-45deg, #333 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, #333 75%), 
                               linear-gradient(-45deg, transparent 75%, #333 75%)`,
             backgroundSize: '20px 20px',
             backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
           }} 
      />
      
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-full object-contain z-10 shadow-2xl"
      />
    </div>
  );
};

export default EditorCanvas;