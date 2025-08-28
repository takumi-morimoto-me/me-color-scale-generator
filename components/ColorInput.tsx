import React, { useState } from 'react';
import type { ColorData } from '../App';
import { ColorRow } from './ColorRow';
import { ImageExtractor } from './ImageExtractor';

interface ColorInputProps {
  onGenerate: (colors: ColorData[]) => void;
}

const initialInputs: ColorData[] = [
  { id: crypto.randomUUID(), name: 'Primary', color: '#3b82f6' },
];

type InputMode = 'palette' | 'image';

export const ColorInput: React.FC<ColorInputProps> = ({ onGenerate }) => {
  const [inputs, setInputs] = useState<ColorData[]>(initialInputs);
  const [mode, setMode] = useState<InputMode>('palette');

  const handleInputChange = (id: string, field: 'name' | 'color', value: string) => {
    setInputs(prev => 
      prev.map(input => 
        input.id === id ? { ...input, [field]: value } : input
      )
    );
  };
  
  const addColors = (newColors: {name: string, color: string}[]) => {
    const newColorData = newColors.map(c => ({...c, id: crypto.randomUUID()}));
    setInputs(prev => [...prev, ...newColorData]);
    setMode('palette'); // Switch to palette view after adding colors
  }

  const addInput = () => {
    setInputs(prev => [
      ...prev, 
      { id: crypto.randomUUID(), name: `Color ${prev.length + 1}`, color: '#ffffff' }
    ]);
  };

  const removeInput = (id: string) => {
    setInputs(prev => prev.filter(input => input.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(inputs);
  };

  const TabButton: React.FC<{active: boolean; onClick: () => void; children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition ${active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-700 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
        <TabButton active={mode === 'palette'} onClick={() => setMode('palette')}>Palette</TabButton>
        <TabButton active={mode === 'image'} onClick={() => setMode('image')}>From Image</TabButton>
      </div>

      {mode === 'palette' && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {inputs.map((input) => (
              <ColorRow
                key={input.id}
                id={input.id}
                name={input.name}
                color={input.color}
                onChange={handleInputChange}
                onRemove={removeInput}
                canRemove={inputs.length > 1}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={addInput}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 font-semibold py-2 px-4 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              Add another color
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-8 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              Generate Scales
            </button>
          </div>
        </form>
      )}

      {mode === 'image' && (
        <ImageExtractor onColorsExtracted={addColors} />
      )}
    </div>
  );
};
