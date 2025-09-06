import React, { useState, useEffect } from 'react';
import { BookIcon, HeartIcon } from './components/icons';
import Dashboard from './components/Dashboard';
import EnglishCorner from './components/EnglishCorner';
import PoliticsCorner from './components/PoliticsCorner';
import MedicineCorner from './components/MedicineCorner';
import FocusGarden from './components/FocusGarden';
import MoodJournal from './components/MoodJournal';
import AiAssistant from './components/AiAssistant';
import MemoryGame from './components/MemoryGame';
import type { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (previousPage !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPreviousPage(null);
      }, 400); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [previousPage]);

  const navigateTo = (page: Page) => {
    if (page !== currentPage) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
    }
  };

  const pages: { [key in Page]: React.ReactNode } = {
    dashboard: <Dashboard onNavigate={navigateTo} />,
    english: <EnglishCorner onBack={() => navigateTo('dashboard')} />,
    politics: <PoliticsCorner onBack={() => navigateTo('dashboard')} />,
    medicine: <MedicineCorner onBack={() => navigateTo('dashboard')} />,
    focus_garden: <FocusGarden onBack={() => navigateTo('dashboard')} />,
    mood_journal: <MoodJournal onBack={() => navigateTo('dashboard')} />,
    ai_assistant: <AiAssistant onBack={() => navigateTo('dashboard')} />,
    memory_game: <MemoryGame onBack={() => navigateTo('dashboard')} />,
  };

  return (
    <div className="bg-rose-50 min-h-screen font-sans text-slate-900" style={{ fontFamily: "'Inter', 'Noto Sans SC', sans-serif" }}>
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <BookIcon className="h-8 w-8 text-rose-500" />
              <h1 className="text-2xl font-bold text-slate-800">
                考研加油小站
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              For a friend's success <HeartIcon className="h-4 w-4 text-red-400" />
            </p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
        {isAnimating && previousPage && (
          <div key={previousPage} className="page exiting">
            {pages[previousPage]}
          </div>
        )}
        <div key={currentPage} className={`page ${isAnimating ? 'entering' : ''}`}>
          {pages[currentPage]}
        </div>
      </main>

      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>Crafted with 💖 for a brilliant friend.</p>
      </footer>
    </div>
  );
};

export default App;
