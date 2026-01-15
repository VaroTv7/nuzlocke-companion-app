import React, { useState, useEffect } from 'react';
import { fetchMoveList, fetchMoveData } from '../../utils/pokeapi';
import { getEnglishMoveName, getSpanishMoveList } from '../../utils/moveTranslations';
import { AutocompleteInput } from '../Shared/AutocompleteInput';
import { TypeBadge } from '../Shared/TypeBadge';
import { Search, Zap, Crosshair, BarChart } from 'lucide-react';
import type { PkmnType } from '../../utils/typeChart';

export const MoveDex: React.FC = () => {
    const [allMoves, setAllMoves] = useState<string[]>([]);
    const [selectedMove, setSelectedMove] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [moveData, setMoveData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([fetchMoveList(), Promise.resolve(getSpanishMoveList())])
            .then(([moves, spanishMoves]) => {
                // Combine and remove duplicates, sorting alphabetically
                const combined = Array.from(new Set([...moves, ...spanishMoves])).sort();
                setAllMoves(combined);
            });
    }, []);

    useEffect(() => {
        if (selectedMove) {
            setLoading(true);
            setSearchTerm(selectedMove);
            // Translate if it's a Spanish name, otherwise use as is
            const englishName = getEnglishMoveName(selectedMove);
            fetchMoveData(englishName).then(data => {
                setMoveData(data);
                setLoading(false);
            });
        }
    }, [selectedMove]);

    const handleSelect = (val: string) => {
        setSearchTerm(val);
        setSelectedMove(val);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-24 md:pb-8">
            <div className="glass-card p-6 rounded-2xl bg-black/40 border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyber-secondary">
                    <Search className="text-cyber-secondary" />
                    MoveDex <span className="text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">Base de Datos de Ataques</span>
                </h2>

                <div className="mb-8">
                    <AutocompleteInput
                        options={allMoves}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSelect={handleSelect}
                        placeholder="Buscar movimiento (ej: Flamethrower)..."
                        className="w-full bg-black/50 border-white/20 text-lg py-3"
                    />
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-cyber-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-400 animate-pulse">Analizando datos del movimiento...</p>
                    </div>
                )}

                {!loading && moveData && (
                    <div className="animate-slide-up grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Header Card */}
                        <div className="col-span-1 md:col-span-3 glass-card p-6 bg-gradient-to-r from-gray-900 to-black border-l-4 border-cyber-secondary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black text-white capitalize mb-1">{moveData.name}</h3>
                                    <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">{moveData.damage_class || 'Estado'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="scale-110 origin-top-right">
                                        <TypeBadge type={moveData.type as PkmnType} size="md" />
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-300 italic border-t border-white/10 pt-4">
                                "{moveData.description}"
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center group hover:border-cyber-danger/50 transition-colors">
                                <div className="text-cyber-danger mb-2 flex justify-center"><Zap size={24} /></div>
                                <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Potencia</div>
                                <div className="text-2xl font-black text-white">{moveData.power || '-'}</div>
                            </div>

                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center group hover:border-cyber-primary/50 transition-colors">
                                <div className="text-cyber-primary mb-2 flex justify-center"><Crosshair size={24} /></div>
                                <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Precisión</div>
                                <div className="text-2xl font-black text-white">{moveData.accuracy ? moveData.accuracy + '%' : '-'}</div>
                            </div>

                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center group hover:border-cyber-warning/50 transition-colors">
                                <div className="text-cyber-warning mb-2 flex justify-center"><BarChart size={24} /></div>
                                <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">PP</div>
                                <div className="text-2xl font-black text-white">{moveData.pp}</div>
                            </div>
                        </div>

                    </div>
                )}

                {!loading && !moveData && (
                    <div className="text-center py-12 text-gray-600 border-2 border-dashed border-white/5 rounded-xl">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Selecciona un movimiento para ver sus datos tácticos.</p>
                    </div>
                )}

            </div>
        </div>
    );
};
