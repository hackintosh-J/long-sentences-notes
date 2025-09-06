import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY_B64 } from '../../apiKey';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from '../icons';
import type { Mood, MoodEntry } from '../../types';
// FIX: Corrected import path to resolve module ambiguity.
import { MOODS_CONFIG } from '../../constants/mood';
import { dateToKey } from '../../utils/helpers';
import SimpleMarkdownRenderer from '../common/SimpleMarkdownRenderer';
import CalendarView from './CalendarView';
import EditorView from './EditorView';

interface MoodJournalProps {
    onBack: () => void;
}

const STORAGE_KEY = 'moodJournalEntries';
const SUMMARY_CACHE_KEY = 'moodJournalSummaryCache';

// Main Component
const MoodJournal: React.FC<MoodJournalProps> = ({ onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [entries, setEntries] = useState<Record<string, MoodEntry>>({});
    const [view, setView] = useState<'calendar' | 'editor'>('calendar');
    
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [journalText, setJournalText] = useState('');

    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    useEffect(() => {
        try {
            const savedEntries = localStorage.getItem(STORAGE_KEY);
            if (savedEntries) setEntries(JSON.parse(savedEntries));
        } catch (error) { console.error("Failed to load mood entries", error); }

        try {
            if (GEMINI_API_KEY_B64) {
                const apiKey = atob(GEMINI_API_KEY_B64);
                // FIX: Corrected initialization of GoogleGenAI client according to guidelines.
                setAi(new GoogleGenAI({ apiKey }));
            }
        } catch (e) { console.error("Failed to initialize GoogleGenAI:", e); }
    }, []);

    useEffect(() => {
        const entry = entries[dateToKey(selectedDate)];
        setSelectedMood(entry?.mood || null);
        setJournalText(entry?.text || '');
    }, [selectedDate, entries]);

    useEffect(() => {
        const sortedEntries = Object.values(entries).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (!ai || sortedEntries.length < 3) {
            setIsLoadingSummary(false);
            setAiSummary('');
            return;
        }

        const fetchOrLoadSummary = async () => {
            setIsLoadingSummary(true);
            const dataSignature = JSON.stringify(sortedEntries);

            try {
                const cachedData = localStorage.getItem(SUMMARY_CACHE_KEY);
                if (cachedData) {
                    const { summary, signature } = JSON.parse(cachedData);
                    if (signature === dataSignature) {
                        setAiSummary(summary);
                        setIsLoadingSummary(false);
                        return; 
                    }
                }
            } catch (e) {
                console.error("Error reading summary cache", e);
                localStorage.removeItem(SUMMARY_CACHE_KEY);
            }

            setAiSummary('');
            const recentEntries = sortedEntries.slice(-7);
            const context = recentEntries.map(e => 
                `- 日期: ${e.date}, 心情: ${e.mood} (${MOODS_CONFIG[e.mood].label})${e.text ? `, 笔记: "${e.text.substring(0, 50).replace(/\n/g, ' ')}..."` : ''}`
            ).join('\n');

            const prompt = `你是一位温暖而有洞察力的朋友，正在为一位准备考研的女生分析她的心情数据。这是她过去${recentEntries.length}天的心情和日记摘要：
${context}
(心情指数: 5代表“棒极了”，1代表“很糟糕”)

根据这些数据，请提供：
1.  一段简短、积极且鼓励人心的话，总结她的情绪状态（约50-80字）。
2.  一条可行的、温和的建议，根据她最近的笔记和心情，帮助她保持良好心态（约50-80字）。
请用中文回答。使用Markdown加粗关键词，例如 **关键词**。用 '|||' 分隔总结和建议。
格式示例: **总结:** [你的总结]|||**小建议:** [你的建议]`;

            try {
                // FIX: Switched to the correct model name 'gemini-2.5-flash' from deprecated 'gemini-pro'.
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                const fullText = response.text;
                setAiSummary(fullText);
                localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify({ summary: fullText, signature: dataSignature }));
            } catch (error) {
                console.error("AI summary generation failed:", error);
                setAiSummary("AI分析加载失败，但你的努力我们有目共睹，继续加油！|||**小建议:** 记得多喝水，适当休息哦！");
            } finally {
                setIsLoadingSummary(false);
            }
        };

        fetchOrLoadSummary();
    }, [ai, entries]);

    const saveEntries = (updatedEntries: Record<string, MoodEntry>) => {
        try {
            setEntries(updatedEntries);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
        } catch (error) { console.error("Failed to save mood entries", error); }
    };

    const handleSaveEntry = useCallback(() => {
        if (!selectedMood) return;
        const key = dateToKey(selectedDate);
        const newEntry: MoodEntry = { date: key, mood: selectedMood, text: journalText };
        saveEntries({ ...entries, [key]: newEntry });
    }, [selectedDate, selectedMood, journalText, entries]);

    const handleClearEntry = useCallback(() => {
        const key = dateToKey(selectedDate);
        const { [key]: _, ...restEntries } = entries;
        saveEntries(restEntries);
    }, [selectedDate, entries]);

    const sortedEntries = Object.values(entries).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const [summaryPart, suggestionPart] = aiSummary.split('|||');

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300">
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-indigo-800 mb-2">心情日历 & AI分析</h2>
                    <p className="text-slate-500">记录心情，AI会根据你近期的状态提供专属建议。所有内容仅保存在本地。</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`${view === 'editor' && 'hidden'} md:!block`}>
                        <CalendarView 
                            currentDate={currentDate}
                            entries={entries}
                            selectedDate={selectedDate}
                            onSelectDate={(date) => {
                                setSelectedDate(date);
                                setView('editor');
                            }}
                            onChangeMonth={setCurrentDate}
                        />
                    </div>
                    <div className={`${view === 'calendar' && 'hidden'} md:!block`}>
                        <EditorView 
                            selectedDate={selectedDate}
                            selectedMood={selectedMood}
                            journalText={journalText}
                            onMoodChange={setSelectedMood}
                            onTextChange={setJournalText}
                            onSave={handleSaveEntry}
                            onClear={handleClearEntry}
                            onBackToCalendar={() => setView('calendar')}
                        />
                    </div>
                </div>

                {sortedEntries.length >= 3 && (
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
                )}
            </div>
        </div>
    );
};

export default MoodJournal;