import React from 'react';

const boldRegex = /\*\*(.*?)\*\*/g;
const headingRegex = /^(#{1,3})\s(.*)/;
const unorderedListRegex = /^\s*[-*]\s(.*)/;
const orderedListRegex = /^\s*\d+\.\s(.*)/;

const renderInline = (text: string) => {
    const parts = text.split(boldRegex);
    return parts.map((part, index) => 
        index % 2 === 1 
            ? <strong key={index}>{part}</strong> 
            : part
    );
};

const MarkdownRenderer: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
    if (!text) return null;

    return (
        <div className={className}>
            {text.split('\n\n').map((block, blockIndex) => {
                const lines = block.split('\n').filter(line => line.trim() !== '');
                if (lines.length === 0) return null;

                // Check for lists
                const isUnorderedList = lines.every(line => unorderedListRegex.test(line));
                const isOrderedList = lines.every(line => orderedListRegex.test(line));

                if (isUnorderedList) {
                    return (
                        <ul key={blockIndex} className="list-disc list-outside pl-5 mb-4 space-y-1">
                            {lines.map((line, lineIndex) => (
                                <li key={lineIndex}>{renderInline(line.replace(unorderedListRegex, '$1'))}</li>
                            ))}
                        </ul>
                    );
                }

                if (isOrderedList) {
                    return (
                        <ol key={blockIndex} className="list-decimal list-outside pl-5 mb-4 space-y-1">
                            {lines.map((line, lineIndex) => (
                                <li key={lineIndex}>{renderInline(line.replace(orderedListRegex, '$1'))}</li>
                            ))}
                        </ol>
                    );
                }

                // Treat as paragraph block
                return (
                    <div key={blockIndex} className="mb-4 last:mb-0">
                        {lines.map((line, lineIndex) => {
                            const headingMatch = line.match(headingRegex);
                            if (headingMatch) {
                                const level = headingMatch[1].length;
                                const content = headingMatch[2];
                                const Tag = `h${level + 2}` as keyof JSX.IntrinsicElements;
                                return <Tag key={lineIndex} className="font-bold mt-4 mb-2 text-slate-800">{renderInline(content)}</Tag>;
                            }
                            return <p key={lineIndex} className="leading-relaxed">{renderInline(line)}</p>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default MarkdownRenderer;
