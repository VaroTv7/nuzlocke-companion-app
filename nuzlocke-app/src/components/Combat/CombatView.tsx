import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import type { PkmnType } from '../../utils/typeChart';

// Tipos en inglés (para lógica) y español (para display)
const TYPES: PkmnType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Traducciones al español
const TYPE_NAMES_ES: Record<string, string> = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada',
};

// Type chart: TYPE_CHART[attacker][defender] = multiplier
const TYPE_CHART: Record<string, Record<string, number>> = {
    normal: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
    fire: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
    water: { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
    electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
    grass: { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
    ice: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
    fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
    poison: { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
    ground: { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
    flying: { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
    psychic: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
    bug: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
    ghost: { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
    dragon: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
    dark: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5 },
    steel: { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
    fairy: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 },
};

// Type colors
const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
};

// Calculate damage from attacker to DUAL defender types
function getDamageMultiplier(attackerType: PkmnType, defenderTypes: PkmnType[]): number {
    let mult = 1;
    defenderTypes.forEach(defType => {
        const dmg = TYPE_CHART[attackerType]?.[defType] ?? 1;
        mult *= dmg;
    });
    return mult;
}

// Get defensive matchups for 1 or 2 types
function getDefensiveMatchups(defenderTypes: PkmnType[]) {
    const results: Record<number, PkmnType[]> = {
        4: [],
        2: [],
        1: [],
        0.5: [],
        0.25: [],
        0: [],
    };

    TYPES.forEach(attackerType => {
        const mult = getDamageMultiplier(attackerType, defenderTypes);

        if (mult === 4) results[4].push(attackerType);
        else if (mult === 2) results[2].push(attackerType);
        else if (mult === 1) results[1].push(attackerType);
        else if (mult === 0.5) results[0.5].push(attackerType);
        else if (mult === 0.25) results[0.25].push(attackerType);
        else if (mult === 0) results[0].push(attackerType);
    });

    return results;
}

// Type badge component with Spanish name and color
const TypeBadgeColored: React.FC<{ type: PkmnType }> = ({ type }) => (
    <span
        className="px-3 py-1 rounded text-xs font-bold uppercase inline-block"
        style={{
            backgroundColor: TYPE_COLORS[type] || '#666',
            color: '#fff',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        }}
    >
        {TYPE_NAMES_ES[type] || type}
    </span>
);

export const CombatView: React.FC = () => {
    const [selectedTypes, setSelectedTypes] = useState<PkmnType[]>(['electric']);

    const toggleType = (type: PkmnType) => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) {
                // Remove type (but keep at least one)
                if (prev.length === 1) return prev;
                return prev.filter(t => t !== type);
            } else {
                // Add type (max 2)
                if (prev.length >= 2) {
                    return [prev[1], type]; // Replace first with second, add new
                }
                return [...prev, type];
            }
        });
    };

    const matchups = getDefensiveMatchups(selectedTypes);

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-24 md:pb-8">
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-cyber-dark to-[#0f172a] shadow-2xl border border-white/5">

                {/* Header */}
                <div className="text-center py-4 border-b border-white/5 mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold font-cyber tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-white uppercase">
                        Calculadora de Debilidades
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Selecciona 1 o 2 tipos para ver qué les hace daño</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Type Selector */}
                    <div>
                        <div className="flex items-center justify-center gap-2 mb-4 text-cyber-primary">
                            <Shield size={20} />
                            <h3 className="text-sm font-bold tracking-widest uppercase">Elige los Tipos (máx. 2)</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
                            {TYPES.map(type => {
                                const isSelected = selectedTypes.includes(type);
                                return (
                                    <button
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        style={{
                                            backgroundColor: isSelected ? TYPE_COLORS[type] : '#1e293b',
                                            color: isSelected ? '#fff' : '#6b7280',
                                            textShadow: isSelected ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' : 'none',
                                            borderColor: isSelected ? '#fff' : 'transparent',
                                        }}
                                        className={`
                                            relative py-2 rounded-md font-bold text-[10px] md:text-xs uppercase transition-all duration-200 border
                                            ${isSelected ? 'scale-105 shadow-lg z-10' : 'hover:opacity-80'}
                                        `}
                                    >
                                        {TYPE_NAMES_ES[type]}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-xs text-gray-500 uppercase">Tipos seleccionados</span>
                            <div className="flex justify-center gap-2 mt-2">
                                {selectedTypes.map(t => (
                                    <TypeBadgeColored key={t} type={t} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Matchup Results */}
                    <div className="space-y-4">

                        {/* x4 Super Weak */}
                        {matchups[4].length > 0 && (
                            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                                <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">
                                    ⚠️ Sufre ×4 por
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchups[4].map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        )}

                        {/* x2 Weak */}
                        {matchups[2].length > 0 && (
                            <div className="bg-orange-900/30 border border-orange-500/30 rounded-xl p-4">
                                <h4 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-3">
                                    💥 Sufre ×2 por
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchups[2].map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        )}

                        {/* x1 Neutral */}
                        {matchups[1].length > 0 && (
                            <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-4">
                                <h4 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-3">
                                    ➖ Sufre ×1 por
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchups[1].map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        )}

                        {/* x0.5 Resistant */}
                        {matchups[0.5].length > 0 && (
                            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
                                <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-3">
                                    🛡️ Sufre ×0.5 por
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchups[0.5].map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        )}

                        {/* x0.25 Very Resistant */}
                        {matchups[0.25].length > 0 && (
                            <div className="bg-teal-900/30 border border-teal-500/30 rounded-xl p-4">
                                <h4 className="text-teal-400 font-bold text-sm uppercase tracking-wider mb-3">
                                    🛡️🛡️ Sufre ×0.25 por
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchups[0.25].map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        )}

                        {/* x0 Immune */}
                        {matchups[0].length > 0 && (
                            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4">
                                <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">
                                    ✨ Inmune (×0) a
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchups[0].map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        )}

                        {/* No Weaknesses Message */}
                        {matchups[4].length === 0 && matchups[2].length === 0 && matchups[0].length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                <p>Sin debilidades especiales ni inmunidades</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};
