import React, { useRef, useEffect } from 'react';

const ThinkingIndicator: React.FC<{ text: string }> = ({ text }) => {
    const visibleLines = text.split('\n').slice(-3).join('\n');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to the bottom of the container
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [visibleLines]);

    return (
        <div className="w-full">
            <p className="text-sm font-semibold text-slate-600 mb-2">AI 正在思考中...</p>
            <div 
                ref={containerRef}
                className="bg-slate-800 text-slate-200 font-mono text-sm p-3 rounded-md h-24 overflow-y-hidden"
            >
                <pre className="whitespace-pre-wrap">
                    <code>
                        {visibleLines}
                        <span className="animate-blink">▋</span>
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default ThinkingIndicator;
