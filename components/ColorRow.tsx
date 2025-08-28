import React, { useState, useEffect, useMemo } from 'react';
import { hexToRgb, hexToHsl, rgbToHex, hslToHex } from '../services/colorService';

type InputType = 'hex' | 'rgb' | 'hsl';

interface ColorRowProps {
  id: string;
  name: string;
  color: string;
  onChange: (id: string, field: 'name' | 'color', value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const ColorRow: React.FC<ColorRowProps> = ({ id, name, color, onChange, onRemove, canRemove }) => {
  const [inputType, setInputType] = useState<InputType>('hex');
  
  const colorValues = useMemo(() => {
    const rgb = hexToRgb(color);
    const hsl = hexToHsl(color);
    return {
      hex: color,
      rgb: rgb ? `${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}` : '0, 0, 0',
      hsl: hsl ? `${Math.round(hsl.h * 360)}, ${Math.round(hsl.s * 100)}, ${Math.round(hsl.l * 100)}` : '0, 0, 0',
    }
  }, [color]);
  
  const handleColorChange = (value: string) => {
    let newHex = color;
    if (inputType === 'hex') {
       if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
           newHex = value;
       }
    } else if (inputType === 'rgb') {
        const parts = value.split(',').map(s => parseInt(s.trim(), 10));
        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
            newHex = rgbToHex({ r: parts[0], g: parts[1], b: parts[2] });
        }
    } else if (inputType === 'hsl') {
        const parts = value.split(',').map(s => parseInt(s.trim(), 10));
        if (parts.length === 3 && parts.every(p => !isNaN(p)) && parts[0] >= 0 && parts[0] <= 360 && parts[1] >= 0 && parts[1] <= 100 && parts[2] >= 0 && parts[2] <= 100) {
            newHex = hslToHex({ h: parts[0] / 360, s: parts[1] / 100, l: parts[2] / 100 });
        }
    }
    onChange(id, 'color', newHex);
  };
  
  const commonInputClass = "w-full bg-slate-700 text-slate-200 rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-3 items-center p-3 bg-slate-900/50 rounded-lg">
      <div className="flex items-center gap-3">
        <input
            type="color"
            value={color}
            onChange={(e) => onChange(id, 'color', e.target.value)}
            className="w-10 h-10 p-1 bg-slate-700 border-slate-600 rounded-lg cursor-pointer appearance-none"
            aria-label="Color Picker"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(id, 'name', e.target.value)}
          placeholder="Color Role"
          className={commonInputClass}
          aria-label="Color Name"
        />
      </div>
      
      <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
        <select value={inputType} onChange={(e) => setInputType(e.target.value as InputType)} className="bg-slate-800 text-slate-300 rounded-lg px-2 py-2 border border-slate-600 h-full focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
        </select>
        <input
            type="text"
            value={colorValues[inputType]}
            onChange={(e) => handleColorChange(e.target.value)}
            className={`${commonInputClass} font-mono`}
            aria-label="Color Value"
        />
      </div>

      <button
          type="button"
          onClick={() => onRemove(id)}
          className="text-slate-500 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          aria-label={`Remove ${name}`}
          disabled={!canRemove}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
};
