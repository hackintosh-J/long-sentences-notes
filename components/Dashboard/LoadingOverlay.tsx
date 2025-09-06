import React from 'react';
import { SpinnerIcon } from '../icons';

const renderFunFactWithHighlight = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-amber-800">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const LoadingOverlay: React.FC<{ funFact: string }> = ({ funFact }) => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl p-4 animate-fadeIn">
        <SpinnerIcon className="h-8 w-8 text-slate-500" />
        <p className="mt-4 text-center font-semibold text-slate-600">AI 正在思考中，先来看个趣闻吧！</p>
        <div className="mt-2 text-sm text-center text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-200 w-full max-w-sm">
            {renderFunFactWithHighlight(funFact)}
        </div>
    </div>
);

export default LoadingOverlay;