import React, { useState, useEffect } from 'react';
import { fetchPokemonList, fetchPokemonSpecies, fetchMoveData } from '../../utils/pokeapi';
import { AutocompleteInput } from '../Shared/AutocompleteInput';
import { TypeBadge } from '../Shared/TypeBadge';
import { Search, Activity, Shield, Zap, Wind, User } from 'lucide-react';
import { TYPE_CHART, TYPES } from '../../utils/typeChart';
import type { PkmnType } from '../../utils/typeChart';

// Helper for Defensive Matchups
function getDamageMultiplier(attackerType: PkmnType, defenderTypes: string[]): number {
    let mult = 1;
    defenderTypes.forEach(defType => {
        const dmg = TYPE_CHART[attackerType]?.[defType as PkmnType] ?? 1;
        mult *= dmg;
    });
    return mult;
}

function getDefensiveMatchups(defenderTypes: string[]) {
    const results: Record<number, PkmnType[]> = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
    TYPES.forEach(attackerType => {
        const mult = getDamageMultiplier(attackerType, defenderTypes);
        if (results[mult]) results[mult].push(attackerType);
    });
    return results;
}

export const Pokedex: React.FC = () => {
    const [allPokemon, setAllPokemon] = useState<string[]>([]);
    const [selectedMon, setSelectedMon] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState(''); // New state for input
    const [pkmnData, setPkmnData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [viewingMove, setViewingMove] = useState<any>(null);
    const [moveDetails, setMoveDetails] = useState<Record<string, any>>({});

    useEffect(() => {
        if (pkmnData && pkmnData.moves) {
            const topMoves = pkmnData.moves.slice(0, 20);
            topMoves.forEach((m: any) => {
                fetchMoveData(m.move.name).then(details => {
                    if (details) {
                        setMoveDetails(prev => ({ ...prev, [m.move.name]: details }));
                    }
                });
            });
        }
    }, [pkmnData]);

    useEffect(() => {
        fetchPokemonList().then(setAllPokemon);
    }, []);

    useEffect(() => {
        if (selectedMon) {
            setLoading(true);
            setSearchTerm(selectedMon); // Sync input with selection
            fetchPokemonSpecies(selectedMon).then(data => {
                setPkmnData(data);
                setLoading(false);
            });
        }
    }, [selectedMon]);

    const handleMoveClick = async (moveName: string) => {
        const data = await fetchMoveData(moveName);
        if (data) {
            setViewingMove(data);
        }
    };

    const handleSelect = (val: string) => {
        setSearchTerm(val);
        setSelectedMon(val);
    };

    const getStatIcon = (name: string) => {
        switch (name) {
            case 'hp': return <Activity size={16} />;
            case 'attack': return <SwordIcon />;
            case 'defense': return <Shield size={16} />;
            case 'special-attack': return <Zap size={16} />;
            case 'special-defense': return <Shield size={16} className="text-cyber-primary" />;
            case 'speed': return <Wind size={16} />;
            default: return <User size={16} />;
        }
    };

    const SwordIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" y1="19" x2="19" y2="13" /><line x1="16" y1="16" x2="20" y2="20" /><line x1="19" y1="21" x2="21" y2="19" /></svg>
    )

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-24 md:pb-8">
            <div className="glass-card p-6 rounded-2xl bg-black/40 border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyber-warning">
                    <Search className="text-cyber-warning" />
                    PokéDex <span className="text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">Base de Datos de Especies</span>
                </h2>

                <div className="mb-8">
                    <AutocompleteInput
                        options={allPokemon}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSelect={handleSelect}
                        placeholder="Buscar Pokémon (ej: Garchomp)..."
                        className="w-full bg-black/50 border-white/20 text-lg py-3"
                    />
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-cyber-warning border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-400 animate-pulse">Consultando Pokedex...</p>
                    </div>
                )}

                {!loading && pkmnData && (
                    <div className="animate-slide-up grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Avatar & Info */}
                        <div className="col-span-1 glass-card p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-black border-t-4 border-cyber-warning">
                            <img
                                src={pkmnData.sprite}
                                alt={pkmnData.name}
                                className="w-40 h-40 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            />
                            <h3 className="text-2xl font-black text-white capitalize mt-4">{pkmnData.name}</h3>
                            <div className="flex gap-2 mt-2">
                                {pkmnData.types.map((t: string) => (
                                    <TypeBadge key={t} type={t as PkmnType} size="sm" />
                                ))}
                            </div>
                            <div className="mt-6 w-full space-y-2">
                                <div className="flex justify-between text-sm text-gray-400 border-b border-white/5 pb-1">
                                    <span>Altura</span>
                                    <span className="text-white">{pkmnData.height / 10} m</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400 border-b border-white/5 pb-1">
                                    <span>Peso</span>
                                    <span className="text-white">{pkmnData.weight / 10} kg</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats & Abilities */}
                        <div className="col-span-1 md:col-span-2 space-y-6">

                            {/* Stats */}
                            <div className="glass-card p-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Estadísticas Base</h4>
                                <div className="space-y-3">
                                    {pkmnData.stats.map((s: any) => (
                                        <div key={s.name} className="flex items-center gap-3">
                                            <div className="w-8 flex justify-center text-gray-400">{getStatIcon(s.name)}</div>
                                            <div className="w-24 text-xs font-bold uppercase text-gray-500">{s.name.replace('special-', 'sp. ')}</div>
                                            <div className="flex-1 bg-black/50 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${s.value > 100 ? 'bg-cyber-primary shadow-[0_0_10px_rgba(0,243,255,0.5)]' : 'bg-gray-600'}`}
                                                    style={{ width: `${Math.min(100, (s.value / 150) * 100)}%` }}
                                                />
                                            </div>
                                            <div className="w-8 text-right font-bold text-white">{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Abilities */}
                            <div className="glass-card p-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Habilidades</h4>
                                <div className="flex flex-wrap gap-2">
                                    {pkmnData.abilities.map((a: any) => (
                                        <span
                                            key={a.name}
                                            className={`px-3 py-1 rounded text-sm font-medium border ${a.is_hidden ? 'bg-black/40 border-cyber-danger text-cyber-danger' : 'bg-white/5 border-white/10 text-gray-300'}`}
                                        >
                                            {a.name.replace('-', ' ')} {a.is_hidden && '(Oculta)'}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Defensive Matchups */}
                            <div className="glass-card p-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Debilidades y Resistencias</h4>
                                {(() => {
                                    const matchups = getDefensiveMatchups(pkmnData.types);
                                    return (
                                        <div className="space-y-4">
                                            {/* Weaknesses */}
                                            {matchups[4].length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-red-500 uppercase w-16">Súper x4</span>
                                                    {matchups[4].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                                </div>
                                            )}
                                            {matchups[2].length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-orange-500 uppercase w-16">Débil x2</span>
                                                    {matchups[2].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                                </div>
                                            )}

                                            <div className="h-px bg-white/5 my-2" />

                                            {/* Resistances */}
                                            {matchups[0.5].length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-green-500 uppercase w-16">Resiste x0.5</span>
                                                    {matchups[0.5].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                                </div>
                                            )}
                                            {matchups[0.25].length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-emerald-500 uppercase w-16">Resiste x0.25</span>
                                                    {matchups[0.25].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                                </div>
                                            )}
                                            {matchups[0].length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-gray-500 uppercase w-16">Inmune x0</span>
                                                    {matchups[0].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Moves List */}
                            <div className="glass-card p-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Movimientos Principales</h4>
                                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {pkmnData.moves && pkmnData.moves.slice(0, 20).map((m: any) => {
                                        const details = moveDetails[m.move.name];
                                        return (
                                            <button 
                                                key={m.move.name}
                                                className="text-left text-xs p-2 bg-white/5 hover:bg-white/10 rounded flex justify-between items-center group transition-all"
                                                onClick={() => handleMoveClick(m.move.name)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {details && (
                                                        <>
                                                            <div className="scale-75 origin-left -mr-2">
                                                                <TypeBadge type={details.type} size="sm" />
                                                            </div>
                                                            {details.damage_class === 'physical' && <span title="Físico" className="text-red-400 font-bold">💥</span>}
                                                            {details.damage_class === 'special' && <span title="Especial" className="text-blue-400 font-bold">🔮</span>}
                                                            {details.damage_class === 'status' && <span title="Estado" className="text-gray-400 font-bold">⚪</span>}
                                                        </>
                                                    )}
                                                    <span className="capitalize text-gray-300 group-hover:text-cyber-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                                                        {m.move.name.replace('-', ' ')}
                                                    </span>
                                                </div>
                                                <span className="opacity-0 group-hover:opacity-100 text-cyber-primary">Info ›</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {!loading && !pkmnData && (
                    <div className="text-center py-12 text-gray-600 border-2 border-dashed border-white/5 rounded-xl">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Busca un Pokémon para ver su ficha técnica.</p>
                    </div>
                )}
            </div>

            {/* Move Details Modal */}
            {viewingMove && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setViewingMove(null)}>
                    <div className="glass-card w-full max-w-md p-6 relative border border-white/20" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            onClick={() => setViewingMove(null)}
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <TypeBadge type={viewingMove.type} />
                            <h3 className="text-xl font-bold capitalize text-white">{viewingMove.name}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-white/5 p-2 rounded">
                                    <span className="block text-xs text-gray-500 uppercase">Poder</span>
                                    <span className="text-lg font-bold text-cyber-warning">{viewingMove.power || '-'}</span>
                                </div>
                                <div className="bg-white/5 p-2 rounded">
                                    <span className="block text-xs text-gray-500 uppercase">Precisión</span>
                                    <span className="text-lg font-bold text-cyber-primary">{viewingMove.accuracy || '-'}%</span>
                                </div>
                                <div className="bg-white/5 p-2 rounded">
                                    <span className="block text-xs text-gray-500 uppercase">PP</span>
                                    <span className="text-lg font-bold text-white">{viewingMove.pp}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded text-sm text-gray-300 leading-relaxed italic border-l-2 border-cyber-primary">
                                "{viewingMove.description}"
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 uppercase mt-2">
                                <span>Clase: {viewingMove.damage_class}</span>
                                <span>{viewingMove.originalName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
