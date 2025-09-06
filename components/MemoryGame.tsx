import React, { useState, useEffect, useMemo } from 'react';
import { 
    ArrowLeftIcon, GraduationCapIcon, PencilIcon, AtomIcon, FlaskIcon, 
    GlobeAltIcon, ScaleIcon, ChartBarIcon, ClipboardDocumentCheckIcon, RefreshIcon 
} from './icons';

interface MemoryGameProps {
    onBack: () => void;
}

const ICONS = [
    (props: any) => <GraduationCapIcon {...props} />,
    (props: any) => <PencilIcon {...props} />,
    (props: any) => <AtomIcon {...props} />,
    (props: any) => <FlaskIcon {...props} />,
    (props: any) => <GlobeAltIcon {...props} />,
    (props: any) => <ScaleIcon {...props} />,
    (props: any) => <ChartBarIcon {...props} />,
    (props: any) => <ClipboardDocumentCheckIcon {...props} />,
];

type CardState = {
    id: number;
    icon: React.FC<any>;
    type: string;
    status: 'default' | 'flipped' | 'matched';
};

const createShuffledCards = (): CardState[] => {
    const cardPairs: CardState[] = [];
    ICONS.forEach((Icon, index) => {
        const type = `icon-${index}`;
        cardPairs.push({ id: index * 2, icon: Icon, type, status: 'default' });
        cardPairs.push({ id: index * 2 + 1, icon: Icon, type, status: 'default' });
    });

    // Fisher-Yates shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    return cardPairs;
};

const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
    const [cards, setCards] = useState<CardState[]>(createShuffledCards());
    const [flippedCards, setFlippedCards] = useState<CardState[]>([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    
    const isGameWon = useMemo(() => cards.every(card => card.status === 'matched'), [cards]);

    const handleCardClick = (clickedCard: CardState) => {
        if (isChecking || clickedCard.status !== 'default' || flippedCards.length >= 2) {
            return;
        }

        const newCards = cards.map(card =>
            card.id === clickedCard.id ? { ...card, status: 'flipped' } : card
        );
        setCards(newCards);
        setFlippedCards([...flippedCards, clickedCard]);
    };
    
    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            setMoves(m => m + 1);
            const [firstCard, secondCard] = flippedCards;

            if (firstCard.type === secondCard.type) {
                // Match
                setTimeout(() => {
                    setCards(prevCards => prevCards.map(card => 
                        // FIX: Added 'as const' to prevent TypeScript from widening the status type to 'string'.
                        card.type === firstCard.type ? { ...card, status: 'matched' as const } : card
                    ));
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 800);
            } else {
                // No match
                setTimeout(() => {
                    setCards(prevCards => prevCards.map(card => 
                       // FIX: Added 'as const' to prevent TypeScript from widening the status type to 'string'.
                       (card.id === firstCard.id || card.id === secondCard.id) ? { ...card, status: 'default' as const } : card
                    ));
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1200);
            }
        }
    }, [flippedCards]);

    const resetGame = () => {
        setCards(createShuffledCards());
        setFlippedCards([]);
        setMoves(0);
        setIsChecking(false);
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 px-4 py-2 rounded-full transition-all duration-200 border border-slate-300"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>返回主页</span>
                </button>
            </div>

            <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-amber-800 mb-2">趣味记忆牌</h2>
                    <p className="text-slate-500 mb-6">翻开卡片，找出所有匹配的图案！</p>
                </div>
                
                <div className="flex justify-between items-center mb-6 bg-slate-100 p-3 rounded-xl">
                    <div className="font-bold text-slate-700">步数: <span className="text-2xl text-amber-600">{moves}</span></div>
                    <button 
                        onClick={resetGame}
                        className="flex items-center gap-2 bg-amber-500 text-white font-bold py-2 px-4 rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <RefreshIcon className="h-5 w-5" />
                        <span>重置游戏</span>
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-3 sm:gap-4 perspective-1000">
                    {cards.map(card => {
                        const isFlipped = card.status === 'flipped' || card.status === 'matched';
                        const CardIcon = card.icon;
                        return (
                            <div key={card.id} className="w-full aspect-square" onClick={() => handleCardClick(card)}>
                                <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    {/* Front */}
                                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg flex justify-center items-center cursor-pointer hover:shadow-xl transition-shadow">
                                        <span className="text-3xl text-white font-bold">?</span>
                                    </div>
                                    {/* Back */}
                                    <div className={`absolute w-full h-full backface-hidden rounded-xl shadow-lg flex justify-center items-center rotate-y-180 ${card.status === 'matched' ? 'bg-green-100 ring-4 ring-green-300' : 'bg-white'}`}>
                                        <CardIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-700" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isGameWon && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fadeIn z-10 rounded-2xl">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform scale-100 transition-transform duration-300">
                            <h3 className="text-3xl font-bold text-green-600">恭喜你！</h3>
                            <p className="text-slate-600 mt-2">你成功找到了所有的配对！</p>
                            <p className="mt-4 text-lg">最终步数: <span className="font-bold text-amber-600 text-2xl">{moves}</span></p>
                            <button onClick={resetGame} className="mt-6 bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-transform transform hover:scale-105">
                               再玩一次
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemoryGame;