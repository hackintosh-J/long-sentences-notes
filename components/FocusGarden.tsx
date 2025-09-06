import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BREAK_TIME_TIPS, PLANT_EMOJIS } from '../constants';
import { ArrowLeftIcon, ClockIcon, PlayIcon, PauseIcon, StopIcon } from './icons';

interface FocusGardenProps {
    onBack: () => void;
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'break';
type Plant = { id: number; emoji: string; };

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const FocusGarden: React.FC<FocusGardenProps> = ({ onBack }) => {
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [sessionLength, setSessionLength] = useState(25 * 60); // default 25 minutes
    const [timeLeft, setTimeLeft] = useState(sessionLength);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [breakTip, setBreakTip] = useState('');

    // Load plants from localStorage on initial render
    useEffect(() => {
        try {
            const savedPlants = localStorage.getItem('focusGardenPlants');
            if (savedPlants) {
                setPlants(JSON.parse(savedPlants));
            }
        } catch (error) {
            console.error("Failed to load plants from localStorage", error);
        }
    }, []);

    // Save plants to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('focusGardenPlants', JSON.stringify(plants));
        } catch (error) {
            console.error("Failed to save plants to localStorage", error);
        }
    }, [plants]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (status === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (status === 'running' && timeLeft === 0) {
            // Session complete
            setStatus('break');
            setBreakTip(getRandomItem(BREAK_TIME_TIPS));
            const newPlant: Plant = { id: Date.now(), emoji: getRandomItem(PLANT_EMOJIS) };
            setPlants(prev => [...prev, newPlant]);
            setTimeLeft(5 * 60); // Start 5-minute break
        } else if (status === 'break' && timeLeft === 0) {
            // Break complete
            resetTimer();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, timeLeft]);
    
    const handleSetSession = (minutes: number) => {
        if (status !== 'idle') return;
        const newLength = minutes * 60;
        setSessionLength(newLength);
        setTimeLeft(newLength);
    };

    const toggleTimer = () => {
        if (status === 'running') {
            setStatus('paused');
        } else {
            setStatus('running');
        }
    };
    
    const resetTimer = useCallback(() => {
        setStatus('idle');
        setTimeLeft(sessionLength);
    }, [sessionLength]);

    const progress = useMemo(() => {
        const totalDuration = status === 'break' ? 5 * 60 : sessionLength;
        return ((totalDuration - timeLeft) / totalDuration) * 100;
    }, [timeLeft, sessionLength, status]);

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

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-green-800 mb-2">专注花园</h2>
                    <p className="text-slate-500 mb-8">选择一个专注时长，完成后你的花园会获得一株新植物。</p>
                </div>
                
                {/* Timer Display */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-8 flex items-center justify-center">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle 
                           className={status === 'break' ? 'text-blue-500' : 'text-green-500'}
                           strokeWidth="8"
                           strokeDasharray="283"
                           strokeDashoffset={283 - (progress / 100) * 283}
                           strokeLinecap="round"
                           stroke="currentColor"
                           fill="transparent"
                           r="45"
                           cx="50"
                           cy="50"
                           style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div className="relative text-center">
                        <p className="text-slate-500 font-semibold text-lg">{status === 'break' ? '休息一下' : '专注中'}</p>
                        <p className="text-5xl sm:text-6xl font-bold text-slate-800 tracking-wider">{formatTime(timeLeft)}</p>
                    </div>
                </div>

                {/* Controls */}
                {status === 'idle' ? (
                     <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 mb-8 max-w-xs mx-auto">
                        <button onClick={() => handleSetSession(25)} className={`px-4 py-2 rounded-full font-semibold transition ${sessionLength === 25*60 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>25分钟</button>
                        <button onClick={() => handleSetSession(45)} className={`px-4 py-2 rounded-full font-semibold transition ${sessionLength === 45*60 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>45分钟</button>
                        <button onClick={() => handleSetSession(60)} className={`px-4 py-2 rounded-full font-semibold transition ${sessionLength === 60*60 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>60分钟</button>
                    </div>
                ) : status === 'break' ? (
                     <div className="text-center mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-800">{breakTip}</p>
                    </div>
                ) : null}

                <div className="flex justify-center items-center gap-6">
                    <button onClick={toggleTimer} className="bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition transform hover:scale-110" aria-label={status === 'running' ? 'Pause' : 'Play'}>
                        {status === 'running' ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                    </button>
                    {status !== 'idle' && (
                        <button onClick={resetTimer} className="bg-slate-500 text-white rounded-full p-3 shadow-lg hover:bg-slate-600 transition transform hover:scale-110" aria-label="Reset">
                            <StopIcon className="w-6 h-6"/>
                        </button>
                    )}
                </div>

                {/* The Garden */}
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <h3 className="text-xl font-bold text-center text-slate-700 mb-4">我的花园</h3>
                    <div className="bg-green-50/50 min-h-[10rem] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-center border-2 border-dashed border-green-200">
                        {plants.length > 0 ? (
                            plants.map(plant => <span key={plant.id} className="text-4xl animate-fadeIn" title="一次专注的成果！">{plant.emoji}</span>)
                        ) : (
                            <p className="text-slate-500">花园还是空的，开始一次专注来种下第一棵植物吧！</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FocusGarden;