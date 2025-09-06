import React from 'react';

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

export default ModuleCard;
