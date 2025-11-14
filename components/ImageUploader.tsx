import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          onImageUpload(file);
        } else {
          alert("Please upload a valid image file.");
        }
      }
    },
    [onImageUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className="w-full h-96 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all cursor-pointer group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
      <div className="bg-slate-700 p-4 rounded-full mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
        <Upload size={48} className="text-slate-400 group-hover:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        Upload an Image
      </h3>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        Drag and drop your image here, or click to browse.
        <br />
        Supports JPG, PNG, WebP.
      </p>
    </div>
  );
};

export default ImageUploader;