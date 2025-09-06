import React from 'react';

interface BriefingCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isNote?: boolean;
    className?: string;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ title, icon, children, isNote = false, className = '' }) => (
    <div className={`bg-slate-50 p-6 rounded-xl border border-slate-200/80 min-h-[20rem] flex flex-col ${className}`}>
        <h4 className="flex items-center text-xl font-bold text-slate-700 mb-4">{icon}{title}</h4>
        <div className={`flex-grow flex flex-col justify-center ${isNote ? 'text-rose-800 font-semibold' : 'text-slate-800'}`}>
            {children}
        </div>
    </div>
);

export default BriefingCard;