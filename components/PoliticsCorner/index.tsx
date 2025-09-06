import React, { useState, useEffect, useMemo } from 'react';
import { POLITICS_DATA } from '../../constants';
import type { QuizQuestion } from '../../types';
import { ArrowLeftIcon, QuizIcon } from '../icons';
import { shuffleArray } from '../../utils/helpers';
import Flashcard from './Flashcard';
import QuizView from './QuizView';

interface PoliticsCornerProps {
    onBack: () => void;
}
  
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