import React, { useState, useEffect } from 'react';
import { fetchPokemonList, fetchPokemonSpecies } from '../../utils/pokeapi';
import { AutocompleteInput } from '../Shared/AutocompleteInput';
import { TypeBadge } from '../Shared/TypeBadge';
import { Search, Activity, Shield, Zap, Wind, User } from 'lucide-react';
import type { PkmnType } from '../../utils/typeChart';

export const Pokedex: React.FC = () => {
    const [allPokemon, setAllPokemon] = useState<string[]>([]);
    const [selectedMon, setSelectedMon] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState(''); // New state for input
    const [pkmnData, setPkmnData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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
        </div>
    );
};
