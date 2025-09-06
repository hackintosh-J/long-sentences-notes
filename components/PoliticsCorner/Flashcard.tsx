import React, { useState, useEffect } from 'react';
import type { PoliticsCardData } from '../../types';
import { FlipIcon } from '../icons';

const Flashcard: React.FC<{ card: PoliticsCardData }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
    }, [card]);

    return (
        <div className="perspective-1000 w-full h-64" onClick={() => setIsFlipped(!isFlipped)}>
            <div 
                className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col justify-center items-center p-6 cursor-pointer hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-semibold text-slate-800 text-center">{card.term}</h3>
                    <div className="absolute bottom-4 right-4 text-slate-400 flex items-center gap-1">
                        <FlipIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">点击翻转</span>
                    </div>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-rose-50 border border-rose-200 rounded-xl shadow-lg p-6 rotate-y-180 overflow-y-auto">
                    <h4 className="font-bold text-rose-800 mb-2">{card.term}</h4>
                    <p className="text-slate-700 text-sm mb-3">{card.explanation}</p>
                    {card.details && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                            {card.details.map((detail, i) => <li key={i}>{detail}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flashcard;
