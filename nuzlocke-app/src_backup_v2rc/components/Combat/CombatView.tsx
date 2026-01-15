import React, { useState } from 'react';
import { TYPES, getEffectiveness } from '../../utils/typeChart';
import type { PkmnType } from '../../utils/typeChart';
import { TypeBadge } from '../Shared/TypeBadge';

export const CombatView: React.FC = () => {
    const [atkType, setAtkType] = useState<PkmnType>('normal');
    const [defType1, setDefType1] = useState<PkmnType>('normal');
    const [defType2, setDefType2] = useState<PkmnType | 'none'>('none');

    const effectiveness = getEffectiveness(atkType, defType1, defType2 === 'none' ? undefined : defType2);

    const getMultiplierColor = (mult: number) => {
        if (mult >= 4) return 'text-cyber-success drop-shadow-[0_0_10px_rgba(0,255,157,0.8)]';
        if (mult === 2) return 'text-cyber-success';
        if (mult === 1) return 'text-white';
        if (mult === 0.5) return 'text-cyber-danger';
        if (mult <= 0.25) return 'text-cyber-danger drop-shadow-[0_0_10px_rgba(255,85,85,0.8)]';
        return 'text-gray-500';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="glass-card p-8 rounded-2xl text-center">
                <h2 className="text-3xl font-cyber font-bold mb-8 tracking-wider text-cyber-primary">CALCULADORA DE COMBATE</h2>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                    {/* Attacker */}
                    <div className="space-y-4">
                        <h3 className="text-gray-400 uppercase tracking-widest text-sm">Atacante</h3>
                        <div className="w-48">
                            <div className="grid grid-cols-3 gap-2 p-4 bg-black/30 rounded-xl border border-white/5">
                                {TYPES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setAtkType(t)}
                                        className={`w-full h-8 rounded transition-all transform hover:scale-110 ${atkType === t
                                            ? 'ring-2 ring-white shadow-lg z-10 scale-110'
                                            : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
                                            }`}
                                    >
                                        <TypeBadge type={t} size="sm" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-10">
                            <TypeBadge type={atkType} />
                        </div>
                    </div>

                    {/* Result */}
                    <div className="flex flex-col items-center justify-center w-32">
                        <div className="text-sm text-gray-500 mb-2">DAÑO</div>
                        <div className={`text-6xl font-black font-cyber transition-all duration-300 ${getMultiplierColor(effectiveness)}`}>
                            x{effectiveness}
                        </div>
                    </div>

                    {/* Defender */}
                    <div className="space-y-4">
                        <h3 className="text-gray-400 uppercase tracking-widest text-sm">Defensor</h3>
                        <div className="flex gap-4">
                            {/* Def 1 */}
                            <div className="w-32">
                                <div className="grid grid-cols-2 gap-1 p-2 bg-black/30 rounded-xl border border-white/5 h-64 overflow-y-auto no-scrollbar">
                                    {TYPES.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setDefType1(t)}
                                            className={`w-full h-8 flex items-center justify-center rounded transition-all ${defType1 === t ? 'ring-2 ring-white z-10' : 'opacity-40 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="scale-75"><TypeBadge type={t} size="sm" /></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Def 2 */}
                            <div className="w-32">
                                <div className="grid grid-cols-2 gap-1 p-2 bg-black/30 rounded-xl border border-white/5 h-64 overflow-y-auto no-scrollbar">
                                    <button
                                        onClick={() => setDefType2('none')}
                                        className={`col-span-2 h-8 rounded text-xs border border-dashed border-white/20 mb-2 ${defType2 === 'none' ? 'bg-white/20' : ''}`}
                                    >
                                        Ninguno
                                    </button>
                                    {TYPES.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setDefType2(t)}
                                            className={`w-full h-8 flex items-center justify-center rounded transition-all ${defType2 === t ? 'ring-2 ring-white z-10' : 'opacity-40 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="scale-75"><TypeBadge type={t} size="sm" /></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-center h-10">
                            <TypeBadge type={defType1} />
                            {defType2 !== 'none' && <TypeBadge type={defType2} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
