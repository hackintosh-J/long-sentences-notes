import React, { useState, useMemo } from 'react';
import { SUBSTRATES, METABOLIC_PATHWAYS_DATA } from '../../constants';
import type { Substrate, MetabolicPathway } from '../../types';
import { ArrowLeftIcon, LightbulbIcon } from '../icons';

interface MedicineCornerProps {
    onBack: () => void;
}

const MedicineCorner: React.FC<MedicineCornerProps> = ({ onBack }) => {
    const [substrate, setSubstrate] = useState<Substrate>('glucose');
    const [isAerobic, setIsAerobic] = useState(true);
    const [moles, setMoles] = useState(1);
    const [result, setResult] = useState<{ pathway: MetabolicPathway; totals: any } | null>(null);

    const selectedSubstrateInfo = useMemo(() => SUBSTRATES.find(s => s.id === substrate), [substrate]);

    const handleCalculate = () => {
        const condition = isAerobic ? 'aerobic' : 'anaerobic';
        const pathway = METABOLIC_PATHWAYS_DATA.find(p => p.substrate === substrate && p.condition === condition);
        
        if (!pathway) {
            setResult(null);
            return;
        }

        const totals = pathway.steps.reduce((acc, step) => {
            acc.nadh += step.nadh;
            acc.fadh2 += step.fadh2;
            acc.atp_gtp += step.atp_gtp;
            return acc;
        }, { nadh: 0, fadh2: 0, atp_gtp: 0 });

        const finalATP = (totals.nadh * 2.5) + (totals.fadh2 * 1.5) + totals.atp_gtp;
        const oxygen = pathway.oxygen_needed_per_mol ? pathway.oxygen_needed_per_mol(16) : 0; // 16 is for palmitic acid
        const co2 = pathway.co2_produced_per_mol ? pathway.co2_produced_per_mol(16) : 0;

        setResult({
            pathway,
            totals: { ...totals, finalATP, oxygen, co2 }
        });
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
  
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <h2 className="text-3xl font-bold text-teal-800 mb-2">西综计算模拟</h2>
            <p className="text-slate-500 mb-6">选择底物、摩尔数和反应条件，精确计算能量代谢产物。</p>
            
            {/* --- Input Form --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                {/* Substrate Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">1. 选择底物</label>
                    <div className="flex flex-col space-y-2">
                        {SUBSTRATES.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => setSubstrate(s.id)}
                                className={`p-3 rounded-lg text-left transition-all text-sm font-semibold border-2 ${substrate === s.id ? 'bg-teal-100 text-teal-900 border-teal-400' : 'bg-white hover:bg-slate-100 border-slate-200'}`}
                            >
                                {s.name} {s.formula && <span className="text-xs text-slate-500">({s.formula})</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Condition Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">2. 反应条件</label>
                     <div className="flex rounded-lg border-2 border-slate-200 bg-white p-1">
                        <button onClick={() => setIsAerobic(true)} className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${isAerobic ? 'bg-teal-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>有氧</button>
                        <button onClick={() => setIsAerobic(false)} disabled={substrate === 'palmitic_acid'} className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${!isAerobic ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-100'} ${substrate === 'palmitic_acid' && 'cursor-not-allowed opacity-50'}`}>无氧</button>
                    </div>
                     {substrate === 'palmitic_acid' && !isAerobic && <p className="text-xs text-red-600 mt-2">脂肪酸不能进行无氧氧化。</p>}
                </div>

                {/* Moles & Calculate */}
                <div>
                    <label htmlFor="moles" className="block text-sm font-medium text-slate-700 mb-2">3. 输入摩尔数</label>
                    <input 
                        type="number" 
                        id="moles"
                        value={moles}
                        onChange={(e) => setMoles(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-3 rounded-lg border-2 border-slate-200 focus:ring-teal-500 focus:border-teal-500 mb-4"
                    />
                    <button 
                        onClick={handleCalculate} 
                        className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
                    >
                        开始计算
                    </button>
                </div>
            </div>

            {/* --- Result Display --- */}
            {result && (
                <div className="mt-8 animate-fadeIn">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">计算结果: {moles} mol {selectedSubstrateInfo?.name}</h3>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-green-50 text-green-900 p-4 rounded-xl text-center">
                            <p className="text-3xl font-bold">{(result.totals.finalATP * moles).toFixed(1)}</p>
                            <p className="text-sm font-semibold">净生成 ATP (mol)</p>
                        </div>
                        <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-center">
                            <p className="text-3xl font-bold">{(result.totals.oxygen * moles)}</p>
                            <p className="text-sm font-semibold">耗氧量 (mol)</p>
                        </div>
                        <div className="bg-slate-100 text-slate-900 p-4 rounded-xl text-center">
                            <p className="text-3xl font-bold">{(result.totals.co2 * moles)}</p>
                            <p className="text-sm font-semibold">生成 CO₂ (mol)</p>
                        </div>
                         <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-center">
                            <p className="text-3xl font-bold">{result.totals.nadh * moles} / {result.totals.fadh2 * moles}</p>
                            <p className="text-sm font-semibold">NADH / FADH₂ (mol)</p>
                        </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                        <h4 className="flex items-center text-xl font-bold text-slate-700 mb-3">
                            <LightbulbIcon className="h-6 w-6 mr-2 text-amber-500"/>
                            分步解析
                        </h4>
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                            <p className="text-sm text-slate-600 font-semibold">{result.pathway.description}</p>
                            {result.pathway.steps.map((step, index) => (
                                <div key={index} className="p-4 bg-white rounded-md border">
                                    <h5 className="font-bold text-teal-800">{step.title}</h5>
                                    <p className="text-sm text-slate-600 my-2">{step.details}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                        <span className="font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">NADH: {step.nadh > 0 ? `+${step.nadh}` : step.nadh}</span>
                                        <span className="font-semibold bg-violet-100 text-violet-800 px-2 py-0.5 rounded">FADH₂: +{step.fadh2}</span>
                                        <span className="font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">ATP/GTP: {step.atp_gtp > 0 ? `+${step.atp_gtp}`: step.atp_gtp}</span>
                                    </div>
                                </div>
                            ))}
                             <div className="p-4 bg-white rounded-md border border-teal-300 shadow-lg">
                                 <h5 className="font-bold text-teal-900">最终核算</h5>
                                 <p className="text-sm text-slate-700 mt-2">{result.pathway.final_note}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  };
  
  export default MedicineCorner;
