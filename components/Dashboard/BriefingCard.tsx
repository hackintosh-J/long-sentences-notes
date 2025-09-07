import React from 'react';
import LoadingOverlay from './LoadingOverlay';

interface BriefingCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isNote?: boolean;
    className?: string;
    isLoading?: boolean;
    isThinkingComplete?: boolean;
    thinkingText?: string;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ title, icon, children, isNote = false, className = '', isLoading = false, isThinkingComplete = true, thinkingText = '' }) => {
    // The thinking overlay is shown only when the card is loading AND the AI's thinking phase is not yet complete.
    const showThinkingOverlay = isLoading && !isThinkingComplete;

    return (
        <div className={`relative bg-slate-50 p-6 rounded-xl border border-slate-200/80 min-h-[20rem] flex flex-col ${className}`}>
            {showThinkingOverlay && <LoadingOverlay thinkingText={thinkingText} showFunFacts={false} />}
            {/* The content is hidden while the thinking overlay is visible to prevent flashes of old or unstyled content. */}
            <div className="flex flex-col flex-grow" style={{ visibility: showThinkingOverlay ? 'hidden' : 'visible' }}>
                <h4 className="flex items-center text-xl font-bold text-slate-700 mb-4">{icon}{title}</h4>
                <div className={`flex-grow flex flex-col justify-center ${isNote ? 'text-rose-800 font-semibold' : 'text-slate-800'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BriefingCard;