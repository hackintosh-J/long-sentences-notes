import React from 'react';

const SimpleMarkdownRenderer: React.FC<{ text: string; highlightClassName?: string }> = ({ text, highlightClassName = 'font-bold' }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <React.Fragment>
            {parts.map((part, index) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={index} className={highlightClassName}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </React.Fragment>
    );
};

export default SimpleMarkdownRenderer;