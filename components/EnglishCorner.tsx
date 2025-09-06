import React from 'react';
import SentenceAnalysis from './SentenceAnalysis';
import { SENTENCES_DATA } from '../constants';
import { ArrowLeftIcon } from './icons';

interface EnglishCornerProps {
    onBack: () => void;
}

const EnglishCorner: React.FC<EnglishCornerProps> = ({ onBack }) => {
  return (
    <div className="animate-fadeIn">
        <div className="mb-8">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300"
            >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>返回主页</span>
            </button>
        </div>
        <div className="space-y-12">
            {SENTENCES_DATA.map((sentenceData) => (
                <SentenceAnalysis key={sentenceData.id} data={sentenceData} />
            ))}
        </div>
    </div>
  );
};

export default EnglishCorner;
