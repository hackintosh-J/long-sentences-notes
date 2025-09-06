import React, { useState, useEffect } from 'react';
import { DAILY_NOTES, FUN_FACTS } from '../constants';
import { BookIcon, PoliticsIcon, MedicineIcon, SparklesIcon, ClockIcon, JournalIcon, BrainCircuitIcon, ChartBarIcon } from './icons';
import type { Page } from '../types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

// Helper function to get a random item from an array
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];


const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [dailyNote, setDailyNote] = useState('');
    const [funFact, setFunFact] = useState('');
    
    useEffect(() => {
        setDailyNote(getRandomItem(DAILY_NOTES));
    }, []);

    const getFunFact = () => {
        setFunFact(getRandomItem(FUN_FACTS));
    }

    const renderFunFact = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-amber-800">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Daily Note Card */}
            <div className="bg-gradient-to-br from-rose-100 to-amber-100 p-6 rounded-2xl shadow-lg border border-white/50">
                <p className="text-lg font-semibold text-rose-800/80 text-center" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                    {dailyNote || '正在为你摘取今日份的好运...'}
                </p>
            </div>

            {/* Module Navigation */}
            <div>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">功能模块</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        description="用色彩和文字，描绘你的心路历程"
                        color="from-indigo-400 to-violet-500"
                        onClick={() => onNavigate('mood_journal')}
                    />
                    <ModuleCard 
                        icon={<ChartBarIcon className="h-8 w-8 text-white" />}
                        title="学习分析"
                        description="回顾心情曲线，洞察学习状态"
                        color="from-amber-400 to-orange-500"
                        onClick={() => onNavigate('study_analysis')}
                    />
                     <ModuleCard 
                        icon={<BrainCircuitIcon className="h-8 w-8 text-white" />}
                        title="AI 助教"
                        description="动态问答，概念辨析，智能伙伴"
                        color="from-purple-500 to-pink-500"
                        onClick={() => onNavigate('ai_assistant')}
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
                </div>
            </div>

            {/* Fun Fact Corner */}
            <div>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">知识角落</h2>
                 <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 text-center">
                    <SparklesIcon className="h-10 w-10 text-amber-500 mx-auto mb-3"/>
                    <p className="text-slate-600 mb-4">学习累了？来点有趣的知识放松一下吧！</p>
                    <button onClick={getFunFact} className="bg-amber-500 text-white font-bold py-2 px-6 rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-105">
                        获取趣味小知识
                    </button>
                    {funFact && <p className="text-slate-700 mt-4 p-4 bg-amber-50 rounded-lg animate-fadeIn leading-relaxed">{renderFunFact(funFact)}</p>}
                 </div>
            </div>
        </div>
    );
};

interface ModuleCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    onClick?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, color, onClick }) => {
    const cardClasses = `relative group p-6 rounded-2xl text-white overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer`;
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
}

export default Dashboard;