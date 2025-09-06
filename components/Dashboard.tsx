import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY_B64 } from '../apiKey';
import { DAILY_NOTES, FUN_FACTS } from '../constants';
import { 
    BookIcon, PoliticsIcon, MedicineIcon, SparklesIcon, ClockIcon, JournalIcon, PuzzleIcon,
    RefreshIcon, SpinnerIcon, FeatherIcon, LightbulbIcon, TranslationIcon
} from './icons';
import type { Page } from '../types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

// --- Helper Functions and Components ---
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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
    const [funFact, setFunFact] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    
    // AI Briefing State
    const [briefingCache, setBriefingCache] = useState<BriefingCache | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);
    const [loadingFunFact, setLoadingFunFact] = useState(getRandomItem(FUN_FACTS));
    
    // AI Question State
    const [questionCache, setQuestionCache] = useState<QuestionCache | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
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

        const subject = Math.random() > 0.5 ? '西医综合306' : '考研政治';
        const prompt = `As an expert in China's graduate school entrance exams for ${subject}, create one challenging multiple-choice question about a core concept. Provide four options (A, B, C, D). Use markdown for emphasis (e.g., **bold**). Then, on a new line after a separator "=====", provide the correct answer and a detailed explanation for why the correct answer is right and the others are wrong. The entire response must be in Chinese.`;
        
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const newCache: QuestionCache = { content: response.text, timestamp: Date.now() };
            setQuestionCache(newCache);
            localStorage.setItem('aiDashboardQuestion', JSON.stringify(newCache));
        } catch (error) {
            console.error("Question generation failed:", error);
        } finally {
            setIsQuestionLoading(false);
        }
    }, [ai]);

    const renderQuestion = () => {
        if (!questionCache?.content) return <p className="text-slate-500 text-sm">点击上方按钮，生成一道题目来检验学习成果吧！</p>;
        
        const [questionPart, answerPart] = questionCache.content.split('=====');
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <BriefingCard title="今日重点" icon={<FeatherIcon className="h-5 w-5 mr-2 text-green-500"/>} content={briefingCache?.content.focus} />
                     <BriefingCard title="概念辨析" icon={<LightbulbIcon className="h-5 w-5 mr-2 text-amber-500"/>} content={briefingCache?.content.clarification} />
                     <BriefingCard title="每日一词" icon={<TranslationIcon className="h-5 w-5 mr-2 text-sky-500"/>} content={briefingCache?.content.word} />
                     <BriefingCard title="每日寄语" icon={<SparklesIcon className="h-5 w-5 mr-2 text-rose-500"/>} content={briefingCache?.dailyNote.replace('考研人的每日寄语：', '')} isNote={true}/>
                </div>
            </div>

            {/* AI Daily Question Section */}
            <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                {isQuestionLoading && <LoadingOverlay funFact={loadingFunFact} />}
                <h3 className="flex items-center text-xl font-bold text-slate-700 mb-4">
                    <BookIcon className="h-6 w-6 mr-2 text-indigo-500"/>
                    知识点自测
                </h3>
                <button onClick={fetchQuestion} disabled={isQuestionLoading || !ai} className="w-full sm:w-auto bg-indigo-500 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2">
                    {isQuestionLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在出题...</> : (questionCache ? '换一道题' : '开始自测')}
                </button>
                {renderQuestion()}
            </div>


            {/* Fun Fact Corner */}
            <div>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">知识角落</h2>
                 <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 text-center">
                    <SparklesIcon className="h-10 w-10 text-amber-500 mx-auto mb-3"/>
                    <p className="text-slate-600 mb-4">学习累了？来点有趣的知识放松一下吧！</p>
                    <button onClick={() => setFunFact(getRandomItem(FUN_FACTS))} className="bg-amber-500 text-white font-bold py-2 px-6 rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-105">
                        获取趣味小知识
                    </button>
                    {funFact && <p className="text-slate-700 mt-4 p-4 bg-amber-50 rounded-lg animate-fadeIn leading-relaxed">{renderFunFactWithHighlight(funFact)}</p>}
                 </div>
            </div>
        </div>
    );
};

// --- Sub-components for Dashboard ---
interface ModuleCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    onClick?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, color, onClick }) => {
    const cardClasses = `relative group p-6 rounded-2xl text-white overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer h-full flex flex-col justify-between`;
    return (
        <div className={cardClasses} onClick={onClick}>
            <div className={`absolute inset-0 bg-gradient-to-br ${color} transition-transform duration-300 group-hover:scale-110`}></div>
            <div className="relative z-10">
                <div className="mb-3">{icon}</div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm opacity-80 mt-1">{description}</p>
            </div>
        </div>
    );
};

interface BriefingCardProps {
    title: string;
    icon: React.ReactNode;
    content?: string;
    isNote?: boolean;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ title, icon, content, isNote = false }) => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 min-h-[14rem] flex flex-col">
        <h4 className="flex items-center text-md font-bold text-slate-700 mb-3">{icon}{title}</h4>
        <div className={`whitespace-pre-wrap leading-relaxed text-sm flex-grow ${isNote ? 'text-rose-800 font-semibold' : 'text-slate-800'}`}>
            {content ? <SimpleMarkdownRenderer text={content} /> : <div className="h-full bg-slate-200 rounded animate-pulse"></div>}
        </div>
    </div>
);

export default Dashboard;