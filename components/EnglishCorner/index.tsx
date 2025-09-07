import React, { useState, useEffect, useRef } from 'react';
import { Type as GeminiType } from "@google/genai";
import { generateContent, generateContentStream, getAiProvider } from '../../services/aiService';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from '../icons';
import type { CorrectionResponse, CorrectionAnnotation } from '../../types';
import AnnotatedSpan from './InteractiveWord';
import Tooltip from './Tooltip';
import LoadingOverlay from '../Dashboard/LoadingOverlay';

interface EnglishCornerProps {
    onBack: () => void;
}

// Locally augment the type to include a unique identifier for UI state management
type AnnotationWithIndex = CorrectionAnnotation & {
    // A unique key combining the original text and its position in the essay
    key: string; 
    // FIX: Added the 'index' property, which is attached during processing.
    // This resolves errors where '.index' was accessed on an object of this type.
    index: number;
};

const EnglishCorner: React.FC<EnglishCornerProps> = ({ onBack }) => {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CorrectionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [thinkingText, setThinkingText] = useState('');
    const [isThinkingComplete, setIsThinkingComplete] = useState(false);
    
    // State to manage the currently visible tooltip
    const [activeTooltip, setActiveTooltip] = useState<{ 
        annotation: AnnotationWithIndex;
        position: { top: number; left: number };
    } | null>(null);

    const resultContainerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);
        setActiveTooltip(null);
        setThinkingText('');
        setIsThinkingComplete(false); // Ensure thinking phase is shown


        const prompt = `You are an expert English teacher for China's Postgraduate Entrance Examination. Analyze the following essay.

Essay:
---
${inputText}
---

Your response MUST be a single, raw, valid JSON object and nothing else.

Your first and most important task is to provide a score and justification.
- **overallScore**: A score out of 20.
- **scoreBasis**: A justification for the score, in Chinese.

Your second task is to provide detailed annotations for specific parts of the essay.
- **annotations**: A list of comments on the text.
- Each annotation must have:
    - \`text\`: The exact text from the essay.
    - \`type\`: 'GOOD', 'ERROR', or 'SUGGESTION'.
    - \`explanation\`: Your feedback, in Chinese.

**CRITICAL REQUIREMENT**: You must use a variety of annotation types. Find something to praise ('GOOD'), identify clear mistakes ('ERROR'), and provide stylistic improvements ('SUGGESTION'). A response that only uses one type is a failure.

**Final JSON Structure Example (Follow this structure exactly):**
{
  "overallScore": 15,
  "scoreBasis": "文章结构清晰，观点明确，但在词汇多样性和高级句式运用上还有提升空间。部分语法细节需要注意。",
  "annotations": [
    { "text": "a huge progress", "type": "ERROR", "explanation": "语法错误。'progress' 是不可数名词，不能用 'a' 修饰，应改为 'huge progress' 或 'great progress'。" },
    { "text": "In conclusion", "type": "GOOD", "explanation": "用词得当。这是一个很好的总结性短语，使文章结构清晰。" },
    { "text": "I think this is a good idea", "type": "SUGGESTION", "explanation": "表达可以更正式。建议改为 'I believe this is a sound proposal' 或 'From my perspective, this is an effective approach'，使语气更学术化。" }
  ]
}`;
        
        try {
            let fullJsonString = "";
    
            const stream = generateContentStream(prompt, 60000);
            let thinkingPhaseDone = false;
    
            for await (const chunk of stream) {
                if (chunk.parsed) {
                    if (chunk.parsed.type === 'thinking') {
                        setThinkingText(prev => prev + chunk.parsed.content);
                    } else { // content chunk
                        if (!thinkingPhaseDone) {
                            setIsThinkingComplete(true);
                            thinkingPhaseDone = true;
                        }
                        fullJsonString += chunk.parsed.content;
                    }
                }
            }

            const data: CorrectionResponse = JSON.parse(fullJsonString.trim());
            setResult(data);

        } catch (e) {
            console.error("Error generating correction:", e);
            setError("抱歉，AI批改时遇到问题。请稍后再试或检查你的文本内容。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnnotationClick = (annotation: AnnotationWithIndex, event: React.MouseEvent<HTMLSpanElement>) => {
        // If the clicked annotation is already active, hide the tooltip
        if (activeTooltip && activeTooltip.annotation.key === annotation.key) {
            setActiveTooltip(null);
            return;
        }

        if (!resultContainerRef.current) return;
        const spanRect = event.currentTarget.getBoundingClientRect();
        const containerRect = resultContainerRef.current.getBoundingClientRect();

        const position = {
            top: spanRect.top - containerRect.top - 10, // 10px offset above
            left: spanRect.left - containerRect.left + spanRect.width / 2,
        };
        
        setActiveTooltip({ annotation, position });
    };

    const renderAnnotatedText = () => {
        if (!result) return <p className="whitespace-pre-wrap">{inputText}</p>;

        const { annotations } = result;
        const text = inputText;

        // Use a robust method to handle overlapping annotations and create unique keys
        const sortedAnnotations: AnnotationWithIndex[] = annotations
            .map(anno => {
                const indices: number[] = [];
                let startIndex = 0;
                while(startIndex < text.length) {
                    const index = text.indexOf(anno.text, startIndex);
                    if (index === -1) break;
                    indices.push(index);
                    startIndex = index + 1;
                }
                return indices.map(index => ({...anno, index, key: `${anno.text}-${index}`}));
            })
            .flat()
            .sort((a, b) => a.index - b.index);

        const parts: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        
        // Filter out overlapping annotations, preferring the one that starts first.
        const uniqueAnnotations = sortedAnnotations.filter((anno, index, self) => 
           index === 0 || anno.index >= (self[index - 1].index + self[index - 1].text.length)
        );

        uniqueAnnotations.forEach((anno) => {
            if (anno.index > lastIndex) {
                parts.push(text.substring(lastIndex, anno.index));
            }
            parts.push(
                <AnnotatedSpan
                    key={anno.key}
                    annotation={anno}
                    onClick={(e) => handleAnnotationClick(anno, e)}
                />
            );
            lastIndex = anno.index + (anno.text ? anno.text.length : 0);
        });

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return <p className="text-lg leading-relaxed whitespace-pre-wrap">{parts}</p>;
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <h2 className="text-3xl font-bold text-sky-800 mb-2">英语作文智能批改</h2>
                <p className="text-slate-500 mb-6">粘贴你的作文，AI将根据考研英语（一）标准进行评分和批注。</p>
                
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请在此处粘贴你的英文作文..."
                    className="w-full h-64 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !inputText.trim()}
                    className="mt-4 w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {isLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在批改...</> : <><SparklesIcon className="h-5 w-5"/> 提交批改</>}
                </button>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>}

            {(isLoading || result) && (
                <div 
                    ref={resultContainerRef} 
                    className="relative bg-white px-6 pt-6 pb-6 rounded-2xl shadow-lg border border-slate-200/80 animate-fadeIn space-y-6 min-h-[20rem]"
                    onClick={(e) => {
                        // Close tooltip if clicking the background of the card
                        if (e.target === e.currentTarget) {
                           setActiveTooltip(null);
                        }
                    }}
                >
                    {isLoading && (
                        <LoadingOverlay 
                            thinkingText={thinkingText} 
                            isThinkingComplete={isThinkingComplete} 
                            showFunFacts={true} 
                        />
                    )}
                    
                    {/* Final result, shown only when not loading */}
                    {!isLoading && result && (
                        <>
                            <Tooltip annotation={activeTooltip?.annotation ?? null} position={activeTooltip?.position ?? null} />
                            <h3 className="text-2xl font-bold text-slate-800">批改报告</h3>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="text-center shrink-0">
                                    <p className="text-5xl font-extrabold text-sky-600">{result.overallScore}<span className="text-2xl font-medium text-slate-500">/20</span></p>
                                    <p className="text-sm font-semibold text-slate-600 mt-1">综合得分</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">评分依据：</h4>
                                    <p className="text-slate-600">{result.scoreBasis}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-slate-700 mb-3">原文及批注</h4>
                                 <div className="p-4 border rounded-lg bg-slate-50/50 min-h-[10rem]">
                                    {renderAnnotatedText()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnglishCorner;