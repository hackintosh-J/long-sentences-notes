
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from '../icons';
import { getAiProvider, setAiProvider, generateContentStream, StreamOutput } from '../../services/aiService';
import type { ModelProvider } from '../../types';

interface SettingsProps {
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    const [currentProvider, setCurrentProvider] = useState<ModelProvider>('gemini');
    
    // State for connectivity test
    const [testPrompt, setTestPrompt] = useState('你好，请用中文介绍一下你自己。然后，请你扮演一位经验丰富的旅行家，为一位从未去过北京的游客，推荐三个必游景点，并为每个景点写一段50字左右的推荐语，语言要生动有趣。');
    const [testResponse, setTestResponse] = useState('');
    const [thinkingText, setThinkingText] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testError, setTestError] = useState('');
    const [rawStreamChunks, setRawStreamChunks] = useState<string[]>([]);

    useEffect(() => {
        setCurrentProvider(getAiProvider());
    }, []);

    const handleProviderChange = (provider: ModelProvider) => {
        setAiProvider(provider);
        setCurrentProvider(provider);
    };

    const handleTestRequest = useCallback(async () => {
        if (!testPrompt.trim() || isTesting) return;

        setIsTesting(true);
        setTestResponse('');
        setThinkingText('');
        setTestError('');
        setRawStreamChunks([]);
        
        try {
            const stream = generateContentStream(testPrompt, 15000); // 15s timeout for test
            for await (const output of stream) {
                if (output.raw && output.raw.trim()) {
                    setRawStreamChunks(prev => [...prev, output.raw]);
                }

                if (output.parsed) {
                    if (output.parsed.type === 'thinking') {
                        setThinkingText(prev => prev + output.parsed.content);
                    } else {
                        setTestResponse(prev => prev + output.parsed.content);
                    }
                }
            }
        } catch (error) {
            console.error("Connectivity test failed:", error);
            if (error instanceof Error && error.message === 'timeout') {
                setTestError('请求超时。请检查网络连接或稍后再试。');
            } else {
                setTestError('请求失败。请检查 API Key 和网络连接。');
            }
        } finally {
            setIsTesting(false);
        }
    }, [testPrompt, isTesting]);

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

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">设置</h2>
                    <p className="text-slate-500">调整应用参数，选择偏好的 AI 模型提供商。</p>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">AI 模型提供商</h3>
                    <p className="text-sm text-slate-600">
                        应用支持两种 AI 模型。Gemini 模型响应速度通常更快，Zhipu (智谱清言) 模型在中文语境下可能表现更佳。
                        切换后将在下次 AI 请求时生效。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => handleProviderChange('gemini')}
                            className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                                currentProvider === 'gemini' 
                                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' 
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                        >
                            <h4 className="font-bold text-blue-800">Google Gemini</h4>
                            <p className="text-sm text-slate-600 mt-1">通用性强，响应迅速，全球领先的大语言模型。</p>
                        </button>
                        <button
                            onClick={() => handleProviderChange('zhipu')}
                            className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                                currentProvider === 'zhipu' 
                                ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-300' 
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                        >
                            <h4 className="font-bold text-teal-800">Zhipu AI (智谱清言)</h4>
                            <p className="text-sm text-slate-600 mt-1">国内领先的大模型，对中文优化，理解能力出色。</p>
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 space-y-4">
                     <h3 className="text-lg font-semibold text-slate-700">模型连通性测试</h3>
                     <p className="text-sm text-slate-600">
                        输入一段话，测试当前选择的 AI 模型 (<strong>{currentProvider === 'gemini' ? 'Gemini' : 'Zhipu AI'}</strong>) 是否可以正常连接并返回流式回复。
                     </p>
                     <textarea
                        value={testPrompt}
                        onChange={(e) => setTestPrompt(e.target.value)}
                        placeholder="输入测试内容..."
                        className="w-full h-24 p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                        disabled={isTesting}
                    />
                     <button
                        onClick={handleTestRequest}
                        disabled={isTesting || !testPrompt.trim()}
                        className="w-full sm:w-auto bg-indigo-500 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {isTesting ? <><SpinnerIcon className="h-5 w-5"/> 正在请求...</> : <><SparklesIcon className="h-5 w-5"/> 发送测试请求</>}
                    </button>
                    {(testResponse || testError || thinkingText || isTesting) && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[5rem] space-y-4">
                             {thinkingText && (
                                <div className="animate-fadeIn">
                                    <h4 className="font-semibold text-slate-500 mb-2 text-sm flex items-center gap-2">
                                        <SparklesIcon className="h-4 w-4 text-slate-400"/>
                                        AI 思维链
                                    </h4>
                                    <p className="text-slate-600 whitespace-pre-wrap text-sm font-mono bg-slate-100 p-3 rounded-md">{thinkingText}</p>
                                </div>
                            )}
                            {(testResponse || testError || (isTesting && !thinkingText)) && (
                                <div className="animate-fadeIn">
                                  <h4 className="font-semibold text-slate-600 mb-2">AI 最终回复:</h4>
                                  {testError ? (
                                      <p className="text-red-600">{testError}</p>
                                  ) : (
                                      <p className="text-slate-800 whitespace-pre-wrap">{testResponse}</p>
                                  )}
                                  {isTesting && !testResponse && !thinkingText && !testError && (
                                      <p className="text-slate-500">正在等待模型响应...</p>
                                  )}
                                </div>
                            )}
                            {rawStreamChunks.length > 0 && (
                                <div className="animate-fadeIn pt-4 border-t border-slate-200">
                                    <h4 className="font-semibold text-slate-500 mb-2 text-sm">
                                        完整返回内容 (调试信息)
                                    </h4>
                                    <pre className="text-xs text-slate-600 bg-slate-200 p-3 rounded-md overflow-x-auto max-h-48">
                                        <code>
                                            {rawStreamChunks.join('\n')}
                                        </code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Settings;
