import React from 'react';
// FIX: Removed unused import of MOODS_CONFIG that was causing an error.
import type { MoodEntry, Mood } from '../../types';
import { dateToKey } from '../../utils/helpers';

interface CalendarViewProps {
    currentDate: Date;
    entries: Record<string, MoodEntry>;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onChangeMonth: (date: Date) => void;
}

const MOODS_INFO: { value: Mood; emoji: string; colors: { calendarBg: string; } }[] = [
    { value: 1, emoji: '😞', colors: { calendarBg: 'bg-red-400' } },
    { value: 2, emoji: '😕', colors: { calendarBg: 'bg-orange-400' } },
    { value: 3, emoji: '😐', colors: { calendarBg: 'bg-yellow-400' } },
    { value: 4, emoji: '😊', colors: { calendarBg: 'bg-sky-400' } },
    { value: 5, emoji: '😄', colors: { calendarBg: 'bg-green-400' } },
];

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, entries, selectedDate, onSelectDate, onChangeMonth }) => {
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
                    const moodInfo = entry ? MOODS_INFO.find(m => m.value === entry.mood) : null;
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

export default CalendarView;