import React, { useState, useCallback, useRef } from 'react';
import type { SentenceAnalysisData, SentenceComponentType, SentenceComponent } from '../../types';
import AnalyzedWord from './AnalyzedWord';
import Tooltip from '../EnglishCorner/Tooltip';
import { TranslationIcon } from '../icons';

interface SentenceAnalysisCardProps {
    data: SentenceAnalysisData | undefined;
    isLoading: boolean;
}

const COMPONENT_COLORS: Record<SentenceComponentType, { bg: string; text: string }> = {
    subject: { bg: 'bg-blue-100', text: 'text-blue-800' },
    predicate: { bg: 'bg-red-100', text: 'text-red-800' },
    object: { bg: 'bg-green-100', text: 'text-green-800' },
    attributive: { bg: 'bg-purple-100', text: 'text-purple-800' },
    adverbial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    complement: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    clause: { bg: 'bg-pink-100', text: 'text-pink-800' },
    phrase: { bg: 'bg-teal-100', text: 'text-teal-800' },
    connective: { bg: 'bg-slate-200', text: 'text-slate-700' },
};

const SentenceAnalysisCard: React.FC<SentenceAnalysisCardProps> = ({ data, isLoading }) => {
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [activeComponent, setActiveComponent] = useState<SentenceComponent | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const selfRef = useRef<HTMLDivElement>(null);

    const handleComponentEnter = useCallback((component: SentenceComponent, event: React.MouseEvent<HTMLSpanElement>) => {
        if (!selfRef.current) return;
        const spanRect = event.currentTarget.getBoundingClientRect();
        const containerRect = selfRef.current.getBoundingClientRect();

        setActiveComponent(component);
        setTooltipPosition({
            top: spanRect.top - containerRect.top - 10,
            left: spanRect.left - containerRect.left + spanRect.width / 2,
        });
    }, []);

    const handleComponentLeave = useCallback(() => {
        setActiveComponent(null);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded-md animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded-md animate-pulse w-3/4"></div>
            </div>
        );
    }

    if (!data) {
        return <p className="text-slate-500">今日长难句加载失败，请刷新重试。</p>;
    }

    const renderSentence = () => {
        if (!isAnalyzed) {
            return <p className="text-lg leading-relaxed cursor-pointer" onClick={() => setIsAnalyzed(true)}>{data.sentence}</p>;
        }
        return (
            <p className="text-lg leading-relaxed">
                {data.components.map((component, index) => (
                    <React.Fragment key={index}>
                        <AnalyzedWord
                            text={component.text}
                            colorClasses={COMPONENT_COLORS[component.type] || COMPONENT_COLORS.phrase}
                            onMouseEnter={(e) => handleComponentEnter(component, e)}
                            onMouseLeave={handleComponentLeave}
                        />
                        {' '}
                    </React.Fragment>
                ))}
            </p>
        );
    };

    return (
        <div ref={selfRef} className="relative">
             <Tooltip annotation={activeComponent} position={tooltipPosition} />
            <div className="space-y-4">
                {renderSentence()}
                {!isAnalyzed && (
                    <button onClick={() => setIsAnalyzed(true)} className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200">
                        点击分析句子
                    </button>
                )}
            </div>
            
            {isAnalyzed && (
                 <div className="mt-4 pt-4 border-t border-purple-200/80 animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="flex items-center text-md font-semibold text-purple-700">
                          <TranslationIcon className="h-5 w-5 mr-2" />
                          参考翻译
                      </h3>
                    </div>
                    <p className="text-slate-700 leading-relaxed" style={{fontFamily: "'Noto Sans SC', sans-serif"}}>{data.translation}</p>
                 </div>
            )}
        </div>
    );
};

export default SentenceAnalysisCard;