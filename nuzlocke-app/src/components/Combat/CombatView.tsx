import React, { useState } from 'react';
import { Shield, Zap, Sparkles, Flame, Star } from 'lucide-react';
import type { PkmnType } from '../../utils/typeChart';
import { TYPES, getDefensiveMatchups } from '../../utils/typeChart';
import { useGameStore } from '../../store/useGameStore';
import { getAvailableMechanics } from '../../utils/gameRegistry';
import { getTeraDefensiveTypes, getZMoveByType, getMaxMoveByType, getMegaEvolutions } from '../../utils/mechanicsData';
import type { MegaEvolution } from '../../utils/mechanicsData';

// Spanish type names
const TYPE_NAMES_ES: Record<string, string> = {
    normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
    grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
    ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
    rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
    steel: 'Acero', fairy: 'Hada',
};

// Type colors
const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC',
};

// Multiplier labels & colors
const MULT_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
    4: { label: 'x4', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' },
    2: { label: 'x2', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40' },
    0.5: { label: 'x½', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40' },
    0.25: { label: 'x¼', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
    0: { label: 'x0', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' },
};

const TypeBadgeColored: React.FC<{ type: PkmnType }> = ({ type }) => (
    <span
        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-sm"
        style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}
    >
        {TYPE_NAMES_ES[type] || type}
    </span>
);

type CombatTab = 'matchups' | 'tera' | 'mechanics' | 'prep';

export const CombatView: React.FC = () => {
    const [selectedTypes, setSelectedTypes] = useState<PkmnType[]>([]);
    const [teraType, setTeraType] = useState<PkmnType | null>(null);
    const [activeTab, setActiveTab] = useState<CombatTab>('matchups');
    const [searchPokemon, setSearchPokemon] = useState('');

    const { selectedGame } = useGameStore();
    const mechanics = getAvailableMechanics(selectedGame);

    const toggleType = (type: PkmnType) => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) return prev.filter(t => t !== type);
            if (prev.length >= 2) return [prev[1], type];
            return [...prev, type];
        });
    };

    // Compute matchups based on selected types + tera
    const defensiveTypes = teraType && activeTab === 'tera'
        ? getTeraDefensiveTypes(teraType)
        : selectedTypes;

    const matchups = defensiveTypes.length > 0 ? getDefensiveMatchups(defensiveTypes) : null;

    // Mega evolution info
    const megaData: MegaEvolution[] = searchPokemon ? getMegaEvolutions(searchPokemon) : [];

    const tabs: { id: CombatTab; label: string; icon: React.ReactNode; show: boolean }[] = [
        { id: 'matchups', label: 'Matchups', icon: <Shield size={16} />, show: true },
        { id: 'tera', label: 'Tera', icon: <Sparkles size={16} />, show: mechanics.includes('tera') },
        { id: 'mechanics', label: 'Mecánicas', icon: <Flame size={16} />, show: mechanics.some(m => ['mega', 'dynamax', 'zmove'].includes(m)) },
        { id: 'prep', label: 'Battle Prep', icon: <Zap size={16} />, show: true },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ═══ HEADER ═══ */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Shield size={24} className="text-cyber-primary" />
                    Combat Tool
                </h2>
            </div>

            {/* ═══ TAB NAV ═══ */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.filter(t => t.show).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40'
                                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ TYPE SELECTOR (shared) ═══ */}
            {(activeTab === 'matchups' || activeTab === 'tera') && (
                <section className="glass-card p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {activeTab === 'tera' ? 'Tipos Originales del Defensor' : 'Selecciona hasta 2 tipos defensivos'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${selectedTypes.includes(type)
                                        ? 'text-white shadow-lg scale-105 border-white/30'
                                        : 'text-white/60 opacity-50 hover:opacity-80 border-transparent'
                                    }`}
                                style={{
                                    backgroundColor: selectedTypes.includes(type) ? TYPE_COLORS[type] : `${TYPE_COLORS[type]}40`,
                                }}
                            >
                                {TYPE_NAMES_ES[type]}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ MATCHUPS TAB ═══ */}
            {activeTab === 'matchups' && matchups && (
                <section className="glass-card p-5 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Shield size={20} className="text-cyber-secondary" />
                        Debilidades de {selectedTypes.map(t => TYPE_NAMES_ES[t]).join(' / ')}
                    </h3>

                    {[4, 2, 0.5, 0.25, 0].map(mult => {
                        const types = matchups[mult];
                        if (!types || types.length === 0) return null;
                        const cfg = MULT_CONFIG[mult];
                        return (
                            <div key={mult} className={`p-3 rounded-xl border ${cfg.bg}`}>
                                <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                                    {cfg.label} — {mult >= 2 ? 'Débil' : mult === 0 ? 'Inmune' : 'Resiste'}
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {types.map(t => <TypeBadgeColored key={t} type={t} />)}
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* ═══ TERA TAB ═══ */}
            {activeTab === 'tera' && (
                <section className="glass-card p-5 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles size={20} className="text-cyber-secondary" />
                        Teracristalización
                    </h3>
                    <p className="text-sm text-gray-400">
                        Al Teracristalizar, el tipo defensivo del Pokémon se reemplaza por su Tera tipo.
                    </p>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tera Tipo</label>
                        <div className="flex flex-wrap gap-2">
                            {TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTeraType(teraType === type ? null : type)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${teraType === type
                                            ? 'text-white shadow-lg scale-105 border-white/30 ring-2 ring-white/20'
                                            : 'text-white/60 opacity-50 hover:opacity-80 border-transparent'
                                        }`}
                                    style={{
                                        backgroundColor: teraType === type ? TYPE_COLORS[type] : `${TYPE_COLORS[type]}40`,
                                    }}
                                >
                                    {TYPE_NAMES_ES[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Show Tera matchups */}
                    {teraType && (() => {
                        const teraMatchups = getDefensiveMatchups(getTeraDefensiveTypes(teraType));
                        return (
                            <div className="space-y-3 mt-4">
                                <h4 className="text-sm font-semibold text-cyber-primary">
                                    Matchups con Tera {TYPE_NAMES_ES[teraType]}
                                </h4>
                                {[4, 2, 0.5, 0.25, 0].map(mult => {
                                    const types = teraMatchups[mult];
                                    if (!types || types.length === 0) return null;
                                    const cfg = MULT_CONFIG[mult];
                                    return (
                                        <div key={mult} className={`p-3 rounded-xl border ${cfg.bg}`}>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {types.map(t => <TypeBadgeColored key={t} type={t} />)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* STAB info */}
                    {teraType && selectedTypes.length > 0 && (
                        <div className="p-3 rounded-xl border border-cyber-primary/30 bg-cyber-primary/10">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyber-primary">STAB con Tera</span>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {Array.from(new Set([...selectedTypes, teraType])).map(t => (
                                    <TypeBadgeColored key={t} type={t} />
                                ))}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-2">
                                {teraType && selectedTypes.includes(teraType)
                                    ? '⚡ Tera tipo coincide con tipo original — STAB x2.25 en ese tipo'
                                    : '⚡ Tera tipo diferente — STAB x1.5 extra en el tipo Tera'}
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* ═══ MECHANICS TAB ═══ */}
            {activeTab === 'mechanics' && (
                <section className="glass-card p-5 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Flame size={20} className="text-cyber-secondary" />
                        Mecánicas de Combate
                    </h3>

                    {/* Mega Evolution */}
                    {mechanics.includes('mega') && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <Star size={16} className="text-pink-400" /> Mega Evolución
                            </h4>
                            <input
                                type="text"
                                value={searchPokemon}
                                onChange={e => setSearchPokemon(e.target.value.toLowerCase())}
                                placeholder="Buscar Pokémon con Mega..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary/50"
                            />
                            {megaData.length > 0 && (
                                <div className="space-y-2">
                                    {megaData.map((mega, i) => (
                                        <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm capitalize">Mega {mega.pokemon}</span>
                                                <span className="text-xs text-gray-400">{mega.stone}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {mega.newTypes.map(t => <TypeBadgeColored key={t} type={t} />)}
                                            </div>
                                            <p className="text-xs text-gray-400">Habilidad: <span className="text-white">{mega.newAbility}</span></p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {Object.entries(mega.statBoosts).filter(([, v]) => v !== 0).map(([stat, val]) => (
                                                    <span key={stat} className={`text-[10px] px-1.5 py-0.5 rounded ${val > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {stat.toUpperCase()} {val > 0 ? '+' : ''}{val}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchPokemon && megaData.length === 0 && (
                                <p className="text-sm text-gray-500">No se encontró Mega Evolución para "{searchPokemon}"</p>
                            )}
                        </div>
                    )}

                    {/* Z-Moves */}
                    {mechanics.includes('zmove') && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-400" /> Movimientos Z
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {TYPES.map(type => {
                                    const zmove = getZMoveByType(type);
                                    if (!zmove) return null;
                                    return (
                                        <div key={type} className="p-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3">
                                            <TypeBadgeColored type={type} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">{zmove.moveName}</p>
                                                <p className="text-[10px] text-gray-400">BP: {zmove.basePower} | {zmove.category === 'physical' ? 'Físico' : 'Especial'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Dynamax / Max Moves */}
                    {mechanics.includes('dynamax') && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <Flame size={16} className="text-red-400" /> Max Moves (Dynamax)
                            </h4>
                            <p className="text-xs text-gray-500">Al Dynamaxizar, los PS se duplican y cada ataque se convierte en su Max Move correspondiente.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {TYPES.map(type => {
                                    const maxMove = getMaxMoveByType(type);
                                    if (!maxMove) return null;
                                    return (
                                        <div key={type} className="p-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3">
                                            <TypeBadgeColored type={type} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">{maxMove.moveName}</p>
                                                <p className="text-[10px] text-gray-400">{maxMove.effect}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ═══ BATTLE PREP TAB ═══ */}
            {activeTab === 'prep' && <BattlePrepSection />}

            {/* Empty state */}
            {activeTab === 'matchups' && !matchups && (
                <div className="glass-card p-8 rounded-2xl text-center">
                    <Shield size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg font-semibold">Selecciona tipos para ver debilidades</p>
                    <p className="text-gray-600 text-sm mt-1">Elige 1 o 2 tipos arriba para calcular matchups</p>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// BATTLE PREP SUB-COMPONENT
// ═══════════════════════════════════════════
const BattlePrepSection: React.FC = () => {
    const [opponentTeam, setOpponentTeam] = useState<{ name: string; types: PkmnType[] }[]>([]);
    const [newName, setNewName] = useState('');
    const [newTypes, setNewTypes] = useState<PkmnType[]>([]);

    const { pokemon } = useGameStore();
    const myTeam = pokemon.filter(p => p.status === 'team');
    const myPC = pokemon.filter(p => p.status === 'box');

    const addOpponent = () => {
        if (!newName || newTypes.length === 0) return;
        setOpponentTeam(prev => [...prev, { name: newName, types: [...newTypes] }]);
        setNewName('');
        setNewTypes([]);
    };

    const removeOpponent = (idx: number) => {
        setOpponentTeam(prev => prev.filter((_, i) => i !== idx));
    };

    // Analyze opponent weaknesses
    const opponentWeaknesses = opponentTeam.length > 0
        ? (() => {
            const weaknessCount: Record<string, number> = {};
            opponentTeam.forEach(opp => {
                const matchups = getDefensiveMatchups(opp.types);
                [4, 2].forEach(mult => {
                    matchups[mult]?.forEach(type => {
                        weaknessCount[type] = (weaknessCount[type] || 0) + (mult === 4 ? 2 : 1);
                    });
                });
            });
            return Object.entries(weaknessCount)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => ({ type: type as PkmnType, count }));
        })()
        : [];

    return (
        <section className="glass-card p-5 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap size={20} className="text-cyber-warning" />
                Battle Prep — Analiza al rival
            </h3>

            {/* Add opponent Pokémon */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Nombre del Pokémon rival..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary/50"
                        onKeyDown={e => e.key === 'Enter' && addOpponent()}
                    />
                    <button
                        onClick={addOpponent}
                        disabled={!newName || newTypes.length === 0}
                        className="px-4 py-2 bg-cyber-primary/20 text-cyber-primary rounded-xl text-sm font-bold hover:bg-cyber-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Añadir
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setNewTypes(prev =>
                                prev.includes(type) ? prev.filter(t => t !== type) : prev.length < 2 ? [...prev, type] : [prev[1], type]
                            )}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${newTypes.includes(type) ? 'text-white opacity-100' : 'text-white/50 opacity-40 hover:opacity-70'
                                }`}
                            style={{ backgroundColor: newTypes.includes(type) ? TYPE_COLORS[type] : `${TYPE_COLORS[type]}30` }}
                        >
                            {TYPE_NAMES_ES[type]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Opponent team */}
            {opponentTeam.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Equipo Rival ({opponentTeam.length}/6)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {opponentTeam.map((opp, i) => (
                            <div key={i} className="p-2 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate capitalize">{opp.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        {opp.types.map(t => (
                                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white" style={{ backgroundColor: TYPE_COLORS[t] }}>
                                                {TYPE_NAMES_ES[t]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => removeOpponent(i)} className="text-gray-500 hover:text-red-400 transition-colors text-xs">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analysis results */}
            {opponentWeaknesses.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-cyber-primary">🎯 Tipos más efectivos contra este equipo</h4>
                    <div className="flex flex-wrap gap-2">
                        {opponentWeaknesses.slice(0, 8).map(({ type, count }) => (
                            <div key={type} className="flex items-center gap-1.5 p-2 rounded-xl border border-white/10 bg-white/5">
                                <TypeBadgeColored type={type} />
                                <span className="text-xs font-bold text-cyber-warning">{count} hits</span>
                            </div>
                        ))}
                    </div>

                    {/* My team coverage */}
                    {myTeam.length > 0 && (
                        <div className="pt-3 border-t border-white/5">
                            <h4 className="text-sm font-bold text-cyber-success mb-2">✅ Mejores opciones de tu equipo</h4>
                            <div className="space-y-1.5">
                                {myTeam
                                    .map(p => {
                                        const coverage = p.types.reduce((acc, t) => {
                                            const match = opponentWeaknesses.find(w => w.type === t);
                                            return acc + (match?.count || 0);
                                        }, 0);
                                        const moveCoverage = p.moves.reduce((acc, m) => {
                                            const match = opponentWeaknesses.find(w => w.type === m.type);
                                            return acc + (match?.count || 0);
                                        }, 0);
                                        return { ...p, coverage, moveCoverage, totalScore: coverage + moveCoverage };
                                    })
                                    .sort((a, b) => b.totalScore - a.totalScore)
                                    .slice(0, 3)
                                    .map(p => (
                                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl border border-cyber-success/20 bg-cyber-success/5">
                                            {p.sprite && <img src={p.sprite} alt={p.name} className="w-8 h-8 pixelated" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">{p.name} <span className="text-gray-400">({p.species})</span></p>
                                                <div className="flex gap-1 mt-0.5">
                                                    {p.types.map(t => (
                                                        <span key={t} className="text-[9px] px-1 py-0.5 rounded font-bold text-white" style={{ backgroundColor: TYPE_COLORS[t] }}>
                                                            {TYPE_NAMES_ES[t]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-cyber-success">Score: {p.totalScore}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* PC suggestions */}
                    {myPC.length > 0 && (
                        <div className="pt-3 border-t border-white/5">
                            <h4 className="text-sm font-bold text-cyber-secondary mb-2">📦 Alternativas del PC</h4>
                            <div className="space-y-1.5">
                                {myPC
                                    .map(p => {
                                        const coverage = p.types.reduce((acc, t) => {
                                            const match = opponentWeaknesses.find(w => w.type === t);
                                            return acc + (match?.count || 0);
                                        }, 0);
                                        return { ...p, coverage };
                                    })
                                    .sort((a, b) => b.coverage - a.coverage)
                                    .filter(p => p.coverage > 0)
                                    .slice(0, 3)
                                    .map(p => (
                                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-white/5">
                                            {p.sprite && <img src={p.sprite} alt={p.name} className="w-8 h-8 pixelated" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                                            </div>
                                            <span className="text-xs font-bold text-cyber-secondary">Score: {p.coverage}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {opponentTeam.length === 0 && (
                <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">Añade Pokémon del rival para analizar debilidades y encontrar los mejores counters de tu equipo</p>
                </div>
            )}
        </section>
    );
};
