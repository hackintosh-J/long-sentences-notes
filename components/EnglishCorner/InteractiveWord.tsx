import React from 'react';
import type { CorrectionAnnotation, CorrectionAnnotationType } from '../../types';

interface InteractiveWordProps {
  annotation: CorrectionAnnotation;
  onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

const ANNOTATION_COLORS: Record<CorrectionAnnotationType, {bg: string, text: string, ring: string}> = {
    GOOD: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-400' },
    ERROR: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-400' },
    SUGGESTION: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-400' },
};

const InteractiveWord: React.FC<InteractiveWordProps> = ({ annotation, onClick }) => {
    const colors = ANNOTATION_COLORS[annotation.type] || ANNOTATION_COLORS.SUGGESTION;

    return (
        <span
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(e as any)}
            className={`cursor-pointer rounded-md px-1 transition-all duration-300 ease-in-out font-semibold ${colors.bg} ${colors.text} hover:${colors.bg.replace('100', '200')} focus:outline-none focus-visible:ring-2 ${colors.ring}`}
        >
            {annotation.text}
        </span>
    );
};

export default InteractiveWord;