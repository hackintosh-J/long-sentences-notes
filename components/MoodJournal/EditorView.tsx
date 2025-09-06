import React from 'react';
import type { Mood } from '../../types';
import { ArrowLeftIcon, TrashIcon } from '../icons';

const MOODS_OPTIONS: { value: Mood; emoji: string; label: string; colors: { text: string; ring: string; } }[] = [
    { value: 1, emoji: '😞', label: '很糟糕', colors: { text: 'text-red-800', ring: 'ring-red-400' } },
    { value: 2, emoji: '😕', label: '不太好', colors: { text: 'text-orange-800', ring: 'ring-orange-400' } },
    { value: 3, emoji: '😐', label: '一般般', colors: { text: 'text-yellow-800', ring: 'ring-yellow-400' } },
    { value: 4, emoji: '😊', label: '还不错', colors: { text: 'text-sky-800', ring: 'ring-sky-400' } },
    { value: 5, emoji: '😄', label: '棒极了', colors: { text: 'text-green-800', ring: 'ring-green-400' } },
];

interface EditorViewProps {
    selectedDate: Date;
    selectedMood: Mood | null;
    journalText: string;
    onMoodChange: (mood: Mood) => void;
    onTextChange: (text: string) => void;
    onSave: () => void;
    onClear: () => void;
    onBackToCalendar: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ selectedDate, selectedMood, journalText, onMoodChange, onTextChange, onSave, onClear, onBackToCalendar }) => (
    <div className="p-4 bg-slate-50 rounded-xl border flex flex-col h-full">
        <button onClick={onBackToCalendar} className="md:hidden flex items-center gap-2 text-sm font-semibold text-slate-600 mb-4 self-start bg-slate-200 px-3 py-1 rounded-full hover:bg-slate-300">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>返回日历</span>
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-1">记录 {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</h3>
        <p className="text-slate-500 text-sm mb-4">今天感觉怎么样？</p>

        <div className="grid grid-cols-5 gap-1 items-center mb-4">
            {MOODS_OPTIONS.map(m => (
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

export default EditorView;