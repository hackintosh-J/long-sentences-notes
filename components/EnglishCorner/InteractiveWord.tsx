import React, { useRef } from 'react';
import type { Annotation, AnnotationType } from '../../types';

interface InteractiveWordProps {
  annotation: Annotation;
  onHover: (annotation: Annotation, element: HTMLSpanElement) => void;
  onLeave: () => void;
  colorClass: string;
  isHighlighted: boolean;
  highlightColorClass: string;
  isPracticeMode: boolean;
}

const InteractiveWord: React.FC<InteractiveWordProps> = ({ annotation, onHover, onLeave, colorClass, isHighlighted, highlightColorClass, isPracticeMode }) => {
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      onHover(annotation, ref.current);
    }
  };

  const practiceModeClasses = 'bg-slate-200 text-transparent hover:bg-slate-300';
  
  const ANNOTATION_COLORS: Record<AnnotationType, {bg: string, text: string, ring: string}> = {
    vocabulary: { bg: 'bg-teal-100', text: 'text-teal-800', ring: 'ring-teal-400' },
    grammar: { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-400' },
    phrase: { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-400' },
    reference: { bg: 'bg-violet-100', text: 'text-violet-800', ring: 'ring-violet-400' }
  };
  
  const colors = ANNOTATION_COLORS[annotation.type] || ANNOTATION_COLORS.vocabulary;
  const normalModeClasses = `${colors.bg} ${colors.text} hover:${colors.bg.replace('100', '200')} ${!isPracticeMode && isHighlighted ? `ring-2 ring-offset-2 ${colors.ring}` : ''}`;

  return (
    <span
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      className={`cursor-pointer rounded-md px-1 py-0.5 transition-all duration-300 ease-in-out font-semibold ${isPracticeMode ? practiceModeClasses : normalModeClasses}`}
    >
      {annotation.text}
    </span>
  );
};

export default InteractiveWord;
