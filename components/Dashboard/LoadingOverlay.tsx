import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from '../icons';
import ThinkingIndicator from '../common/ThinkingIndicator';
import { FUN_FACTS } from '../../constants';
import { getRandomItem } from '../../utils/helpers';

const renderFunFactWithHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-amber-800">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

interface LoadingOverlayProps {
    thinkingText?: string;
    isThinkingComplete: boolean;
    showFunFacts?: boolean; // New prop
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ thinkingText, isThinkingComplete, showFunFacts = true }) => {
    const [currentFunFact, setCurrentFunFact] = useState('');
    
    // Determine if fun facts should be displayed
    const shouldDisplayFunFacts = (!thinkingText || isThinkingComplete) && showFunFacts;

    useEffect(() => {
        let intervalId: number | null = null;
        if (shouldDisplayFunFacts) {
            setCurrentFunFact(getRandomItem(FUN_FACTS)); // Set initial one
            intervalId = window.setInterval(() => {
                setCurrentFunFact(getRandomItem(FUN_FACTS));
            }, 5000);
        }
        
        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [shouldDisplayFunFacts]);

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl p-4 animate-fadeIn">
            {thinkingText && !isThinkingComplete ? (
                <div className="w-full max-w-sm px-4">
                     <ThinkingIndicator text={thinkingText} />
                </div>
            ) : shouldDisplayFunFacts ? (
                <>
                    <SpinnerIcon className="h-8 w-8 text-slate-500" />
                    <p className="mt-4 text-center font-semibold text-slate-600">AI 正在思考中，先来看个趣闻吧！</p>
                    <div className="mt-2 text-sm text-center text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-200 w-full max-w-sm min-h-[5rem] flex items-center justify-center">
                        <p className="animate-fadeIn">{renderFunFactWithHighlight(currentFunFact)}</p>
                    </div>
                </>
            ) : (
                // Minimal spinner when fun facts are disabled but still in a loading state
                <SpinnerIcon className="h-8 w-8 text-slate-500" />
            )}
        </div>
    );
};

export default LoadingOverlay;
