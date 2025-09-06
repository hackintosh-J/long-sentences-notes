import React, { useState, useRef, useCallback } from 'react';
import type { SentenceData, Annotation, AnnotationType } from '../../types';
import { TranslationIcon, LightbulbIcon, SpeakerIcon, EyeIcon, EyeOffIcon, PracticeIcon } from '../icons';
import InteractiveWord from './InteractiveWord';
import Tooltip from './Tooltip';

interface SentenceAnalysisProps {
  data: SentenceData;
}

const SentenceAnalysis: React.FC<SentenceAnalysisProps> = ({ data }) => {
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [isTranslationVisible, setIsTranslationVisible] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleWordHover = useCallback((annotation: Annotation, element: HTMLElement) => {
    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    setActiveAnnotation(annotation);
    setTooltipPosition({
      top: rect.top - cardRect.top - 10,
      left: rect.left - cardRect.left + rect.width / 2,
    });
  }, []);

  const handleWordLeave = useCallback(() => {
    setActiveAnnotation(null);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(data.sentence);
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [data.sentence, isSpeaking]);
  
  const ANNOTATION_COLORS: Record<AnnotationType, {bg: string, text: string, ring: string}> = {
    vocabulary: { bg: 'bg-teal-100', text: 'text-teal-800', ring: 'ring-teal-400' },
    grammar: { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-400' },
    phrase: { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-400' },
    reference: { bg: 'bg-violet-100', text: 'text-violet-800', ring: 'ring-violet-400' }
  };

  const renderAnnotatedSentence = () => {
    const { sentence, annotations } = data;
    const sortedAnnotations = [...annotations]
      .map(anno => ({ ...anno, index: sentence.indexOf(anno.text) }))
      .filter(anno => anno.index !== -1)
      .sort((a, b) => a.index - b.index);

    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((anno, i) => {
      if (anno.index > lastIndex) {
        parts.push(sentence.substring(lastIndex, anno.index));
      }
      const colors = ANNOTATION_COLORS[anno.type] || ANNOTATION_COLORS.vocabulary;
      parts.push(
        <InteractiveWord
          key={`${anno.text}-${i}`}
          annotation={anno}
          onHover={handleWordHover}
          onLeave={handleWordLeave}
          colorClass={`${colors.bg} ${colors.text}`}
          isHighlighted={highlightedText === anno.text}
          highlightColorClass={colors.ring}
          isPracticeMode={isPracticeMode}
        />
      );
      lastIndex = anno.index + anno.text.length;
    });

    if (lastIndex < sentence.length) {
      parts.push(sentence.substring(lastIndex));
    }

    return parts;
  };
  
  return (
    <div ref={cardRef} className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200/80 transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-slate-500 shrink-0">Sentence #{data.id}</h2>
              <button 
                onClick={() => setIsPracticeMode(!isPracticeMode)} 
                title="Practice Mode"
                className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full transition-all duration-200 font-semibold ${isPracticeMode ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <PracticeIcon className="h-4 w-4"/>
                <span>{isPracticeMode ? 'Reviewing' : 'Practice'}</span>
              </button>
          </div>
          <button 
            onClick={handleSpeak} 
            title="Read sentence aloud" 
            className={`relative z-0 text-slate-400 hover:text-blue-600 transition-colors duration-200 ${isSpeaking ? 'speaking-icon text-blue-600' : ''}`}
          >
            <SpeakerIcon className="h-7 w-7" />
          </button>
        </div>
        <p className="text-xl leading-relaxed text-slate-800 font-medium">
          {renderAnnotatedSentence()}
        </p>
      </div>

      <div className="bg-slate-50/70 border-t border-slate-200 p-8 space-y-8">
        <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center text-lg font-semibold text-blue-600">
                  <TranslationIcon className="h-6 w-6 mr-2" />
                  综合翻译
              </h3>
              <button
                onClick={() => setIsTranslationVisible(!isTranslationVisible)}
                className="flex items-center space-x-2 text-sm font-semibold text-slate-600 bg-slate-200/70 hover:bg-slate-300/70 px-3 py-1 rounded-full transition-all duration-200"
              >
                {isTranslationVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                <span>{isTranslationVisible ? '隐藏翻译' : '显示翻译'}</span>
              </button>
            </div>
            {isTranslationVisible && (
              <p className="text-slate-700 leading-loose animate-fadeIn" style={{fontFamily: "'Noto Sans SC', sans-serif"}}>{data.fullTranslation}</p>
            )}
        </div>
        <div>
            <h3 className="flex items-center text-lg font-semibold text-amber-600 mb-4">
                <LightbulbIcon className="h-6 w-6 mr-2" />
                重点词汇与短语
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.annotations.map((anno, index) => {
                    const colors = ANNOTATION_COLORS[anno.type] || ANNOTATION_COLORS.vocabulary;
                    return (
                        <li 
                            key={index} 
                            className="bg-white p-4 rounded-lg border border-slate-200 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:scale-105 transform"
                            onMouseEnter={() => setHighlightedText(anno.text)}
                            onMouseLeave={() => setHighlightedText(null)}
                        >
                            <p className={`font-bold text-md ${colors.text}`}>{anno.text}</p>
                            <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">{anno.explanation}</p>
                        </li>
                    )
                })}
            </ul>
        </div>
      </div>
      <Tooltip annotation={activeAnnotation} position={tooltipPosition} />
    </div>
  );
};

export default SentenceAnalysis;
