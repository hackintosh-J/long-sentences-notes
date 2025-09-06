import React from 'react';

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <React.Fragment>
            {parts.map((part, index) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={index}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </React.Fragment>
    );
};

export default SimpleMarkdownRenderer;