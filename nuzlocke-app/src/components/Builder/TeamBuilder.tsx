import React, { useState, useMemo, useEffect } from 'react';
import { Hammer, Plus, X, Shield, AlertTriangle, CheckCircle, Save, FolderOpen, Swords, Trash2, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { TYPES, getDefensiveMatchups } from '../../utils/typeChart';
import { fetchPokemonList, fetchPokemonSpecies } from '../../utils/pokeapi';
import { AutocompleteInput } from '../Shared/AutocompleteInput';
import type { PkmnType } from '../../utils/typeChart';

// Common competitive coverage moves by type (Simulated warnings)
const COMMON_COVERAGE: Record<string, { type: PkmnType; reason: string }[]> = {
    water: [
        { type: 'ice', reason: 'Suelen llevar Rayo Hielo para cubrir tipos Planta y Dragón' }
    ],
    electric: [
        { type: 'ice', reason: 'Suelen llevar Poder Oculto Hielo / Rayo Hielo para los Tierra' }
    ],
    fighting: [
        { type: 'rock', reason: 'Suelen llevar Avalancha/Roca Afilada para los Voladores' },
        { type: 'dark', reason: 'Suelen llevar Desarme para los Fantasmas/Psíquicos' }
    ],
    ground: [
        { type: 'rock', reason: 'Casi siempre se usa el combo Tierra/Roca (Terremoto + Avalancha)' }
    ],
    psychic: [
        { type: 'fighting', reason: 'Suelen llevar Onda Certera (Focus Blast) para los Siniestros/Acero' },
    ],
    normal: [
        { type: 'ground', reason: 'Suelen llevar Terremoto por cobertura general' }
    ]
};

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
    const { pokemon, savedTeams, saveCustomTeam, deleteCustomTeam } = useGameStore();
    const [team, setTeam] = useState<BuilderPokemon[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customTypes, setCustomTypes] = useState<PkmnType[]>([]);
    const [customSprite, setCustomSprite] = useState<string | undefined>(undefined);
    const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Save / Load / Matchup UI State
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [opponentTeamId, setOpponentTeamId] = useState<string | null>(null);

    // Auto-load current team if empty on mount
    useEffect(() => {
        if (team.length === 0) {
            const activeTeam = pokemon.filter(p => p.status === 'team');
            if (activeTeam.length > 0) {
                setTeam(activeTeam.map(p => ({
                    id: p.id,
                    name: p.name || p.species,
                    types: p.types,
                    sprite: p.sprite,
                })));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch pokemon list for autocomplete
    useEffect(() => {
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
            id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }),
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

    const handleSaveTeam = () => {
        if (!teamName.trim() || team.length === 0) return;
        saveCustomTeam(teamName, team);
        setShowSaveDialog(false);
        setTeamName('');
    };

    const handleLoadTeam = (id: string) => {
        const target = savedTeams.find(t => t.id === id);
        if (target) {
            setTeam(target.pokemon);
            setOpponentTeamId(null); // Reset matchup if changing team
            setShowLoadDialog(false);
        }
    };

    // Extract the opponent team data based on ID
    const opponentTeam = useMemo(() => {
        if (!opponentTeamId) return null;
        if (opponentTeamId === 'active') {
            return pokemon.filter(p => p.status === 'team').map(p => ({
                id: p.id,
                name: p.name || p.species,
                types: p.types,
                sprite: p.sprite,
            }));
        }
        return savedTeams.find(t => t.id === opponentTeamId)?.pokemon || null;
    }, [opponentTeamId, savedTeams, pokemon]);

    // Head-to-Head Competitive Matchup Analyzer
    const matchupAnalysis = useMemo(() => {
        if (!opponentTeam || team.length === 0 || opponentTeam.length === 0) return null;

        type HitDetail = { target: string; multiplier: 2 | 4; attackType: PkmnType; isStab: boolean };
        type ThreatWarning = { target: string; source: string; coverageType: PkmnType; multiplier: 2 | 4; reason: string };

        const advantages: { ourPkmn: string, hits: HitDetail[] }[] = [];
        const threats: { oppPkmn: string, hits: HitDetail[] }[] = [];
        const warnings: ThreatWarning[] = [];

        // Check Our Advantages (STAB only for now)
        team.forEach(ourPkmn => {
            const hits: HitDetail[] = [];
            ourPkmn.types.forEach(ourType => {
                opponentTeam.forEach(oppPkmn => {
                    const matchup = getDefensiveMatchups(oppPkmn.types);
                    if (matchup[4]?.includes(ourType)) {
                        hits.push({ target: oppPkmn.name, multiplier: 4, attackType: ourType, isStab: true });
                    } else if (matchup[2]?.includes(ourType)) {
                        hits.push({ target: oppPkmn.name, multiplier: 2, attackType: ourType, isStab: true });
                    }
                });
            });
            if (hits.length > 0) advantages.push({ ourPkmn: ourPkmn.name, hits });
        });

        // Check Opponent Threats (STAB only) & Coverage Warnings
        opponentTeam.forEach(oppPkmn => {
            const hits: HitDetail[] = [];

            // Check their STAB moves against us
            oppPkmn.types.forEach(oppType => {
                team.forEach(ourPkmn => {
                    const matchup = getDefensiveMatchups(ourPkmn.types);
                    if (matchup[4]?.includes(oppType)) {
                        hits.push({ target: ourPkmn.name, multiplier: 4, attackType: oppType, isStab: true });
                    } else if (matchup[2]?.includes(oppType)) {
                        hits.push({ target: ourPkmn.name, multiplier: 2, attackType: oppType, isStab: true });
                    }
                });

                // Check common coverage for this opponent type
                const commonCoverage = COMMON_COVERAGE[oppType];
                if (commonCoverage) {
                    team.forEach(ourPkmn => {
                        const matchup = getDefensiveMatchups(ourPkmn.types);
                        commonCoverage.forEach(cov => {
                            if (matchup[4]?.includes(cov.type)) {
                                warnings.push({ target: ourPkmn.name, source: oppPkmn.name, coverageType: cov.type, multiplier: 4, reason: cov.reason });
                            } else if (matchup[2]?.includes(cov.type)) {
                                warnings.push({ target: ourPkmn.name, source: oppPkmn.name, coverageType: cov.type, multiplier: 2, reason: cov.reason });
                            }
                        });
                    });
                }
            });
            if (hits.length > 0) threats.push({ oppPkmn: oppPkmn.name, hits });
        });

        return { advantages, threats, warnings };
    }, [team, opponentTeam]);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Hammer size={24} className="text-cyber-primary" />
                    Team Builder
                </h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={importFromStore}
                        className="px-3 py-1.5 bg-cyber-secondary/20 text-cyber-secondary rounded-lg text-xs font-bold hover:bg-cyber-secondary/30 transition-all flex items-center gap-1"
                        title="Importar equipo activo"
                    >
                        <ArrowRight size={14} /> Importar Mi Equipo
                    </button>
                    <button
                        onClick={() => setShowLoadDialog(true)}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all flex items-center gap-1"
                    >
                        <FolderOpen size={14} /> Cargar
                    </button>
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        disabled={team.length === 0}
                        className="px-3 py-1.5 bg-cyber-primary/20 text-cyber-primary rounded-lg text-xs font-bold hover:bg-cyber-primary/30 disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                        <Save size={14} /> Guardar
                    </button>
                    <button
                        onClick={() => { setTeam([]); setOpponentTeamId(null); }}
                        disabled={team.length === 0}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                        <Trash2 size={14} /> Limpiar
                    </button>
                </div>
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
                <div className="glass-card p-5 rounded-2xl space-y-4 border border-cyber-primary/30 animate-slide-up overflow-visible">
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
                        <p className="text-xs text-gray-400 mb-2">✏️ Añadir Pokémon (busca por nombre):</p>
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1 relative" style={{ zIndex: 50 }}>
                                <AutocompleteInput
                                    options={allPokemonNames}
                                    value={customName}
                                    onChange={setCustomName}
                                    onSelect={handlePokemonSelect}
                                    placeholder="Escribe un nombre (ej: Garchomp)..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary/50"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-2.5" style={{ zIndex: 51 }}>
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
                                            <span className="text-[10px] text-red-400 font-bold" title={`${analysis.defensiveWeaknesses[t]} Pokémon tienen debilidad a este tipo`}>(Afecta a {analysis.defensiveWeaknesses[t]})</span>
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

                    {/* Competitive Matchup Analyzer */}
                    <div className="glass-card p-5 rounded-2xl border border-blue-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-400 relative z-10">
                            <Swords size={20} /> Analizador Competitivo
                        </h3>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <label className="text-sm font-semibold text-gray-300">Equipo Rival:</label>
                            <select
                                value={opponentTeamId || ''}
                                onChange={(e) => setOpponentTeamId(e.target.value || null)}
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500/50 outline-none"
                            >
                                <option value="">-- Selecciona un rival --</option>
                                <option value="active">▶ Mi Equipo Activo</option>
                                {savedTeams.map(t => (
                                    <option key={t.id} value={t.id}>💾 {t.name}</option>
                                ))}
                            </select>
                        </div>

                        {opponentTeamId && matchupAnalysis && (
                            <div className="space-y-4 relative z-10 mt-6">
                                {/* Informational Note about multipliers */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                                    <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                                        ℹ️ ¿Cómo se calcula el daño aquí?
                                    </h4>
                                    <ul className="text-xs text-gray-400 space-y-1 ml-6 list-disc">
                                        <li>Los ataques del mismo tipo que el Pokémon ganan <strong>STAB (Bonus de x1.5)</strong> de daño base.</li>
                                        <li><strong className="text-yellow-400">x2</strong> indica un daño <strong>Súper Eficaz</strong>.</li>
                                        <li><strong className="text-red-400">x4</strong> indica un daño <strong>Doble Súper Eficaz</strong> (Suele ser K.O. directo).</li>
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Our Advantages */}
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                                            <CheckCircle size={16} /> Nuestras Amenazas (STAB)
                                        </h4>
                                        {matchupAnalysis.advantages.length > 0 ? (
                                            <div className="space-y-3">
                                                {matchupAnalysis.advantages.map((adv, idx) => (
                                                    <div key={idx} className="bg-black/30 rounded-lg p-2">
                                                        <span className="text-white font-bold text-sm capitalize flex items-center gap-1">
                                                            {adv.ourPkmn}
                                                            <span className="text-[9px] bg-green-500/20 text-green-300 px-1 py-0.5 rounded">STAB x1.5</span>
                                                        </span>
                                                        <div className="flex flex-col gap-1.5 mt-2">
                                                            {adv.hits.map((h, i) => (
                                                                <div key={i} className="flex items-center text-xs gap-1">
                                                                    <span className="text-gray-400">Destruye a</span>
                                                                    <span className="capitalize text-white">{h.target}</span>
                                                                    <span className="text-gray-500">con</span>
                                                                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: TYPE_COLORS[h.attackType] }}>{TYPE_NAMES_ES[h.attackType]}</span>
                                                                    <span className={`font-black ml-auto ${h.multiplier === 4 ? 'text-red-400' : 'text-yellow-400'}`}>x{h.multiplier}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No tienes ataques con STAB eficaces contra este equipo.</p>
                                        )}
                                    </div>

                                    {/* Opponent Threats */}
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Amenazas del Rival (STAB)
                                        </h4>
                                        {matchupAnalysis.threats.length > 0 ? (
                                            <div className="space-y-3">
                                                {matchupAnalysis.threats.map((threat, idx) => (
                                                    <div key={idx} className="bg-black/30 rounded-lg p-2">
                                                        <span className="text-red-400 font-bold text-sm capitalize flex items-center gap-1">
                                                            {threat.oppPkmn}
                                                            <span className="text-[9px] bg-red-500/20 text-red-300 px-1 py-0.5 rounded">STAB x1.5</span>
                                                        </span>
                                                        <div className="flex flex-col gap-1.5 mt-2">
                                                            {threat.hits.map((h, i) => (
                                                                <div key={i} className="flex items-center text-xs gap-1">
                                                                    <span className="text-gray-400">Pega a</span>
                                                                    <span className="capitalize text-white">{h.target}</span>
                                                                    <span className="text-gray-500">con</span>
                                                                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: TYPE_COLORS[h.attackType] }}>{TYPE_NAMES_ES[h.attackType]}</span>
                                                                    <span className={`font-black ml-auto ${h.multiplier === 4 ? 'text-red-400' : 'text-yellow-400'}`}>x{h.multiplier}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">El rival no tiene ventaja de STAB contra tu equipo.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Coverage Warnings */}
                                {matchupAnalysis.warnings.length > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-4">
                                        <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Alertas de Cobertura Competitiva
                                        </h4>
                                        <p className="text-xs text-gray-400 mb-3">En competitivo, los rivales suelen llevar ataques de otros tipos (sin STAB) para cubrir sus debilidades. Cuidado con esto:</p>
                                        <div className="space-y-2">
                                            {matchupAnalysis.warnings.map((warn, idx) => (
                                                <div key={idx} className="bg-black/40 border border-yellow-500/10 rounded-lg p-3 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-white capitalize font-bold">{warn.source}</span>
                                                        <span className="text-gray-400 text-xs">puede golpear a</span>
                                                        <span className="text-white capitalize font-bold">{warn.target}</span>
                                                        <span className={`font-black ml-auto ${warn.multiplier === 4 ? 'text-red-400' : 'text-yellow-400'}`}>x{warn.multiplier}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-500">Usando tipo:</span>
                                                        <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: TYPE_COLORS[warn.coverageType] }}>{TYPE_NAMES_ES[warn.coverageType]}</span>
                                                    </div>
                                                    <p className="text-xs text-yellow-500 italic mt-1 bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/10">
                                                        "{warn.reason}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card p-6 rounded-2xl w-full max-w-sm border border-cyber-primary/50">
                        <h3 className="text-lg font-bold mb-4">Guardar Equipo</h3>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Ej: Estrategia Alto Mando"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white mb-4 focus:border-cyber-primary/50 outline-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
                            <button
                                onClick={handleSaveTeam}
                                disabled={!teamName.trim()}
                                className="px-4 py-2 bg-cyber-primary text-black font-bold rounded-xl text-sm disabled:opacity-50 transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLoadDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card p-6 rounded-2xl w-full max-w-md border border-blue-500/30 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2"><FolderOpen size={20} className="text-blue-400" /> Cargar Equipo</h3>
                            <button onClick={() => setShowLoadDialog(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {savedTeams.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aún no has guardado ningún equipo personalizado.</p>
                            ) : (
                                savedTeams.map(st => (
                                    <div key={st.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex group">
                                        <div className="flex-1 cursor-pointer" onClick={() => handleLoadTeam(st.id)}>
                                            <h4 className="font-bold text-sm text-white mb-2 group-hover:text-blue-400 transition-colors">{st.name}</h4>
                                            <div className="flex gap-1">
                                                {st.pokemon.slice(0, 6).map((p, i) => (
                                                    <img key={i} src={p.sprite} alt={p.name} className="w-8 h-8 pixelated opacity-80 group-hover:opacity-100" />
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteCustomTeam(st.id); }}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-all"
                                            title="Eliminar equipo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
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
