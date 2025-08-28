
import React, { useMemo } from 'react';
import { generateColorScale } from '../services/colorService';
import { ScaleBlock } from './ScaleBlock';

interface ColorScaleProps {
  id: string;
  name: string;
  baseColor: string;
  onRemove: (id: string) => void;
}

export const ColorScale: React.FC<ColorScaleProps> = ({ id, name, baseColor, onRemove }) => {
  const colorScale = useMemo(() => generateColorScale(baseColor), [baseColor]);

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-500 flex-shrink-0"
            style={{ backgroundColor: baseColor }}
          />
          <div>
            <h2 className="text-xl font-bold text-slate-200">{name}</h2>
            <p className="font-mono text-sm text-slate-400">{baseColor}</p>
          </div>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-slate-500 hover:text-red-500 transition"
          aria-label={`Remove ${name} scale`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
        {colorScale.map((color) => (
          <ScaleBlock key={color} color={color} />
        ))}
      </div>
    </div>
  );
};
