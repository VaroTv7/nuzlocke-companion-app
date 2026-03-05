import React, { useState, useMemo } from 'react';
import { Hammer, Plus, X, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { TYPES, getDefensiveMatchups } from '../../utils/typeChart';
import { fetchPokemonList, fetchPokemonSpecies } from '../../utils/pokeapi';
import { AutocompleteInput } from '../Shared/AutocompleteInput';
import type { PkmnType } from '../../utils/typeChart';

const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC',
};

const TYPE_NAMES_ES: Record<string, string> = {
    normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
    grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
    ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
    rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
    steel: 'Acero', fairy: 'Hada',
};

interface BuilderPokemon {
    id: string;
    name: string;
    types: PkmnType[];
    sprite?: string;
}

export const TeamBuilder: React.FC = () => {
    const { pokemon } = useGameStore();
    const [team, setTeam] = useState<BuilderPokemon[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customTypes, setCustomTypes] = useState<PkmnType[]>([]);
    const [customSprite, setCustomSprite] = useState<string | undefined>(undefined);
    const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch pokemon list for autocomplete
    React.useEffect(() => {
        if (showPicker) {
            fetchPokemonList().then(setAllPokemonNames);
        }
    }, [showPicker]);

    // Import from store team
    const importFromStore = () => {
        const storePokemon = pokemon.filter(p => p.status === 'team').map(p => ({
            id: p.id,
            name: p.name || p.species,
            types: p.types,
            sprite: p.sprite,
        }));
        setTeam(storePokemon);
    };

    const addCustomPokemon = () => {
        if (!customName || customTypes.length === 0) return;
        setTeam(prev => [...prev, {
            id: crypto.randomUUID(),
            name: customName,
            types: [...customTypes],
            sprite: customSprite,
        }]);
        setCustomName('');
        setCustomTypes([]);
        setCustomSprite(undefined);
        setShowPicker(false);
    };

    const handlePokemonSelect = async (name: string) => {
        setCustomName(name);
        setIsSearching(true);
        try {
            const data = await fetchPokemonSpecies(name);
            if (data) {
                setCustomTypes(data.types as PkmnType[]);
                setCustomSprite(data.sprite);
            }
        } catch (error) {
            console.error("Error fetching pokemon species data", error);
        } finally {
            setIsSearching(false);
        }
    };

    const removePokemon = (id: string) => {
        setTeam(prev => prev.filter(p => p.id !== id));
    };

    // Type coverage analysis
    const analysis = useMemo(() => {
        if (team.length === 0) return null;

        // Defensive: what types are we weak to?
        const defensiveWeaknesses: Record<string, number> = {};
        const defensiveResistances: Record<string, number> = {};
        const defensiveImmunities: Record<string, number> = {};

        team.forEach(p => {
            const matchups = getDefensiveMatchups(p.types);
            [4, 2].forEach(mult => {
                matchups[mult]?.forEach(type => {
                    defensiveWeaknesses[type] = (defensiveWeaknesses[type] || 0) + 1;
                });
            });
            [0.5, 0.25].forEach(mult => {
                matchups[mult]?.forEach(type => {
                    defensiveResistances[type] = (defensiveResistances[type] || 0) + 1;
                });
            });
            matchups[0]?.forEach(type => {
                defensiveImmunities[type] = (defensiveImmunities[type] || 0) + 1;
            });
        });

        // Offensive: what types can we hit super-effectively?
        const offensiveCoverage: Set<PkmnType> = new Set();
        team.forEach(p => {
            p.types.forEach(type => {
                // Check what this attacking type is super-effective against
                TYPES.forEach(defType => {
                    const matchup = getDefensiveMatchups([defType]);
                    if (matchup[2]?.includes(type) || matchup[4]?.includes(type)) {
                        offensiveCoverage.add(defType);
                    }
                });
            });
        });

        const uncoveredTypes = TYPES.filter(t => !offensiveCoverage.has(t));

        // Shared weaknesses (types that hit 3+ team members)
        const sharedWeaknesses = Object.entries(defensiveWeaknesses)
            .filter(([, count]) => count >= 3)
            .sort(([, a], [, b]) => b - a)
            .map(([type]) => type as PkmnType);

        // Overall score
        const score = Math.max(0, Math.min(100,
            100
            - (sharedWeaknesses.length * 15)
            - (uncoveredTypes.length * 5)
            + (Object.keys(defensiveImmunities).length * 5)
            + (team.length >= 6 ? 10 : 0)
        ));

        return {
            defensiveWeaknesses,
            defensiveResistances,
            defensiveImmunities,
            offensiveCoverage: Array.from(offensiveCoverage),
            uncoveredTypes,
            sharedWeaknesses,
            score,
        };
    }, [team]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Hammer size={24} className="text-cyber-primary" />
                    Team Builder
                </h2>
                <button
                    onClick={importFromStore}
                    className="px-3 py-1.5 bg-cyber-secondary/20 text-cyber-secondary rounded-lg text-xs font-bold hover:bg-cyber-secondary/30 transition-all"
                >
                    Importar mi equipo
                </button>
            </div>

            {/* Team slots */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {team.map(p => (
                    <div key={p.id} className="glass-card p-3 rounded-xl relative group">
                        <button
                            onClick={() => removePokemon(p.id)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                        >
                            <X size={10} />
                        </button>
                        {p.sprite && (
                            <img src={p.sprite} alt={p.name} className="w-14 h-14 mx-auto pixelated" />
                        )}
                        <p className="text-xs font-bold text-white text-center truncate mt-1 capitalize">{p.name}</p>
                        <div className="flex justify-center gap-1 mt-1.5">
                            {p.types.map(t => (
                                <span key={t} className="text-[8px] px-1.5 py-0.5 rounded font-bold text-white" style={{ backgroundColor: TYPE_COLORS[t] }}>
                                    {TYPE_NAMES_ES[t]}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {team.length < 6 && (
                    <button
                        onClick={() => setShowPicker(true)}
                        className="glass-card flex flex-col items-center justify-center p-4 border-dashed border-2 border-white/20 hover:border-cyber-primary/50 group rounded-xl transition-all min-h-[120px]"
                    >
                        <Plus size={24} className="text-gray-500 group-hover:text-cyber-primary transition-colors" />
                        <span className="text-[10px] text-gray-500 group-hover:text-white mt-1 uppercase font-bold tracking-wider">Añadir</span>
                    </button>
                )}
            </div>

            {/* Add Pokémon picker */}
            {showPicker && (
                <div className="glass-card p-5 rounded-2xl space-y-4 border border-cyber-primary/30 animate-slide-up">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Añadir Pokémon al equipo</h3>

                    {/* From store PC */}
                    {pokemon.filter(p => p.status === 'box' && !team.find(t => t.id === p.id)).length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 mb-2">📦 Desde tu PC:</p>
                            <div className="flex flex-wrap gap-2">
                                {pokemon
                                    .filter(p => p.status === 'box' && !team.find(t => t.id === p.id))
                                    .slice(0, 12)
                                    .map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setTeam(prev => [...prev, {
                                                    id: p.id,
                                                    name: p.name || p.species,
                                                    types: p.types,
                                                    sprite: p.sprite,
                                                }]);
                                                setShowPicker(false);
                                            }}
                                            className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                                        >
                                            {p.sprite && <img src={p.sprite} alt={p.name} className="w-6 h-6 pixelated" />}
                                            <span className="text-xs text-white capitalize">{p.name || p.species}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Custom entry */}
                    <div>
                        <p className="text-xs text-gray-400 mb-2">✏️ Añadir manualmente:</p>
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1 relative">
                                <AutocompleteInput
                                    options={allPokemonNames}
                                    value={customName}
                                    onChange={setCustomName}
                                    onSelect={handlePokemonSelect}
                                    placeholder="Nombre del Pokémon..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary/50"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-2.5">
                                        <div className="animate-spin w-4 h-4 border-2 border-cyber-primary border-t-transparent rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={addCustomPokemon}
                                disabled={!customName || customTypes.length === 0 || isSearching}
                                className="px-4 py-2 bg-cyber-primary/20 text-cyber-primary rounded-xl text-xs font-bold hover:bg-cyber-primary/30 disabled:opacity-30 transition-all self-start h-[38px]"
                            >
                                Añadir
                            </button>
                        </div>
                        {customSprite && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-black/20 rounded-lg border border-white/5 animate-fade-in">
                                <img src={customSprite} alt="Preview" className="w-10 h-10 pixelated" />
                                <span className="text-xs text-gray-400 capitalize">{customName.replace(/-/g, ' ')} detectado</span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                            {TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setCustomTypes(prev =>
                                        prev.includes(type) ? prev.filter(t => t !== type) : prev.length < 2 ? [...prev, type] : [prev[1], type]
                                    )}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${customTypes.includes(type) ? 'text-white opacity-100' : 'text-white/40 opacity-40 hover:opacity-60'
                                        }`}
                                    style={{ backgroundColor: customTypes.includes(type) ? TYPE_COLORS[type] : `${TYPE_COLORS[type]}30` }}
                                >
                                    {TYPE_NAMES_ES[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setShowPicker(false)} className="text-xs text-gray-500 hover:text-white transition-colors">
                        Cancelar
                    </button>
                </div>
            )}

            {/* Analysis */}
            {analysis && (
                <div className="space-y-4">
                    {/* Score */}
                    <div className="glass-card p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold">Puntuación del Equipo</h3>
                            <span className={`text-3xl font-black ${analysis.score >= 70 ? 'text-cyber-success' : analysis.score >= 40 ? 'text-cyber-warning' : 'text-cyber-danger'
                                }`}>
                                {analysis.score}
                            </span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${analysis.score >= 70 ? 'bg-cyber-success' : analysis.score >= 40 ? 'bg-cyber-warning' : 'bg-cyber-danger'
                                    }`}
                                style={{ width: `${analysis.score}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Shared Weaknesses */}
                        {analysis.sharedWeaknesses.length > 0 && (
                            <div className="glass-card p-4 rounded-xl border border-red-500/20">
                                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
                                    <AlertTriangle size={16} /> Debilidades Compartidas
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">Estos tipos golpean a 3+ miembros del equipo:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {analysis.sharedWeaknesses.map(t => (
                                        <div key={t} className="flex items-center gap-1">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: TYPE_COLORS[t] }}>
                                                {TYPE_NAMES_ES[t]}
                                            </span>
                                            <span className="text-[10px] text-red-400 font-bold">×{analysis.defensiveWeaknesses[t]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Uncovered Types */}
                        <div className="glass-card p-4 rounded-xl border border-white/10">
                            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                                <Shield size={16} /> Cobertura Ofensiva
                            </h4>
                            {analysis.uncoveredTypes.length > 0 ? (
                                <>
                                    <p className="text-xs text-gray-400 mb-2">No cubres estos tipos con SE:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {analysis.uncoveredTypes.map(t => (
                                            <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold text-white opacity-60" style={{ backgroundColor: TYPE_COLORS[t] }}>
                                                {TYPE_NAMES_ES[t]}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-cyber-success">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-semibold">¡Cobertura perfecta!</span>
                                </div>
                            )}
                        </div>

                        {/* Defensive coverage map */}
                        <div className="glass-card p-4 rounded-xl border border-white/10 md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-300 mb-3">Mapa Defensivo por Tipo</h4>
                            <div className="grid grid-cols-6 md:grid-cols-9 gap-1.5">
                                {TYPES.map(type => {
                                    const weakTo = analysis.defensiveWeaknesses[type] || 0;
                                    const resistsTo = (analysis.defensiveResistances[type] || 0) + (analysis.defensiveImmunities[type] || 0);
                                    const net = resistsTo - weakTo;

                                    return (
                                        <div
                                            key={type}
                                            className={`p-2 rounded-lg text-center border ${net > 0 ? 'border-green-500/30 bg-green-500/10' :
                                                net < 0 ? 'border-red-500/30 bg-red-500/10' :
                                                    'border-white/10 bg-white/5'
                                                }`}
                                            title={`Débil: ${weakTo}, Resiste: ${resistsTo}`}
                                        >
                                            <span className="text-[8px] font-bold text-white block" style={{ color: TYPE_COLORS[type] }}>
                                                {TYPE_NAMES_ES[type]}
                                            </span>
                                            <span className={`text-[10px] font-black ${net > 0 ? 'text-green-400' : net < 0 ? 'text-red-400' : 'text-gray-500'
                                                }`}>
                                                {net > 0 ? `+${net}` : net}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">Verde = más resistencias que debilidades | Rojo = más debilidades</p>
                        </div>
                    </div>
                </div>
            )}

            {team.length === 0 && !showPicker && (
                <div className="glass-card p-8 rounded-2xl text-center">
                    <Hammer size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg font-semibold">Construye tu equipo ideal</p>
                    <p className="text-gray-600 text-sm mt-1">Añade Pokémon para ver análisis de cobertura y debilidades</p>
                </div>
            )}
        </div>
    );
};
