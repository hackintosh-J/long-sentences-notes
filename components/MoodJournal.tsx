import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, TrashIcon } from './icons';
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

const STORAGE_KEY = 'moodJournalEntries';
const dateToKey = (date: Date): string => date.toISOString().split('T')[0];

const MoodJournal: React.FC<MoodJournalProps> = ({ onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date()); // For calendar month navigation
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // For editing, default to today
    const [entries, setEntries] = useState<Record<string, MoodEntry>>({});
    const [view, setView] = useState<'calendar' | 'editor'>('calendar'); // For mobile view switching
    
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [journalText, setJournalText] = useState('');

    // Load entries from localStorage on mount
    useEffect(() => {
        try {
            const savedEntries = localStorage.getItem(STORAGE_KEY);
            if (savedEntries) {
                setEntries(JSON.parse(savedEntries));
            }
        } catch (error) {
            console.error("Failed to load mood entries from localStorage", error);
        }
    }, []);

    // Update editor state when selectedDate or entries change
    useEffect(() => {
        const entry = entries[dateToKey(selectedDate)];
        setSelectedMood(entry?.mood || null);
        setJournalText(entry?.text || '');
    }, [selectedDate, entries]);

    const saveEntries = (updatedEntries: Record<string, MoodEntry>) => {
        try {
            setEntries(updatedEntries);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
        } catch (error) {
            console.error("Failed to save mood entries to localStorage", error);
        }
    };

    const handleSaveEntry = () => {
        if (!selectedMood) return;
        const key = dateToKey(selectedDate);
        const newEntry: MoodEntry = { date: key, mood: selectedMood, text: journalText };
        const updatedEntries = { ...entries, [key]: newEntry };
        saveEntries(updatedEntries);
    };

    const handleClearEntry = () => {
        const key = dateToKey(selectedDate);
        const { [key]: _, ...restEntries } = entries;
        saveEntries(restEntries);
    };

    const CalendarView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDayOfMonth).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="p-4 bg-slate-50 rounded-xl border">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-slate-200">&lt;</button>
                    <h3 className="font-bold text-lg text-slate-700">{`${year}年 ${month + 1}月`}</h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-slate-200">&gt;</button>
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
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setView('editor'); // Switch to editor view
                                    }}
                                    className={`absolute inset-0.5 flex items-center justify-center rounded-full transition-all duration-200
                                        ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                        ${moodInfo ? `${moodInfo.colors.calendarBg} text-white hover:opacity-80` : 'bg-slate-200 hover:bg-slate-300'}
                                    `}
                                >
                                    {moodInfo?.emoji ? <span className="text-2xl">{moodInfo.emoji}</span> : <span className="text-slate-600 font-bold text-xs">{day}</span>}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const EditorView = () => (
        <div className="p-4 bg-slate-50 rounded-xl border flex flex-col h-full">
            <button onClick={() => setView('calendar')} className="md:hidden flex items-center gap-2 text-sm font-semibold text-slate-600 mb-4 self-start bg-slate-200 px-3 py-1 rounded-full hover:bg-slate-300">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>返回日历</span>
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">记录 {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</h3>
            <p className="text-slate-500 text-sm mb-4">今天感觉怎么样？</p>

            <div className="grid grid-cols-5 gap-1 items-center mb-4">
                {MOODS.map(m => (
                    <button 
                        key={m.value} 
                        onClick={() => setSelectedMood(m.value)}
                        className={`flex flex-col items-center gap-1.5 p-1 rounded-lg transition-all transform hover:scale-110 focus:outline-none ${selectedMood === m.value ? `ring-2 ${m.colors.ring}` : ''}`}
                    >
                        <span className="text-3xl sm:text-4xl">{m.emoji}</span>
                        <span className={`text-xs font-semibold ${selectedMood === m.value ? m.colors.text : 'text-slate-600'}`}>{m.label}</span>
                    </button>
                ))}
            </div>

            <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="有什么想记下来的吗？（可选）"
                rows={6}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition flex-grow"
            />
            <div className="flex justify-end gap-3 mt-4">
                <button onClick={handleClearEntry} title="清除当天记录" className="p-2 rounded-lg bg-slate-200 text-slate-600 font-semibold hover:bg-red-100 hover:text-red-700 transition">
                    <TrashIcon className="h-5 w-5"/>
                </button>
                <button 
                    onClick={handleSaveEntry} 
                    disabled={!selectedMood}
                    className="px-6 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    保存
                </button>
            </div>
        </div>
    );


    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300">
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-indigo-800 mb-2">心情日历</h2>
                    <p className="text-slate-500">点击日期，记录你的心情和日记。所有内容仅保存在本地，为你一人私藏。</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Calendar Column */}
                    <div className={`${view === 'editor' && 'hidden'} md:!block`}>
                        <CalendarView />
                    </div>
                    {/* Editor Column */}
                    <div className={`${view === 'calendar' && 'hidden'} md:!block`}>
                        <EditorView />
                    </div>
                </div>

                 <div className="mt-6 text-xs text-center text-slate-400">
                    <p>这是一个完全私密的工具，所有数据都安全地存储在你的设备中。</p>
                </div>
            </div>
        </div>
    );
};

export default MoodJournal;