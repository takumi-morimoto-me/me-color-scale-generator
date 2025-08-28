import React, { useState, useRef, useCallback } from 'react';
import { extractColorsFromImage } from '../services/colorService';

interface ImageExtractorProps {
  onColorsExtracted: (colors: { name: string; color: string }[]) => void;
}

export const ImageExtractor: React.FC<ImageExtractorProps> = ({ onColorsExtracted }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
    }
    setError(null);
    setIsLoading(true);
    setExtractedColors([]);
    setSelectedColors(new Set());

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if(ctx) {
             const aspectRatio = img.width / img.height;
             const maxWidth = 500;
             canvas.width = Math.min(img.width, maxWidth);
             canvas.height = canvas.width / aspectRatio;
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
             const colors = extractColorsFromImage(imageData, 12);
             setExtractedColors(colors);
          }
        }
        setIsLoading(false);
      };
      img.onerror = () => {
          setError('Could not load the image file.');
          setIsLoading(false);
      }
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  }
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const toggleColorSelection = (color: string) => {
    setSelectedColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(color)) {
        newSet.delete(color);
      } else {
        newSet.add(color);
      }
      return newSet;
    });
  };

  const handleAddColors = () => {
    const colorsToAdd = Array.from(selectedColors).map((color, i) => ({
      name: `Extracted ${i + 1}`,
      color,
    }));
    onColorsExtracted(colorsToAdd);
    setExtractedColors([]);
    setImageSrc(null);
    setSelectedColors(new Set());
  };

  return (
    <div className="text-center">
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <label
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="cursor-pointer block w-full p-8 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 transition"
      >
        {isLoading ? (
            <div className="flex flex-col items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-slate-400">Analyzing image...</p>
            </div>
        ) : imageSrc ? (
          <img src={imageSrc} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
        ) : (
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-slate-400">Drag & drop an image here, or click to select a file.</p>
          </div>
        )}
      </label>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {extractedColors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-300">Extracted Colors</h3>
          <p className="text-sm text-slate-500 mb-4">Click to select the colors you want to add to your palette.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {extractedColors.map(color => (
              <div
                key={color}
                onClick={() => toggleColorSelection(color)}
                className={`w-16 h-16 rounded-lg cursor-pointer border-2 transition-all transform hover:scale-110 ${selectedColors.has(color) ? 'border-violet-400 ring-2 ring-violet-400' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <button
            onClick={handleAddColors}
            disabled={selectedColors.size === 0}
            className="mt-6 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-6 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Add {selectedColors.size} Selected Colors
          </button>
        </div>
      )}
    </div>
  );
};
