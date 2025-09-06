import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY_B64 } from '../../apiKey';
import { DAILY_NOTES, FUN_FACTS } from '../../constants';
import { 
    BookIcon, PoliticsIcon, MedicineIcon, SparklesIcon, ClockIcon, JournalIcon, PuzzleIcon,
    RefreshIcon, SpinnerIcon, FeatherIcon, LightbulbIcon, TranslationIcon
} from '../icons';
import type { Page } from '../../types';
import { getRandomItem } from '../../utils/helpers';
import SimpleMarkdownRenderer from '../common/SimpleMarkdownRenderer';
import LoadingOverlay from './LoadingOverlay';
import ModuleCard from './ModuleCard';
import BriefingCard from './BriefingCard';

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

// --- Main Dashboard Component ---
const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    
    // AI Briefing State
    const [briefingCache, setBriefingCache] = useState<BriefingCache | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);
    const [loadingFunFact, setLoadingFunFact] = useState(getRandomItem(FUN_FACTS));
    
    // AI Question State
    const [questionCache, setQuestionCache] = useState<QuestionCache | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [streamedQuestion, setStreamedQuestion] = useState("");
    const [showQuestionAnswer, setShowQuestionAnswer] = useState(false);
    
    // --- Initialization ---
    useEffect(() => {
        try {
            const apiKey = atob(GEMINI_API_KEY_B64);
            setAi(new GoogleGenAI({ apiKey }));
        } catch (e) { console.error("Failed to initialize GoogleGenAI:", e); }

        try {
            const cachedBriefing = localStorage.getItem('aiDashboardBriefing');
            if (cachedBriefing) setBriefingCache(JSON.parse(cachedBriefing));
            else setIsBriefingLoading(true); // Fetch only if no cache

            const cachedQuestion = localStorage.getItem('aiDashboardQuestion');
            if (cachedQuestion) setQuestionCache(JSON.parse(cachedQuestion));
        } catch (error) { console.error("Failed to read from localStorage", error); }
    }, []);

    useEffect(() => {
        if (isBriefingLoading && ai) fetchBriefing();
    }, [isBriefingLoading, ai]);
    
    // --- AI Fetching and Caching Logic ---
    const fetchBriefing = useCallback(async (forceRefresh = false) => {
        if (!ai || (!forceRefresh && briefingCache)) return;
        
        setIsBriefingLoading(true);
        setLoadingFunFact(getRandomItem(FUN_FACTS));

        const prompts = {
            focus: `列出2-3个针对中国考研西医综合或政治的、高度具体的核心复习概念。使用项目符号。要求极简(总共50字以内)。例如:\n- 心脏周期\n- 矛盾的同一性`,
            clarification: `主动选择一对中国考研(政治或西医综合)中极易混淆的概念，并用一句话解释其核心区别。要求极简(80字以内)。用Markdown **加粗** 关键概念。例如: **意识**与**物质**: 物质决定意识，意识是物质的反映。`,
            word: `提供一个与学术阅读(如考研英语)相关的高阶英语单词。格式如下:\n**单词**\nEN: [简短英文释义]\nZH: [简短中文释义]\nEx: [简短例句]。整体回答必须非常简短。`
        };

        const combinedPrompt = `为一款中国考研学习App生成三段独立、简洁的内容。严格按照指定的分隔符开始每个部分，并严格遵守各部分的格式和字数限制。

|||FOCUS|||
${prompts.focus}

|||CLARIFICATION|||
${prompts.clarification}

|||WORD|||
${prompts.word}`;

        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: combinedPrompt });
            const fullText = response.text;

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
        } catch (err) {
            console.error("Briefing generation failed:", err);
        } finally {
            setIsBriefingLoading(false);
        }
    }, [ai, briefingCache]);

    const fetchQuestion = useCallback(async () => {
        if (!ai) return;

        setIsQuestionLoading(true);
        setLoadingFunFact(getRandomItem(FUN_FACTS));
        setShowQuestionAnswer(false);
        setStreamedQuestion("");
        setQuestionCache(null);

        const subject = Math.random() > 0.5 ? '西医综合306' : '考研政治';
        const prompt = `As an expert in China's graduate school entrance exams for ${subject}, create one challenging multiple-choice question about a core concept. Provide four options (A, B, C, D). IMPORTANT: Do NOT bold, star, or otherwise emphasize the correct answer within the question or options. Use markdown for general emphasis if needed. Then, on a new line after a separator "=====", provide the correct answer and a detailed explanation for why the correct answer is right and the others are wrong. The entire response must be in Chinese.`;
        
        try {
            const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents: prompt });
            
            let fullText = "";
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    setStreamedQuestion(fullText);
                }
            }

            const newCache: QuestionCache = { content: fullText, timestamp: Date.now() };
            setQuestionCache(newCache);
            localStorage.setItem('aiDashboardQuestion', JSON.stringify(newCache));
        } catch (error) {
            console.error("Question generation failed:", error);
            setStreamedQuestion("抱歉，题目生成失败，请稍后再试。=====");
        } finally {
            setIsQuestionLoading(false);
        }
    }, [ai]);

    // --- Briefing Card Renderers ---
    const FocusRenderer = ({ content }: { content: string }) => {
        if (!content) return <div className="h-full bg-slate-200 rounded animate-pulse"></div>;
        const items = content.split('\n').map(s => s.trim()).filter(s => s.startsWith('- ') || s.startsWith('* '));
        return (
            <ul className="space-y-2 text-base">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-green-600 font-bold mr-3 mt-1 text-lg">›</span>
                        <span className="text-slate-800">{item.substring(2)}</span>
                    </li>
                ))}
            </ul>
        );
    };
    
    const ClarificationRenderer = ({ content }: { content: string }) => {
        if (!content) return <div className="h-full bg-slate-200 rounded animate-pulse"></div>;
        const parts = content.split(/:(.*)/s);
        const terms = parts[0] || '';
        const explanation = parts[1] || '';

        const termParts = terms.split(/(\*\*.*?\*\*)/g).filter(Boolean);

        return (
            <div>
                <div className="text-2xl font-bold mb-3">
                    {termParts.map((part, index) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                            <span key={index} className="text-amber-700">{part.slice(2, -2)}</span>
                        ) : (
                            <span key={index} className="text-slate-600">{part}</span>
                        )
                    )}
                </div>
                <p className="text-slate-800 text-lg leading-relaxed">{explanation.trim()}</p>
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
                    <p className="text-3xl font-extrabold text-sky-800 tracking-tight">{word}</p>
                    <p className="font-semibold text-sky-600 text-xl mt-1">{zh}</p>
                </div>
                <div className="pt-3 border-t border-sky-200/80 space-y-2 text-base">
                    {en && <p className="text-slate-600"><strong className="font-semibold text-slate-800">英文释义:</strong> {en}</p>}
                    {ex && <p className="text-slate-600"><strong className="font-semibold text-slate-800">例句:</strong> {highlightWordInSentence(ex, word)}</p>}
                </div>
            </div>
        );
    };

    const renderQuestion = () => {
        const contentToRender = (isQuestionLoading && streamedQuestion) ? streamedQuestion : questionCache?.content;

        if (!contentToRender) {
            if (!isQuestionLoading) {
                return <p className="text-slate-500 text-sm mt-4">点击上方按钮，生成一道题目来检验学习成果吧！</p>;
            }
            return null; // Loading overlay is active
        }
        
        const [questionPart, answerPart] = contentToRender.split('=====');
        return (
            <div className="mt-4 space-y-4">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                   <SimpleMarkdownRenderer text={questionPart?.trim() || ''} />
                </div>
                 <button onClick={() => setShowQuestionAnswer(!showQuestionAnswer)} className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-200">
                    {showQuestionAnswer ? '隐藏答案' : '显示答案'}
                </button>
                {showQuestionAnswer && (
                    <div className="p-4 bg-slate-50 rounded-lg border animate-fadeIn">
                        <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                            <SimpleMarkdownRenderer text={answerPart?.trim() || '答案解析加载失败。'} />
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
                        title="英语长难句"
                        description="攻克考研英语核心难点"
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
            <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                {isBriefingLoading && <LoadingOverlay funFact={loadingFunFact} />}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-700">AI 速递</h2>
                    <button onClick={() => fetchBriefing(true)} disabled={isBriefingLoading} className="flex items-center gap-2 bg-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-full hover:bg-slate-300 transition text-sm disabled:opacity-50">
                        <RefreshIcon className="h-4 w-4"/> 刷新
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <BriefingCard title="今日重点" icon={<FeatherIcon className="h-6 w-6 mr-2 text-green-500"/>}>
                        <FocusRenderer content={briefingCache?.content.focus || ''} />
                     </BriefingCard>
                     <BriefingCard title="每日寄语" icon={<SparklesIcon className="h-6 w-6 mr-2 text-rose-500"/>} isNote={true}>
                        {briefingCache ? <p className="text-lg leading-loose whitespace-pre-wrap text-center">{briefingCache.dailyNote.replace('考研人的每日寄语：', '')}</p> : <div className="h-full bg-slate-200 rounded animate-pulse"></div>}
                     </BriefingCard>
                     <BriefingCard title="概念辨析" icon={<LightbulbIcon className="h-6 w-6 mr-2 text-amber-500"/>}>
                        <ClarificationRenderer content={briefingCache?.content.clarification || ''} />
                     </BriefingCard>
                     <BriefingCard title="每日一词" icon={<TranslationIcon className="h-6 w-6 mr-2 text-sky-500"/>}>
                        <WordRenderer content={briefingCache?.content.word || ''} />
                     </BriefingCard>
                </div>
            </div>

            {/* AI Daily Question Section */}
            <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                {isQuestionLoading && !streamedQuestion && <LoadingOverlay funFact={loadingFunFact} />}
                <h3 className="flex items-center text-xl font-bold text-slate-700 mb-4">
                    <BookIcon className="h-6 w-6 mr-2 text-indigo-500"/>
                    知识点自测
                </h3>
                <button onClick={fetchQuestion} disabled={isQuestionLoading || !ai} className="w-full sm:w-auto bg-indigo-500 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2">
                    {isQuestionLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在出题...</> : (questionCache || streamedQuestion ? '换一道题' : '开始自测')}
                </button>
                {renderQuestion()}
            </div>
        </div>
    );
};

export default Dashboard;