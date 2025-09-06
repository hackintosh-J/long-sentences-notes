import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from './icons';
import type { Mood, MoodEntry } from '../types';


interface StudyAnalysisProps {
    onBack: () => void;
}

const MOODS_CONFIG: { [key in Mood]: { emoji: string; label: string; colors: string } } = {
    1: { emoji: '😞', label: '很糟糕', colors: 'bg-red-400' },
    2: { emoji: '😕', label: '不太好', colors: 'bg-orange-400' },
    3: { emoji: '😐', label: '一般般', colors: 'bg-yellow-400' },
    4: { emoji: '😊', label: '还不错', colors: 'bg-sky-400' },
    5: { emoji: '😄', label: '棒极了', colors: 'bg-green-400' },
};
const STORAGE_KEY = 'moodJournalEntries';

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <React.Fragment>
            {parts.map((part, index) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={index} className="font-bold text-amber-900">{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </React.Fragment>
    );
};

const StudyAnalysis: React.FC<StudyAnalysisProps> = ({ onBack }) => {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    useEffect(() => {
        try {
            const savedEntries = localStorage.getItem(STORAGE_KEY);
            if (savedEntries) {
                const parsedEntries: Record<string, MoodEntry> = JSON.parse(savedEntries);
                const sortedEntries = Object.values(parsedEntries).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setEntries(sortedEntries);
            }
        } catch (error) {
            console.error("Failed to load mood entries from localStorage", error);
        }

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set");
            }
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI:", e);
        }
    }, []);

    const stats = useMemo(() => {
        const totalDays = entries.length;
        const moodCounts: Record<Mood, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let longestPositiveStreak = 0;
        let currentPositiveStreak = 0;

        entries.forEach(entry => {
            moodCounts[entry.mood]++;
            if (entry.mood >= 4) {
                currentPositiveStreak++;
            } else {
                longestPositiveStreak = Math.max(longestPositiveStreak, currentPositiveStreak);
                currentPositiveStreak = 0;
            }
        });
        longestPositiveStreak = Math.max(longestPositiveStreak, currentPositiveStreak);
        
        const maxCount = Math.max(...Object.values(moodCounts));

        return { totalDays, moodCounts, longestPositiveStreak, maxCount };
    }, [entries]);

    useEffect(() => {
        const fetchAiSummary = async () => {
            if (!ai || entries.length < 5) {
                setIsLoadingSummary(false);
                return;
            }
            
            setIsLoadingSummary(true);
            setAiSummary('');

            const recentMoods = entries.slice(-30).map(e => e.mood).join(', ');
            const prompt = `You are a warm and insightful friend analyzing mood data for a student preparing for her postgraduate entrance exams in China. Her mood data for the last ${entries.length} days is: [${recentMoods}], where 5 is 'great' and 1 is 'awful'.
            Based on this data, provide:
            1. A short, positive, and encouraging summary of her emotional state (about 50-80 characters).
            2. One actionable, gentle suggestion to help her maintain a good state of mind (about 50-80 characters).
            Respond in Chinese. Use markdown for emphasis. Separate the summary and suggestion with '|||'.
            Example format: **总结:** [Your summary here]|||**小建议:** [Your suggestion here]`;

            try {
                const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents: prompt });
                for await (const chunk of responseStream) {
                    setAiSummary(prev => prev + chunk.text);
                }
            } catch (error) {
                console.error("AI summary generation failed:", error);
                setAiSummary("AI分析加载失败，但你的努力我们有目共睹，继续加油！");
            } finally {
                setIsLoadingSummary(false);
            }
        };

        fetchAiSummary();
    }, [ai, entries]);

    const [summaryPart, suggestionPart] = aiSummary.split('|||');

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300">
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>

            <div className="text-center">
                <h2 className="text-3xl font-bold text-amber-800 mb-2">学习分析</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">回顾这段时间的点滴，看见自己的坚持与成长。</p>
            </div>

            {entries.length < 5 ? (
                 <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 text-center">
                     <h3 className="text-xl font-semibold text-slate-700">数据不足</h3>
                     <p className="text-slate-500 mt-2">记录5天以上的心情后，就可以在这里看到你的专属学习分析报告啦！</p>
                 </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                            <h3 className="text-lg font-bold text-slate-700 mb-4">心情分布</h3>
                            <div className="space-y-3">
                                {([5, 4, 3, 2, 1] as Mood[]).map(moodValue => {
                                    const count = stats.moodCounts[moodValue];
                                    const percentage = stats.maxCount > 0 ? (count / stats.maxCount) * 100 : 0;
                                    const config = MOODS_CONFIG[moodValue];
                                    return (
                                        <div key={moodValue} className="flex items-center gap-3">
                                            <span className="text-2xl w-8">{config.emoji}</span>
                                            <div className="flex-1 bg-slate-200 rounded-full h-6">
                                                <div 
                                                    className={`h-6 rounded-full transition-all duration-500 ${config.colors}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-slate-600 w-12 text-right">{count} 天</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 text-center">
                                <p className="text-4xl font-bold text-green-600">{stats.totalDays}</p>
                                <p className="text-sm font-semibold text-slate-500 mt-1">总记录天数</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 text-center">
                                <p className="text-4xl font-bold text-sky-600">{stats.longestPositiveStreak}</p>
                                <p className="text-sm font-semibold text-slate-500 mt-1">最长积极天数 (😊/😄)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl shadow-lg border border-white/50">
                        <h3 className="flex items-center text-xl font-bold text-amber-900/80 mb-3">
                             <SparklesIcon className="h-6 w-6 mr-2 text-amber-600"/>
                             AI 智能总结
                        </h3>
                        {isLoadingSummary ? (
                            <div className="flex items-center text-amber-800/70">
                                <SpinnerIcon className="h-5 w-5 mr-2"/>
                                <span>正在为你生成专属分析报告...</span>
                            </div>
                        ) : (
                             <div className="space-y-2 text-amber-900/90 leading-relaxed animate-fadeIn">
                                {summaryPart && <p><SimpleMarkdownRenderer text={summaryPart.trim()} /></p>}
                                {suggestionPart && <p><SimpleMarkdownRenderer text={suggestionPart.trim()} /></p>}
                             </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudyAnalysis;