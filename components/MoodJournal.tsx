import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY_B64 } from '../apiKey';
import { ArrowLeftIcon, TrashIcon, SparklesIcon, SpinnerIcon } from './icons';
import type { Mood, MoodEntry } from '../types';

interface MoodJournalProps {
    onBack: () => void;
}

const MOODS: { value: Mood; emoji: string; label: string; colors: { bg: string; text: string; ring: string; calendarBg: string; } }[] = [
    { value: 1, emoji: '😞', label: '很糟糕', colors: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-400', calendarBg: 'bg-red-400' } },
    { value: 2, emoji: '😕', label: '不太好', colors: { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-400', calendarBg: 'bg-orange-400' } },
    { value: 3, emoji: '😐', label: '一般般', colors: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-400', calendarBg: 'bg-yellow-400' } },
    { value: 4, emoji: '😊', label: '还不错', colors: { bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-400', calendarBg: 'bg-sky-400' } },
    { value: 5, emoji: '😄', label: '棒极了', colors: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-400', calendarBg: 'bg-green-400' } },
];

const MOODS_CONFIG: { [key in Mood]: { emoji: string; label: string; colors: string } } = {
    1: { emoji: '😞', label: '很糟糕', colors: 'bg-red-400' },
    2: { emoji: '😕', label: '不太好', colors: 'bg-orange-400' },
    3: { emoji: '😐', label: '一般般', colors: 'bg-yellow-400' },
    4: { emoji: '😊', label: '还不错', colors: 'bg-sky-400' },
    5: { emoji: '😄', label: '棒极了', colors: 'bg-green-400' },
};

const STORAGE_KEY = 'moodJournalEntries';
const SUMMARY_CACHE_KEY = 'moodJournalSummaryCache';
const dateToKey = (date: Date): string => date.toISOString().split('T')[0];


// Helper Components
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

const CalendarView: React.FC<{
    currentDate: Date;
    entries: Record<string, MoodEntry>;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onChangeMonth: (date: Date) => void;
}> = ({ currentDate, entries, selectedDate, onSelectDate, onChangeMonth }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="p-4 bg-slate-50 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => onChangeMonth(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-slate-200">&lt;</button>
                <h3 className="font-bold text-lg text-slate-700">{`${year}年 ${month + 1}月`}</h3>
                <button onClick={() => onChangeMonth(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-slate-200">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="font-semibold text-slate-500 py-2">{d}</div>)}
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const date = new Date(year, month, day);
                    const dateKey = dateToKey(date);
                    const entry = entries[dateKey];
                    const moodInfo = entry ? MOODS.find(m => m.value === entry.mood) : null;
                    const isSelected = dateToKey(selectedDate) === dateKey;

                    return (
                         <div key={day} className="relative aspect-square">
                            <button
                                onClick={() => onSelectDate(date)}
                                className={`absolute inset-0.5 flex items-center justify-center rounded-full transition-all duration-200
                                    ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                    ${moodInfo ? `${moodInfo.colors.calendarBg} text-white hover:opacity-80` : 'bg-slate-200 hover:bg-slate-300'}
                                `}
                            >
                                <span className={`absolute top-1 left-1.5 text-xs font-bold ${moodInfo ? 'text-white/80' : 'text-slate-500'}`}>{day}</span>
                                {moodInfo?.emoji && <span className="text-2xl mt-1">{moodInfo.emoji}</span>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EditorView: React.FC<{
    selectedDate: Date;
    selectedMood: Mood | null;
    journalText: string;
    onMoodChange: (mood: Mood) => void;
    onTextChange: (text: string) => void;
    onSave: () => void;
    onClear: () => void;
    onBackToCalendar: () => void;
}> = ({ selectedDate, selectedMood, journalText, onMoodChange, onTextChange, onSave, onClear, onBackToCalendar }) => (
    <div className="p-4 bg-slate-50 rounded-xl border flex flex-col h-full">
        <button onClick={onBackToCalendar} className="md:hidden flex items-center gap-2 text-sm font-semibold text-slate-600 mb-4 self-start bg-slate-200 px-3 py-1 rounded-full hover:bg-slate-300">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>返回日历</span>
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-1">记录 {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</h3>
        <p className="text-slate-500 text-sm mb-4">今天感觉怎么样？</p>

        <div className="grid grid-cols-5 gap-1 items-center mb-4">
            {MOODS.map(m => (
                <button 
                    key={m.value} 
                    onClick={() => onMoodChange(m.value)}
                    className={`flex flex-col items-center gap-1.5 p-1 rounded-lg transition-all transform hover:scale-110 focus:outline-none ${selectedMood === m.value ? `ring-2 ${m.colors.ring}` : ''}`}
                >
                    <span className="text-3xl sm:text-4xl">{m.emoji}</span>
                    <span className={`text-xs font-semibold ${selectedMood === m.value ? m.colors.text : 'text-slate-600'}`}>{m.label}</span>
                </button>
            ))}
        </div>

        <textarea
            value={journalText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="有什么想记下来的吗？（可选）"
            rows={6}
            className="w-full p-3 rounded-lg border-2 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition flex-grow"
        />
        <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClear} title="清除当天记录" className="p-2 rounded-lg bg-slate-200 text-slate-600 font-semibold hover:bg-red-100 hover:text-red-700 transition">
                <TrashIcon className="h-5 w-5"/>
            </button>
            <button 
                onClick={onSave} 
                disabled={!selectedMood}
                className="px-6 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
                保存
            </button>
        </div>
    </div>
);

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