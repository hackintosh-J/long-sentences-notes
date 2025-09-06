import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArrowLeftIcon, LightbulbIcon, SparklesIcon, BookIcon, SpinnerIcon, RefreshIcon, TranslationIcon, FeatherIcon } from './icons';
import { GEMINI_API_KEY_B64 } from '../apiKey';

interface AiAssistantProps {
    onBack: () => void;
}

// A simple component to render text with markdown's bold syntax (**text**)
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <React.Fragment>
            {parts.map((part, index) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={index}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </React.Fragment>
    );
};

type BriefingContent = {
    focus: string;
    clarification: string;
    word: string;
    encouragement: string;
};

type BriefingLoading = {
    focus: boolean;
    clarification: boolean;
    word: boolean;
    encouragement: boolean;
};

const AiAssistant: React.FC<AiAssistantProps> = ({ onBack }) => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [decodedApiKey, setDecodedApiKey] = useState<string>('');

    // State for Briefing sections
    const [content, setContent] = useState<BriefingContent>({ focus: '', clarification: '', word: '', encouragement: '' });
    const [loading, setLoading] = useState<BriefingLoading>({ focus: false, clarification: false, word: false, encouragement: false });
    const [hasLoadedBriefing, setHasLoadedBriefing] = useState(false);
    const [error, setError] = useState<string>('');

    // State for Daily Question
    const [questionLoading, setQuestionLoading] = useState(false);
    const [questionResult, setQuestionResult] = useState('');
    const [questionError, setQuestionError] = useState('');
    const [showQuestionAnswer, setShowQuestionAnswer] = useState(false);

    useEffect(() => {
        try {
            const decodedKey = atob(GEMINI_API_KEY_B64);
            setDecodedApiKey(decodedKey);
            setAi(new GoogleGenAI({ apiKey: decodedKey }));
        } catch (e) {
            console.error("Failed to decode API key:", e);
            setError('API Key 配置错误，AI功能无法使用。');
            setDecodedApiKey('Error: Failed to decode the key from Base64.');
        }
    }, []);
    
    const PROMPTS = {
        focus: `List 2-3 highly specific, core concepts for review for the Chinese postgraduate entrance exams in Medicine (西医综合) or Politics. Use bullet points. Be extremely concise (under 50 Chinese characters total). Example: "- 心脏周期\n- 矛盾的同一性"`,
        clarification: `Proactively select one pair of easily confused concepts from the Chinese postgraduate entrance exams (Politics or Medicine) and explain their key difference in one sentence. Be extremely concise (under 80 Chinese characters). Use markdown for emphasis.`,
        word: `Provide one advanced English vocabulary word relevant to academic reading (like for the CRE exam). Format as: **Word**\nEN: [brief English definition]\nZH: [brief Chinese definition]\nEx: [a short example sentence]. The entire response must be very short.`,
        encouragement: `Write a very short, warm, and powerful message of encouragement (under 60 Chinese characters) for a female student stressed about her exams. Be original. Sign it as "**你的AI学习伙伴**".`
    };

    const runAllBriefingsAtOnce = useCallback(async () => {
        if (!ai) return;

        setHasLoadedBriefing(true);
        setLoading({ focus: true, clarification: true, word: true, encouragement: true });
        setContent({ focus: '', clarification: '', word: '', encouragement: '' });
        setError('');

        const combinedPrompt = `Generate four distinct, concise pieces of content for a Chinese postgraduate entrance exam study app. Use the specified separators before each section. Adhere to the constraints for each section.

|||FOCUS|||
${PROMPTS.focus}

|||CLARIFICATION|||
${PROMPTS.clarification}

|||WORD|||
${PROMPTS.word}

|||ENCOURAGEMENT|||
${PROMPTS.encouragement}
`;

        let currentSection: keyof BriefingContent | null = null;
        let buffer = '';
        const sections: (keyof BriefingContent)[] = ['focus', 'clarification', 'word', 'encouragement'];
        const separators = ['|||FOCUS|||', '|||CLARIFICATION|||', '|||WORD|||', '|||ENCOURAGEMENT|||'];

        try {
            const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash-lite', contents: combinedPrompt });

            for await (const chunk of responseStream) {
                buffer += chunk.text;

                if (!currentSection) {
                    for (let i = 0; i < separators.length; i++) {
                        if (buffer.includes(separators[i])) {
                            currentSection = sections[i];
                            buffer = buffer.substring(buffer.indexOf(separators[i]) + separators[i].length);
                            setLoading(prev => ({...prev, [currentSection as keyof BriefingContent]: false}));
                            break;
                        }
                    }
                }
                
                while (currentSection) {
                    const currentSectionIndex = sections.indexOf(currentSection);
                    const nextSeparator = currentSectionIndex < sections.length - 1 ? separators[currentSectionIndex + 1] : null;
                    const nextSection = currentSectionIndex < sections.length - 1 ? sections[currentSectionIndex + 1] : null;
                    
                    let separatorIndex = -1;
                    if (nextSeparator) {
                        separatorIndex = buffer.indexOf(nextSeparator);
                    }

                    if (nextSeparator && nextSection && separatorIndex !== -1) {
                        const contentForCurrent = buffer.substring(0, separatorIndex);
                        setContent(prev => ({ ...prev, [currentSection as keyof BriefingContent]: prev[currentSection as keyof BriefingContent] + contentForCurrent }));
                        
                        currentSection = nextSection;
                        buffer = buffer.substring(separatorIndex + nextSeparator.length);
                        setLoading(prev => ({...prev, [currentSection as keyof BriefingContent]: false}));
                    } else {
                        setContent(prev => ({ ...prev, [currentSection as keyof BriefingContent]: prev[currentSection as keyof BriefingContent] + buffer }));
                        buffer = '';
                        break;
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setError('内容加载失败，请检查网络或刷新重试。');
        } finally {
            setLoading({ focus: false, clarification: false, word: false, encouragement: false });
        }
    }, [ai, PROMPTS]);

    const handleGenerateQuestion = async () => {
        if (!ai) return;
        setQuestionLoading(true);
        setQuestionResult('');
        setQuestionError('');
        setShowQuestionAnswer(false);
        const subject = Math.random() > 0.5 ? '西医综合306' : '考研政治';
        const prompt = `As an expert in China's graduate school entrance exams for ${subject}, create one challenging multiple-choice question about a core concept. Provide four options (A, B, C, D). Use markdown for emphasis (e.g., **bold**). Then, on a new line after a separator "=====", provide the correct answer and a detailed explanation for why the correct answer is right and the others are wrong. The entire response must be in Chinese.`;

        try {
            const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash-lite', contents: prompt });
            for await (const chunk of responseStream) {
                setQuestionResult(prev => prev + chunk.text);
            }
        } catch (error) {
            console.error(error);
            setQuestionError('抱歉，出题小助手开小差了，请稍后再试。');
        } finally {
            setQuestionLoading(false);
        }
    };

    const renderQuestion = () => {
        if (!questionResult) return null;
        const [questionPart, answerPart] = questionResult.split('=====');
        return (
            <div className="mt-4 space-y-4">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                   <SimpleMarkdownRenderer text={questionPart?.trim() || ''} />
                </div>
                {answerPart !== undefined && (
                 <>
                    <button onClick={() => setShowQuestionAnswer(!showQuestionAnswer)} className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-200">
                        {showQuestionAnswer ? '隐藏答案' : '显示答案'}
                    </button>
                    {showQuestionAnswer && (
                        <div className="p-4 bg-slate-50 rounded-lg border animate-fadeIn">
                            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                                <SimpleMarkdownRenderer text={answerPart.trim()} />
                            </div>
                        </div>
                    )}
                 </>
                )}
            </div>
        );
    };

    const BriefingCard: React.FC<{
        title: string;
        icon: React.ReactNode;
        contentKey: keyof BriefingContent;
        className?: string;
    }> = ({ title, icon, contentKey, className }) => (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200/80 min-h-[12rem] flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h4 className="flex items-center text-md font-bold text-slate-700">{icon}{title}</h4>
            </div>
            {loading[contentKey] ? (
                 <div className="flex-grow flex items-center justify-center">
                    <SpinnerIcon className="h-6 w-6 text-slate-400"/>
                </div>
            ) : (
                <div className={`whitespace-pre-wrap leading-relaxed text-sm flex-grow ${className}`}>
                    <SimpleMarkdownRenderer text={content[contentKey]} />
                </div>
            )}
        </div>
    );

    const isBriefingLoading = Object.values(loading).some(Boolean);

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300">
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>
            
            <div className="text-center">
                <h2 className="text-3xl font-bold text-purple-800 mb-2">AI 助教</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">你的智能学习伙伴，点击按钮获取今日份的学习速递。</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs p-3 rounded-lg font-mono break-all">
                <strong>Decoded API Key (for debugging):</strong>
                <p>{decodedApiKey}</p>
            </div>

            <div className="flex justify-center">
                <button onClick={runAllBriefingsAtOnce} disabled={isBriefingLoading || !ai} className="bg-purple-500 text-white font-bold py-2.5 px-8 rounded-full hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg">
                    {isBriefingLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在加载...</> : (
                        <>
                            <RefreshIcon className="h-5 w-5" />
                            {hasLoadedBriefing ? '刷新速递' : '获取今日速递'}
                        </>
                    )}
                </button>
            </div>


            {hasLoadedBriefing && (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 animate-fadeIn">
                    <BriefingCard title="今日重点" icon={<FeatherIcon className="h-5 w-5 mr-2 text-green-500"/>} contentKey="focus" className="text-slate-800" />
                    <BriefingCard title="概念辨析" icon={<LightbulbIcon className="h-5 w-5 mr-2 text-amber-500"/>} contentKey="clarification" className="text-slate-800"/>
                    <BriefingCard title="每日一词" icon={<TranslationIcon className="h-5 w-5 mr-2 text-sky-500"/>} contentKey="word" className="text-slate-800"/>
                    <BriefingCard title="考前鼓励" icon={<SparklesIcon className="h-5 w-5 mr-2 text-rose-500"/>} contentKey="encouragement" className="text-rose-800 font-semibold"/>
                </div>
            )}
            {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}

            {/* Daily Question */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <h3 className="flex items-center text-xl font-bold text-slate-700 mb-4">
                    <BookIcon className="h-6 w-6 mr-2 text-indigo-500"/>
                    知识点自测
                </h3>
                <p className="text-sm text-slate-500 mb-4">准备好了吗？随机生成一道政治或西综的核心考点模拟题，检验你的学习成果。</p>
                <button onClick={handleGenerateQuestion} disabled={questionLoading || !ai} className="w-full sm:w-auto bg-indigo-500 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2">
                    {questionLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在出题...</> : (questionResult ? '换一道题' : '开始自测')}
                </button>
                {questionError && <p className="text-red-500 text-sm mt-4">{questionError}</p>}
                {!ai && <p className="text-amber-600 text-sm mt-4">AI 功能正在初始化，请稍候...</p>}
                {renderQuestion()}
            </div>
        </div>
    );
};

export default AiAssistant;