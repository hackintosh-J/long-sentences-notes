import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '../icons';
import { getAiProvider, setAiProvider } from '../../services/aiService';
import type { ModelProvider } from '../../types';

interface SettingsProps {
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    const [provider, setProvider] = useState<ModelProvider>('gemini');

    useEffect(() => {
        setProvider(getAiProvider());
    }, []);

    const handleProviderChange = (newProvider: ModelProvider) => {
        setProvider(newProvider);
        setAiProvider(newProvider);
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">设置</h2>
                <p className="text-slate-500 mb-6">调整应用参数以获得最佳体验。</p>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">AI 模型选择</h3>
                    <p className="text-sm text-slate-500">
                        选择用于生成内容和分析的语言模型。不同模型在速度、质量和风格上可能存在差异。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => handleProviderChange('gemini')}
                            className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${provider === 'gemini' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                        >
                            <h4 className="font-bold text-slate-800">Google Gemini</h4>
                            <p className="text-sm text-slate-600 mt-1">由 Google 提供的高性能通用模型，响应迅速，质量可靠。</p>
                        </button>
                        <button
                            onClick={() => handleProviderChange('zhipu')}
                             className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${provider === 'zhipu' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                        >
                             <h4 className="font-bold text-slate-800">Zhipu GLM-4.5-flash</h4>
                             <p className="text-sm text-slate-600 mt-1">由智谱 AI 提供的最新模型，开启“思维模式”以获得更高质量的生成内容。</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
