import React, { useState } from 'react';
import type { QuizQuestion } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../icons';

const QuizQuestionView: React.FC<{ q: QuizQuestion, qIndex: number }> = ({ q, qIndex }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const hasAnswered = selectedOption !== null;

    const handleSelect = (optIndex: number) => {
        if (hasAnswered) return;
        setSelectedOption(optIndex);
    };

    const getOptionClass = (optIndex: number) => {
        if (!hasAnswered) {
            return 'bg-slate-100 hover:bg-slate-200';
        }
        const isCorrect = optIndex === q.answerIndex;
        const isSelected = optIndex === selectedOption;

        if (isCorrect) return 'bg-green-100 ring-2 ring-green-400 text-green-800';
        if (isSelected && !isCorrect) return 'bg-red-100 ring-2 ring-red-400 text-red-800';
        return 'bg-slate-100 text-slate-500';
    };

    return (
        <div className="mb-6">
            <p className="font-semibold text-slate-800 mb-3">{qIndex + 1}. {q.question}</p>
            <div className="space-y-2">
                {q.options.map((opt, j) => (
                    <button
                        key={j}
                        onClick={() => handleSelect(j)}
                        className={`block w-full text-left p-3 rounded-lg transition-all text-sm font-medium ${getOptionClass(j)}`}
                        disabled={hasAnswered}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {hasAnswered && (
                <div className={`mt-3 p-3 rounded-lg text-sm animate-fadeIn ${selectedOption === q.answerIndex ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                    {selectedOption === q.answerIndex ? (
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0"/>
                            <strong>回答正确！</strong>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2">
                            <XCircleIcon className="h-5 w-5 text-red-600 shrink-0"/>
                            <strong>回答错误。</strong>
                        </div>
                    )}
                    <p className="mt-1 ml-7">{q.explanation}</p>
                </div>
            )}
        </div>
    );
};

const QuizView: React.FC<{ questions: QuizQuestion[]; onReset: () => void }> = ({ questions, onReset }) => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-fadeIn mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-700">随堂测验</h3>
            <button onClick={onReset} className="bg-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-full hover:bg-slate-300 transition text-sm">
                换一批题
            </button>
        </div>
        {questions.map((q, i) => (
            // Use a unique key to force re-render on question change
            <QuizQuestionView key={`${q.question}-${i}`} q={q} qIndex={i} />
        ))}
      </div>
    );
};

export default QuizView;