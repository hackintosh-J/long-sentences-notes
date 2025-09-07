import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuitIcon, SparklesIcon, SpinnerIcon } from '../icons';
import { generateContent, generateContentStream, getAiProvider } from '../../services/aiService';
import type { BrainstormKeyword } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import LoadingOverlay from './LoadingOverlay';

const BRAINSTORM_STORAGE_KEY = 'brainstormKeywords';

const Brainstorm: React.FC = () => {
    const [allKeywords, setAllKeywords] = useState<BrainstormKeyword[]>([]);
    const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
    const [userInput, setUserInput] = useState('');
    const [report, setReport] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState('');
    const [isThinkingComplete, setIsThinkingComplete] = useState(false);

    const fetchInitialKeywords = async () => {
        const prompt = `为准备考研的学生推荐5个相关的、值得深入研究的核心概念（可以是政治、英语或西医综合）。请只返回一个以逗号分隔的字符串列表，不要有任何其他文字。例如: 剩余价值理论,定语从句,细胞凋亡,矛盾的普遍性,新民主主义革命`;
        try {
            const response = await generateContent({ prompt });
            const keywords = response.split(',').map(k => k.trim()).filter(Boolean);
            const aiKeywords: BrainstormKeyword[] = keywords.map(k => ({ text: k, source: 'ai' }));
            setAllKeywords(aiKeywords);
        } catch (error) {
            console.error("Failed to fetch initial keywords:", error);
            // Add some fallback keywords
            const fallbackKeywords: BrainstormKeyword[] = [
                { text: '矛盾的同一性', source: 'ai' },
                { text: '虚拟语气', source: 'ai' },
                { text: '三羧酸循环', source: 'ai' }
            ];
            setAllKeywords(fallbackKeywords);
        }
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem(BRAINSTORM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAllKeywords(parsed);
                } else {
                    fetchInitialKeywords();
                }
            } else {
                fetchInitialKeywords();
            }
        } catch (e) {
            console.error("Failed to load brainstorm keywords, fetching new ones.", e);
            fetchInitialKeywords();
        }
    }, []);

    useEffect(() => {
        if (allKeywords.length > 0) {
            localStorage.setItem(BRAINSTORM_STORAGE_KEY, JSON.stringify(allKeywords));
        }
    }, [allKeywords]);

    const handleAddKeyword = () => {
        const newKeyword = userInput.trim();
        if (newKeyword && !allKeywords.some(k => k.text === newKeyword)) {
            setAllKeywords(prev => [...prev, { text: newKeyword, source: 'user' }]);
        }
        setUserInput('');
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, keyword: string) => {
        e.dataTransfer.setData('text/plain', keyword);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const keyword = e.dataTransfer.getData('text/plain');
        if (keyword && !activeKeywords.includes(keyword)) {
            setActiveKeywords(prev => [...prev, keyword]);
        }
    };
    
    const removeActiveKeyword = (keywordToRemove: string) => {
        setActiveKeywords(prev => prev.filter(k => k !== keywordToRemove));
    };

    const handleGenerateReport = useCallback(async () => {
        if (activeKeywords.length === 0) return;
        
        setIsLoading(true);
        setReport(''); // Use empty string to indicate streaming has started
        setThinkingText('');
        setIsThinkingComplete(getAiProvider() === 'gemini');

        const keywords = activeKeywords.join(', ');
        const prompt = `你是一位知识渊博的考研辅导老师。请围绕以下核心概念：[${keywords}]，生成一份学习报告。报告应包含：
1.  **核心概念解释**: 对每个概念进行清晰、简洁的定义，并解释它们之间的内在联系。
2.  **例题与解析**: 提供1-2道与这些概念相关的高质量考研模拟题（选择题或简答题），并附上详细的解析。
报告需条理清晰，重点突出。请使用Markdown格式。`;
        
        try {
            const stream = generateContentStream(prompt, 60000);
            let thinkingDone = false;
            for await (const chunk of stream) {
                if(chunk.parsed) {
                    if (chunk.parsed.type === 'thinking') {
                        setThinkingText(prev => prev + chunk.parsed.content);
                    } else {
                        if (!thinkingDone) {
                            setIsThinkingComplete(true);
                            thinkingDone = true;
                        }
                        setReport(prev => (prev ?? '') + chunk.parsed.content);
                    }
                }
            }
            setIsThinkingComplete(true);
        } catch (error) {
            console.error("Brainstorm report generation failed:", error);
            setReport("抱歉，报告生成失败，请稍后再试。");
        } finally {
            setIsLoading(false);
        }
    }, [activeKeywords]);


    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <h3 className="flex items-center text-xl font-bold text-slate-700 mb-4">
                <BrainCircuitIcon className="h-6 w-6 mr-2 text-violet-500" />
                关联知识点头脑风暴
            </h3>
            <p className="text-sm text-slate-600 mb-4">将下面的知识点气泡拖拽到脑暴区，AI会为你生成一份包含解释和例题的专属报告。</p>
            
            {/* Keyword Bubbles */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 min-h-[5rem] flex flex-wrap gap-2 items-center">
                {allKeywords.map((kw, i) => (
                    <div
                        key={i}
                        draggable
                        onDragStart={(e) => handleDragStart(e, kw.text)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold cursor-grab transition-colors ${kw.source === 'ai' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-violet-200 text-violet-800 hover:bg-violet-300'}`}
                    >
                        {kw.text}
                    </div>
                ))}
            </div>
            
            {/* User Input */}
            <div className="flex gap-2 mb-4">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    placeholder="添加自定义知识点..."
                    className="flex-grow p-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
                />
                <button onClick={handleAddKeyword} className="bg-violet-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-violet-600 transition">添加</button>
            </div>

            {/* Drop Zone */}
            <div 
                onDrop={handleDrop} 
                onDragOver={(e) => e.preventDefault()}
                className="bg-violet-50 border-2 border-dashed border-violet-300 rounded-lg min-h-[8rem] p-3 transition-colors"
            >
                <div className="flex flex-wrap gap-2">
                    {activeKeywords.map((kw, i) => (
                        <div key={i} className="flex items-center gap-1 bg-white border border-violet-300 px-3 py-1 rounded-full text-sm font-semibold text-violet-900 animate-fadeIn">
                            {kw}
                            <button onClick={() => removeActiveKeyword(kw)} className="text-violet-400 hover:text-violet-700">&times;</button>
                        </div>
                    ))}
                </div>
                 {!activeKeywords.length && <p className="text-center text-slate-400 m-6">将知识点拖到这里</p>}
            </div>

            <button
                onClick={handleGenerateReport}
                disabled={isLoading || activeKeywords.length === 0}
                className="mt-4 w-full sm:w-auto bg-violet-500 text-white font-bold py-3 px-8 rounded-full hover:bg-violet-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 flex items-center justify-center gap-2"
            >
                 {isLoading ? <><SpinnerIcon className="h-5 w-5"/> 正在生成报告...</> : <><SparklesIcon className="h-5 w-5"/> 生成报告</>}
            </button>
            
            {(isLoading || report !== null) && (
                <div className="relative mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[10rem]">
                    {/* Show overlay only while thinking. Once content starts streaming, isThinkingComplete becomes true, and this disappears.*/}
                    {isLoading && !isThinkingComplete && (
                        <LoadingOverlay thinkingText={thinkingText} isThinkingComplete={isThinkingComplete} showFunFacts={false} />
                    )}
                    
                    {/* Render the report as it streams in */}
                    {report !== null && (
                        <div className="prose prose-sm max-w-none animate-fadeIn">
                            <MarkdownRenderer text={report} />
                            {/* Add a blinking cursor to indicate that content is still loading */}
                            {isLoading && <span className="inline-block animate-blink">▋</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Brainstorm;