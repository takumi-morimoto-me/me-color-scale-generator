
import React, { useState, useEffect } from 'react';
import { getTextColorForBackground } from '../services/colorService';

interface ScaleBlockProps {
  color: string;
}

export const ScaleBlock: React.FC<ScaleBlockProps> = ({ color }) => {
  const [copied, setCopied] = useState(false);
  const textColor = getTextColorForBackground(color) === 'light' ? 'text-white' : 'text-black';

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
  };

  return (
    <div
      className="relative h-20 sm:h-24 rounded-lg flex items-end p-2 cursor-pointer group transition-transform transform hover:scale-105 hover:z-10"
      style={{ backgroundColor: color }}
      onClick={handleCopy}
    >
      <span
        className={`font-mono text-xs font-semibold ${textColor} opacity-80 group-hover:opacity-100 transition-opacity`}
      >
        {color}
      </span>
      {copied && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
          <span className="text-white text-sm font-bold">Copied!</span>
        </div>
      )}
    </div>
  );
};
