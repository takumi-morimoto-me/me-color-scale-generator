import React, { useState, useCallback } from 'react';
import { ColorInput } from './components/ColorInput';
import { ColorScale } from './components/ColorScale';

export interface ColorData {
  id: string;
  name: string;
  color: string;
}

const App: React.FC = () => {
  const [colors, setColors] = useState<ColorData[]>([]);

  const handleGenerateScales = useCallback((newColors: ColorData[]) => {
    setColors(newColors);
  }, []);

  const removeColor = useCallback((idToRemove: string) => {
    setColors(prevColors => prevColors.filter(c => c.id !== idToRemove));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            Color Scale Generator
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Define your palette by value, or extract colors from an image.
          </p>
        </header>
        
        <ColorInput onGenerate={handleGenerateScales} />

        <div className="mt-12 space-y-10">
          {colors.length > 0 ? (
            colors.map(colorData => (
              <ColorScale 
                key={colorData.id} 
                id={colorData.id}
                name={colorData.name}
                baseColor={colorData.color} 
                onRemove={removeColor} 
              />
            ))
          ) : (
            <div className="text-center py-16 px-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <h2 className="text-2xl font-semibold text-slate-300">Your color scales will appear here</h2>
              <p className="mt-2 text-slate-400">Use the form above to define your color palette and generate scales.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center mt-16 text-slate-500">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;
