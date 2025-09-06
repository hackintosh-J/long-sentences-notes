import React from 'react';

interface AnalyzedWordProps {
  text: string;
  colorClasses: { bg: string; text: string };
  onMouseEnter: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onMouseLeave: () => void;
}

const AnalyzedWord: React.FC<AnalyzedWordProps> = ({ text, colorClasses, onMouseEnter, onMouseLeave }) => {
    return (
        <span
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`cursor-pointer rounded-md px-1 transition-all duration-300 ease-in-out font-medium ${colorClasses.bg} ${colorClasses.text} hover:brightness-110`}
        >
            {text}
        </span>
    );
};

export default AnalyzedWord;