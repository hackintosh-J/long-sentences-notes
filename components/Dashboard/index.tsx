import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Type as GeminiType } from "@google/genai";
import { DAILY_NOTES, FUN_FACTS } from '../../constants';
import { FALLBACK_BRIEFING_CONTENTS, FALLBACK_SENTENCE_DATA } from '../../constants/fallbackContent';
import { generateContent, generateContentStream, getAiProvider } from '../../services/aiService';
import { 
    BookIcon, PoliticsIcon, MedicineIcon, SparklesIcon, ClockIcon, JournalIcon, PuzzleIcon,
    RefreshIcon, SpinnerIcon, FeatherIcon, LightbulbIcon, TranslationIcon, BrainCircuitIcon
} from '../icons';
import type { Page, SentenceAnalysisData } from '../../types';
import { getRandomItem } from '../../utils/helpers';
import SimpleMarkdownRenderer from '../common/SimpleMarkdownRenderer';
import LoadingOverlay from './LoadingOverlay';
import ModuleCard from './ModuleCard';
import BriefingCard from './BriefingCard';
import SentenceAnalysisCard from './SentenceAnalysisCard';
import Brainstorm from './Brainstorm';
import MarkdownRenderer from '../common/MarkdownRenderer';


interface DashboardProps {
  onNavigate: (page: Page) => void;
}

// --- Type Definitions for AI Content ---
type BriefingContent = {
    focus: string;
    clarification: string;
    word: string;
};
type BriefingCache = { content: BriefingContent, dailyNote: string, timestamp: number };
type QuestionCache = { content: string, timestamp: number };
type SentenceCache = { content: SentenceAnalysisData, timestamp: number };

// --- Main Dashboard Component ---
const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const briefingRef = useRef<HTMLDivElement>(null);
    
    // AI Briefing State
    const [briefingCache, setBriefingCache] = useState<BriefingCache | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);
    const [briefingThinkingText, setBriefingThinkingText] = useState('');
    const [isBriefingThinkingComplete, setIsBriefingThinkingComplete] = useState(false);

    
    // AI Question State
    const [questionCache, setQuestionCache] = useState<QuestionCache | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [streamedQuestion, setStreamedQuestion] = useState("");
    const [showQuestionAnswer, setShowQuestionAnswer] = useState(false);

    // AI Sentence State
    const [sentenceCache, setSentenceCache] = useState<SentenceCache | null>(null);
    const [isSentenceLoading, setIsSentenceLoading] = useState(false);
    
    // --- Initialization ---
    useEffect(() => {
        try {
            const cachedBriefing = localStorage.getItem('aiDashboardBriefing');
            if (cachedBriefing) setBriefingCache(JSON.parse(cachedBriefing));

            const cachedQuestion = localStorage.getItem('aiDashboardQuestion');
            if (cachedQuestion) setQuestionCache(JSON.parse(cachedQuestion));

            const cachedSentence = localStorage.getItem('aiDashboardSentence');
            if (cachedSentence) {
                 setSentenceCache(JSON.parse(cachedSentence));
            } else {
                fetchBriefing(true); // Fetch all if sentence is missing
            }
        } catch (error) { console.error("Failed to read from localStorage", error); }
    }, []);
    
    // --- AI Fetching and Caching Logic ---
    const fetchBriefing = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh) return;
        
        setIsBriefingLoading(true);
        setIsSentenceLoading(true);
        setBriefingThinkingText('');
        setIsBriefingThinkingComplete(getAiProvider() === 'gemini');

        const prompts = {
            focus: `请随机列出2-3个针对中国考研西医综合或政治的、高度具体的核心复习概念。使用项目符号。要求极简(总共50字以内)。确保每次请求都返回不同的随机结果。例如:\n- 心脏周期\n- 矛盾的同一性`,
            clarification: `请随机主动选择一对中国考研(政治或西医综合)中极易混淆的概念，并用一句话解释其核心区别。要求极简(80字以内)，并确保每次请求都返回不同的随机结果。用Markdown **加粗** 关键概念。例如: **意识**与**物质**: 物质决定意识，意识是物质的反映。`,
            word: `请随机提供一个与学术阅读(如考研英语)相关的高阶英语单词。确保每次请求都返回不同的随机结果。格式如下:\n**单词**\nEN: [简短英文释义]\nZH: [简短中文释义]\nEx: [简短例句]。整体回答必须非常简短。`,
            sentence: `
Please create a "Sentence of the Day" for a Chinese student preparing for the postgraduate entrance exam (考研英语). The sentence should be a complex long sentence from a real exam paper or of similar difficulty.
Your response MUST be a single JSON object. Do not include any text outside of the JSON object.
All "explanation" fields must be in CHINESE.`
        };

        const combinedPrompt = `为一款中国考研学习App生成三段独立、简洁、且每次请求都确保随机性的内容。严格按照指定的分隔符开始每个部分，并严格遵守各部分的格式和字数限制。

|||FOCUS|||
${prompts.focus}

|||CLARIFICATION|||
${prompts.clarification}

|||WORD|||
${prompts.word}`;

        const sentenceResponseSchema = {
            type: GeminiType.OBJECT,
            properties: {
                sentence: { type: GeminiType.STRING },
                translation: { type: GeminiType.STRING },
                components: {
                    type: GeminiType.ARRAY,
                    items: {
                        type: GeminiType.OBJECT,
                        properties: {
                            text: { type: GeminiType.STRING },
                            type: { type: GeminiType.STRING, enum: ['subject', 'predicate', 'object', 'attributive', 'adverbial', 'complement', 'clause', 'phrase', 'connective'] },
                            explanation: { type: GeminiType.STRING },
                        },
                        required: ['text', 'type', 'explanation']
                    }
                }
            },
            required: ['sentence', 'translation', 'components']
        };

        const TIMEOUT_DURATION = 20000;
        const provider = getAiProvider();
        
        const sentencePromise = generateContent({ prompt: prompts.sentence, jsonSchema: sentenceResponseSchema, timeout: TIMEOUT_DURATION });

        const briefingPromise = (async () => {
            if (provider === 'zhipu') {
                let fullText = "";
                const stream = generateContentStream(combinedPrompt, TIMEOUT_DURATION);
                let thinkingDone = false;
                for await (const chunk of stream) {
                    if (chunk.parsed) {
                        if (chunk.parsed.type === 'thinking') {
                            setBriefingThinkingText(prev => prev + chunk.parsed.content);
                        } else {
                             if (!thinkingDone) {
                                setIsBriefingThinkingComplete(true);
                                thinkingDone = true;
                            }
                            fullText += chunk.parsed.content;
                        }
                    }
                }
                setIsBriefingThinkingComplete(true);
                return fullText;
            } else {
                return generateContent({ prompt: combinedPrompt, timeout: TIMEOUT_DURATION });
            }
        })();


        try {
            const [briefingResult, sentenceResult] = await Promise.allSettled([briefingPromise, sentencePromise]);

            // Handle Briefing Result
            if (briefingResult.status === 'fulfilled' && briefingResult.value) {
                const briefingResponseText = briefingResult.value;
                const fullText = briefingResponseText;
                const focusMatch = fullText.match(/\|\|\|FOCUS\|\|\|([\s\S]*?)(?=\|\|\|CLARIFICATION\|\|\||$)/);
                const clarificationMatch = fullText.match(/\|\|\|CLARIFICATION\|\|\|([\s\S]*?)(?=\|\|\|WORD\|\|\||$)/);
                const wordMatch = fullText.match(/\|\|\|WORD\|\|\|([\s\S]*)/);
                
                const newContent: BriefingContent = {
                    focus: focusMatch ? focusMatch[1].trim() : '加载失败，请刷新。',
                    clarification: clarificationMatch ? clarificationMatch[1].trim() : '加载失败，请刷新。',
                    word: wordMatch ? wordMatch[1].trim() : '加载失败，请刷新。',
                };
                const newCache: BriefingCache = {
                    content: newContent,
                    dailyNote: getRandomItem(DAILY_NOTES),
                    timestamp: Date.now()
                };
                setBriefingCache(newCache);
                localStorage.setItem('aiDashboardBriefing', JSON.stringify(newCache));
            } else {
                // FIX: Check promise status before accessing 'reason' to resolve type error.
                if (briefingResult.status === 'rejected') {
                    console.warn('Briefing generation failed:', briefingResult.reason);
                } else {
                    console.warn('Briefing generation failed: Received empty content.');
                }
                const fallbackContent = getRandomItem(FALLBACK_BRIEFING_CONTENTS);
                const newCache: BriefingCache = {
                    content: fallbackContent,
                    dailyNote: getRandomItem(DAILY_NOTES),
                    timestamp: Date.now()
                };
                setBriefingCache(newCache);
                localStorage.setItem('aiDashboardBriefing', JSON.stringify(newCache));
            }
            setIsBriefingLoading(false);

            // Handle Sentence Result
            if (sentenceResult.status === 'fulfilled' && sentenceResult.value) {
                const sentenceData: SentenceAnalysisData = JSON.parse(sentenceResult.value.trim());
                const newSentenceCache: SentenceCache = { content: sentenceData, timestamp: Date.now() };
                setSentenceCache(newSentenceCache);
                localStorage.setItem('aiDashboardSentence', JSON.stringify(newSentenceCache));
            } else {
                // FIX: Check promise status before accessing 'reason' to resolve type error.
                if (sentenceResult.status === 'rejected') {
                    console.warn('Sentence generation failed:', sentenceResult.reason);
                } else {
                    console.warn('Sentence generation failed: Received empty content.');
                }
                const fallbackSentence = getRandomItem(FALLBACK_SENTENCE_DATA);
                const newSentenceCache: SentenceCache = { content: fallbackSentence, timestamp: Date.now() };
                setSentenceCache(newSentenceCache);
                localStorage.setItem('aiDashboardSentence', JSON.stringify(newSentenceCache));
            }
        } catch (err) {
            console.error("An unexpected error occurred during AI fetch:", err);
        } finally {
            setIsBriefingLoading(false);
            setIsSentenceLoading(false);
        }
    }, [sentenceCache]);

    const fetchQuestion = useCallback(async () => {
        setIsQuestionLoading(true);
        setShowQuestionAnswer(false);
        setStreamedQuestion("");
        setQuestionCache(null);
        
        const subject = Math.random() > 0.5 ? '西医综合306' : '考研政治';
        const prompt = `As an expert in China's graduate school entrance exams for ${subject}, create one challenging multiple-choice question about a core concept. Provide four options (A, B, C, D). IMPORTANT: Do NOT bold, star, or otherwise emphasize the correct answer within the question or options. Use markdown for general emphasis if needed. Then, on a new line after a separator "=====", provide the correct answer and a detailed explanation for why the correct answer is right and the others are wrong. The entire response must be in Chinese.`;
        
        try {
            const responseStream = generateContentStream(prompt, 20000);
            
            let fullText = "";
            for await (const chunk of responseStream) {
                if (chunk.parsed && chunk.parsed.type === 'content' && chunk.parsed.content) {
                    fullText += chunk.parsed.content;
                    setStreamedQuestion(fullText);
                }
            }
            
            const newCache: QuestionCache = { content: fullText, timestamp: Date.now() };
            setQuestionCache(newCache);
            localStorage.setItem('aiDashboardQuestion', JSON.stringify(newCache));
        } catch (error) {
            console.error("Question generation failed:", error);
            if (error instanceof Error && error.message === 'timeout') {
                setStreamedQuestion("抱歉，题目生成超时，请稍后再试。=====");
            } else {
                setStreamedQuestion("抱歉，题目生成失败，请稍后再试。=====");
            }
        } finally {
             setIsQuestionLoading(false);
        }
    }, []);

    // --- Briefing Card Renderers ---
    const FocusRenderer = ({ content }: { content: string }) => {
        if (!content) return <div className="h-full bg-slate-200 rounded animate-pulse"></div>;
        const items = content.split('\n').map(s => s.trim()).filter(s => s.startsWith('- ') || s.startsWith('* '));
        return (
            <ul className="space-y-3 text-lg">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-green-600 font-bold mr-3 mt-1 text-xl">›</span>
                        <span className="text-slate-800">{item.substring(2)}</span>
                    </li>
                ))}
            </ul>
        );
    };
    
    const ClarificationRenderer = ({ content }: { content: string }) => {
        if (!content) return <div className="h-full bg-slate-200 rounded animate-pulse"></div>;
    
        const match = content.match(/\*\*(.*?)\*\*.*?\*\*(.*?)\*\*:\s*([\s\S]*)/);
    
        if (!match) {
            return (
                <div className="text-lg text-left">
                    <SimpleMarkdownRenderer text={content} highlightClassName="font-bold text-amber-800" />
                </div>
            );
        }
    
        const [, term1, term2, explanation] = match;
    
        const highlightExplanation = (text: string, t1: string, t2: string) => {
            const base1 = t1.replace('矛盾', '');
            const base2 = t2.replace('矛盾', '');
            
            const regex = new RegExp(`(${base1}|${base2})`, 'g');
            const parts = text.split(regex);
    
            return parts.map((part, index) => {
                if (part === base1) {
                    return <strong key={index} className="font-semibold text-green-700">{part}</strong>;
                }
                if (part === base2) {
                    return <strong key={index} className="font-semibold text-purple-700">{part}</strong>;
                }
                return part;
            });
        };
    
        return (
            <div className="text-left flex flex-col justify-center h-full text-lg">
                <p className="text-2xl tracking-tight mb-4">
                    <strong className="font-bold text-green-700">{term1}</strong>
                    <span className="font-semibold text-slate-600 mx-2">与</span>
                    <strong className="font-bold text-purple-700">{term2}</strong>
                </p>
                <div className="text-slate-700 leading-relaxed pt-4 border-t border-slate-200/80">
                    {highlightExplanation(explanation, term1, term2)}
                </div>
            </div>
        );
    };

    const WordRenderer = ({ content }: { content: string }) => {
        if (!content) return <div className="h-full bg-slate-200 rounded animate-pulse"></div>;

        const lines = content.split('\n').filter(line => line.trim() !== '');
        const wordLine = lines[0] || '';
        const enLine = lines.find(l => l.toUpperCase().startsWith('EN:')) || '';
        const zhLine = lines.find(l => l.toUpperCase().startsWith('ZH:')) || '';
        const exLine = lines.find(l => l.toUpperCase().startsWith('EX:')) || '';
        
        const word = wordLine.replace(/\*\*/g, '');
        const en = enLine.replace(/EN:/i, '').trim();
        const zh = zhLine.replace(/ZH:/i, '').trim();
        const ex = exLine.replace(/Ex:/i, '').trim();

        const highlightWordInSentence = (sentence: string, wordToHighlight: string) => {
            if (!sentence || !wordToHighlight) return sentence;
            const regex = new RegExp(`\\b(${wordToHighlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'gi');
            const parts = sentence.split(regex);
            return parts.map((part, i) =>
                i % 2 === 1 ? (
                    <strong key={i} className="text-sky-700 font-bold bg-sky-100/80 px-1 rounded">{part}</strong>
                ) : (
                    part
                )
            );
        };

        return (
            <div>
                <div className="mb-4">
                    <p className="text-4xl font-extrabold text-sky-800 tracking-tight">{word}</p>
                    <p className="font-semibold text-sky-600 text-2xl mt-1">{zh}</p>
                </div>
                <div className="pt-3 border-t border-sky-200/80 space-y-2 text-lg">
                    {en && <p className="text-slate-600"><strong className="font-semibold text-slate-800">英文释义:</strong> {en}</p>}
                    {ex && <p className="text-slate-600"><strong className="font-semibold text-slate-800">例句:</strong> {highlightWordInSentence(ex, word)}</p>}
                </div>
            </div>
        );
    };

    const renderQuestion = () => {
        const contentToRender = streamedQuestion || questionCache?.content;

        if (!contentToRender && !isQuestionLoading) {
            return <p className="text-slate-500 text-sm mt-4">点击上方按钮，生成一道题目来检验学习成果吧！</p>;
        }
        
        if (!contentToRender) return null;

        const [questionPart, answerPart] = contentToRender.split('=====');
        return (
            <div className="mt-4 space-y-4">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                   <MarkdownRenderer text={questionPart?.trim() || ''} />
                   {isQuestionLoading && <span className="inline-block animate-blink">▋</span>}
                </div>
                {!isQuestionLoading && contentToRender.includes("=====") && (
                    <button onClick={() => setShowQuestionAnswer(!showQuestionAnswer)} className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-200">
                        {showQuestionAnswer ? '隐藏答案' : '显示答案'}
                    </button>
                )}
                {showQuestionAnswer && (
                    <div className="p-4 bg-slate-50 rounded-lg border animate-fadeIn">
                        <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                            <MarkdownRenderer text={answerPart?.trim() || '答案解析加载失败。'} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Module Navigation */}
            <div>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">功能模块</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <ModuleCard 
                        icon={<ClockIcon className="h-8 w-8 text-white" />}
                        title="专注花园"
                        description="用专注浇灌，让花园成长"
                        color="from-green-400 to-cyan-500"
                        onClick={() => onNavigate('focus_garden')}
                    />
                     <ModuleCard 
                        icon={<JournalIcon className="h-8 w-8 text-white" />}
                        title="心情日历"
                        description="记录心情，AI为你提供专属建议"
                        color="from-indigo-400 to-violet-500"
                        onClick={() => onNavigate('mood_journal')}
                    />
                    <ModuleCard 
                        icon={<BookIcon className="h-8 w-8 text-white" />}
                        title="英语作文批改"
                        description="AI 智能批改，提升写作水平"
                        color="from-sky-400 to-blue-500"
                        onClick={() => onNavigate('english')}
                    />
                    <ModuleCard 
                        icon={<PoliticsIcon className="h-8 w-8 text-white" />}
                        title="政治速记卡"
                        description="重点概念，轻松掌握"
                        color="from-red-400 to-rose-500"
                        onClick={() => onNavigate('politics')}
                    />
                    <ModuleCard 
                        icon={<MedicineIcon className="h-8 w-8 text-white" />}
                        title="西综计算模拟"
                        description="生化代谢，在线演算"
                        color="from-teal-400 to-emerald-500"
                        onClick={() => onNavigate('medicine')}
                    />
                     <ModuleCard 
                        icon={<PuzzleIcon className="h-8 w-8 text-white" />}
                        title="趣味记忆牌"
                        description="翻转卡片，挑战你的记忆力"
                        color="from-amber-400 to-orange-500"
                        onClick={() => onNavigate('memory_game')}
                    />
                </div>
            </div>

            {/* AI Briefing Section */}
            <div ref={briefingRef} className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                {(isBriefingLoading || isSentenceLoading) && <LoadingOverlay thinkingText={briefingThinkingText} isThinkingComplete={isBriefingThinkingComplete}/>}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-700">AI 速递</h2>
                    <button onClick={() => fetchBriefing(true)} disabled={isBriefingLoading || isSentenceLoading} className="flex items-center gap-2 bg-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-full hover:bg-slate-300 transition text-sm disabled:opacity-50">
                        <RefreshIcon className="h-4 w-4"/> 刷新
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 items-start">
                         <BriefingCard title="今日重点" icon={<FeatherIcon className="h-6 w-6 mr-2 text-green-500"/>}>
                            <FocusRenderer content={briefingCache?.content.focus || ''} />
                         </BriefingCard>
                         <BriefingCard title="每日寄语" icon={<SparklesIcon className="h-6 w-6 mr-2 text-rose-500"/>} isNote={true}>
                            {briefingCache ? (
                                <div className="text-xl leading-relaxed text-left">
                                    {briefingCache.dailyNote.replace('考研人的每日寄语：', '').split(/(?<=[，。！？、；：])/)
                                      .filter(s => s.trim())
                                      .map((line, index) => (
                                        <span key={index} className="block opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 200}ms` }}>{line.trim()}</span>
                                    ))}
                                </div>
                            ) : <div className="h-full bg-slate-200 rounded animate-pulse"></div>}
                         </BriefingCard>
                    </div>
                     <BriefingCard title="每日长难句" icon={<BookIcon className="h-6 w-6 mr-2 text-purple-500"/>}>
                        <SentenceAnalysisCard data={sentenceCache?.content} isLoading={isSentenceLoading} />
                     </BriefingCard>
                     <BriefingCard title="概念辨析" icon={<LightbulbIcon className="h-6 w-6 mr-2 text-amber-500"/>} className="min-h-0">
                        <ClarificationRenderer content={briefingCache?.content.clarification || ''} />
                     </BriefingCard>
                     <BriefingCard title="每日一词" icon={<TranslationIcon className="h-6 w-6 mr-2 text-sky-500"/>}>
                        <WordRenderer content={briefingCache?.content.word || ''} />
                     </BriefingCard>
                </div>
            </div>

            {/* AI Brainstorm Section */}
            <Brainstorm />
            
            {/* AI Daily Question Section */}
            <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                {isQuestionLoading && !streamedQuestion && <LoadingOverlay showFunFacts={false} isThinkingComplete={true} />}
                <h3 className="flex items-center text-xl font-bold text-slate-700 mb-4">
                    <BookIcon className="h-6 w-6 mr-2 text-indigo-500"/>
                    知识点自测
                </h3>
                <button onClick={fetchQuestion} disabled={isQuestionLoading} className="w-full sm:w-auto bg-indigo-500 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2">
                    {isQuestionLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在出题...</> : (questionCache || streamedQuestion ? '换一道题' : '开始自测')}
                </button>
                {renderQuestion()}
            </div>
        </div>
    );
};

export default Dashboard;