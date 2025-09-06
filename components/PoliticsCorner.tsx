import React, { useState, useEffect, useMemo } from 'react';
import { POLITICS_DATA } from '../constants';
import type { PoliticsCardData, PoliticsTopic, Quiz, QuizQuestion } from '../types';
import { ArrowLeftIcon, FlipIcon, QuizIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface PoliticsCornerProps {
    onBack: () => void;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const Flashcard: React.FC<{ card: PoliticsCardData }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
    }, [card]);

    return (
        <div className="perspective-1000 w-full h-64" onClick={() => setIsFlipped(!isFlipped)}>
            <div 
                className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col justify-center items-center p-6 cursor-pointer hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-semibold text-slate-800 text-center">{card.term}</h3>
                    <div className="absolute bottom-4 right-4 text-slate-400 flex items-center gap-1">
                        <FlipIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">点击翻转</span>
                    </div>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-rose-50 border border-rose-200 rounded-xl shadow-lg p-6 rotate-y-180 overflow-y-auto">
                    <h4 className="font-bold text-rose-800 mb-2">{card.term}</h4>
                    <p className="text-slate-700 text-sm mb-3">{card.explanation}</p>
                    {card.details && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                            {card.details.map((detail, i) => <li key={i}>{detail}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuizQuestionView: React.FC<{ q: QuizQuestion, qIndex: number, key: string }> = ({ q, qIndex }) => {
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
  
const PoliticsCorner: React.FC<PoliticsCornerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<string>(POLITICS_DATA[0].id);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);

  const currentTopic = useMemo(() => {
      return POLITICS_DATA.find(topic => topic.id === activeTab) || POLITICS_DATA[0];
  }, [activeTab]);

  const generateNewQuiz = () => {
      const shuffled = shuffleArray(currentTopic.quiz.questions);
      setActiveQuizQuestions(shuffled.slice(0, 5)); // Take 5 random questions
      setShowQuiz(true);
  }

  // Generate a new quiz when the topic changes
  useEffect(() => {
    setShowQuiz(false);
    setActiveQuizQuestions([]);
  }, [currentTopic]);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>返回主页</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <h2 className="text-3xl font-bold text-red-800 mb-2">政治速记卡</h2>
        <p className="text-slate-500 mb-6">点击卡片进行翻转，利用海量题库随机抽题来巩固知识点。</p>
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {POLITICS_DATA.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTab(topic.id)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === topic.id
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {topic.title}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {currentTopic.cards.map(card => <Flashcard key={card.id} card={card} />)}
        </div>
        
        {!showQuiz && (
            <div className="text-center border-t border-slate-200 pt-6">
                <button 
                    onClick={generateNewQuiz}
                    className="bg-rose-500 text-white font-bold py-3 px-8 rounded-full hover:bg-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                >
                    <QuizIcon className="h-5 w-5" />
                    <span>开始随堂测验</span>
                </button>
            </div>
        )}

        {showQuiz && <QuizView questions={activeQuizQuestions} onReset={generateNewQuiz}/>}

      </div>
    </div>
  );
};

export default PoliticsCorner;