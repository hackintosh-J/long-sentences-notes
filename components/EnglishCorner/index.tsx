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
    const [agentStatus, setAgentStatus] = useState<'idle' | 'generating' | 'formatting'>('idle');
    const [thinkingText, setThinkingText] = useState('');
    
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
        setAgentStatus('generating');

        const generationPrompt = `You are an expert English teacher for China's Postgraduate Entrance Examination. Analyze the following essay.

Essay:
---
${inputText}
---

Your response must be structured like a JSON object containing a score, justification, and detailed annotations.
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
Your final output should be only the structured content, ready for JSON parsing.`;
        
        try {
            // == AGENT STEP 1: GENERATE RAW REPORT WITH THINKING CHAIN ==
            let rawReportContent = "";
            const stream = generateContentStream(generationPrompt, 60000);
            for await (const chunk of stream) {
                if (chunk.parsed) {
                    if (chunk.parsed.type === 'thinking') {
                        setThinkingText(prev => prev + chunk.parsed.content);
                    } else {
                        rawReportContent += chunk.parsed.content;
                    }
                }
            }

            if (!rawReportContent.trim()) {
                throw new Error("The AI returned an empty response for the report draft.");
            }

            // == AGENT STEP 2: CLEAN AND FORMAT THE DRAFT INTO PURE JSON ==
            setAgentStatus('formatting');

            const formattingPrompt = `You are a data formatting expert. Your sole task is to take the following text, which contains a JSON object possibly surrounded by markdown fences or other text, and extract ONLY the raw, valid JSON object.

- Remove any markdown fences (like \`\`\`json or \`\`\`).
- Remove any explanatory text before or after the JSON object.
- The output MUST be a single, clean, valid JSON object and nothing else.

Input Text:
---
${rawReportContent}
---

Cleaned JSON Output:`;

            const responseSchema = {
                type: GeminiType.OBJECT,
                properties: {
                    overallScore: { type: GeminiType.NUMBER },
                    scoreBasis: { type: GeminiType.STRING },
                    annotations: {
                        type: GeminiType.ARRAY,
                        items: {
                            type: GeminiType.OBJECT,
                            properties: {
                                text: { type: GeminiType.STRING },
                                type: { type: GeminiType.STRING, enum: ['GOOD', 'ERROR', 'SUGGESTION'] },
                                explanation: { type: GeminiType.STRING },
                            },
                            required: ['text', 'type', 'explanation']
                        }
                    }
                },
                required: ['overallScore', 'scoreBasis', 'annotations']
            };

            const cleanedJsonString = await generateContent({
                prompt: formattingPrompt,
                jsonSchema: responseSchema, // This helps Gemini and is used for Zhipu's response_format
                timeout: 15000 // Shorter timeout for a simple formatting task
            });
            
            const data: CorrectionResponse = JSON.parse(cleanedJsonString.trim());
            setResult(data);

        } catch (e) {
            console.error("Error generating correction:", e);
            if (e instanceof SyntaxError) {
                setError(`AI返回的格式有误，无法解析。这通常是暂时的网络或模型问题。`);
            } else if (e instanceof Error && e.message.includes('empty response')) {
                 setError("AI未能生成报告初稿，可能是内容触发了安全规则，请修改后重试。");
            }
            else {
                setError("抱歉，AI批改时遇到问题。请稍后再试或检查你的文本内容。");
            }
        } finally {
            setIsLoading(false);
            setAgentStatus('idle');
        }
    };

    const handleAnnotationClick = (annotation: AnnotationWithIndex, event: React.MouseEvent<HTMLSpanElement>) => {
        if (activeTooltip && activeTooltip.annotation.key === annotation.key) {
            setActiveTooltip(null);
            return;
        }

        if (!resultContainerRef.current) return;
        const spanRect = event.currentTarget.getBoundingClientRect();
        const containerRect = resultContainerRef.current.getBoundingClientRect();

        const position = {
            top: spanRect.top - containerRect.top - 10,
            left: spanRect.left - containerRect.left + spanRect.width / 2,
        };
        
        setActiveTooltip({ annotation, position });
    };

    const renderAnnotatedText = () => {
        if (!result) return <p className="whitespace-pre-wrap">{inputText}</p>;

        const { annotations } = result;
        const text = inputText;

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

    const getLoadingStatusText = (): string | undefined => {
        if (agentStatus === 'formatting') return 'AI 正在整理报告格式...';
        if (agentStatus === 'generating' && !thinkingText && getAiProvider() === 'gemini') {
            return 'AI 正在撰写报告初稿... (Gemini)';
        }
        // For Zhipu, the "thinkingText" will appear, so no status text is needed initially.
        return undefined;
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
                        if (e.target === e.currentTarget) {
                           setActiveTooltip(null);
                        }
                    }}
                >
                    {isLoading && (
                       <LoadingOverlay
                            thinkingText={agentStatus === 'generating' && thinkingText ? thinkingText : undefined}
                            statusText={getLoadingStatusText()}
                            showFunFacts={false}
                        />
                    )}
                    
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