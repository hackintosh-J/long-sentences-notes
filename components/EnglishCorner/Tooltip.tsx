import React from 'react';
import type { Annotation } from '../../types';

interface TooltipProps {
  annotation: Annotation | null;
  position: { top: number; left: number } | null;
}

const Tooltip: React.FC<TooltipProps> = ({ annotation, position }) => {
  if (!annotation || !position) return null;

  return (
    <div
      className="absolute z-30 bg-slate-800 text-white rounded-lg shadow-xl px-4 py-3 text-sm max-w-xs transition-opacity duration-200"
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, -100%)' }}
    >
      <p className="whitespace-pre-wrap font-sans">{annotation.explanation}</p>
    </div>
  );
};

export default Tooltip;
