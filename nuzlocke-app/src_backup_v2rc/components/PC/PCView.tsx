import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Pokemon } from '../../store/useGameStore';
import { PokemonCard } from './PokemonCard';
import { EditModal } from './EditModal';
import { Plus, Search, Box } from 'lucide-react';

export const PCView: React.FC = () => {
    const { pokemon, removePokemon } = useGameStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBox, setSelectedBox] = useState<number | 'all'>('all'); // Future proofing
    const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const team = useMemo(() => pokemon.filter(p => p.status === 'team'), [pokemon]);

    // Filter logic
    const pcPokemon = useMemo(() => {
        let list = pokemon.filter(p => p.status === 'box'); // Correctly filter mostly for box
        // We could also show 'dead' here if we wanted, or a separate graveyard

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(p => p.name.toLowerCase().includes(lower) || p.species.toLowerCase().includes(lower));
        }
        return list;
    }, [pokemon, selectedBox, searchTerm]);

    const handleAddNew = () => {
        setEditingPokemon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (p: Pokemon) => {
        setEditingPokemon(p);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Active Team Section */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyber-primary">
                    <span className="text-2xl">⚡</span> EQUIPO ACTIVO <span className="text-sm bg-cyber-primary/20 px-2 py-0.5 rounded text-cyber-primary ml-2">{team.length}/6</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(p => (
                        <PokemonCard
                            key={p.id}
                            data={p}
                            onEdit={handleEdit}
                            onDelete={removePokemon}
                            onDie={(id) => { /* Logic would go here */ }}
                        />
                    ))}
                    {team.length < 6 && (
                        <button
                            onClick={handleAddNew}
                            className="glass-card flex flex-col items-center justify-center p-6 border-dashed border-2 border-white/20 hover:border-cyber-primary/50 group h-32 transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyber-primary/20 transition-colors">
                                <Plus className="text-gray-400 group-hover:text-cyber-primary" />
                            </div>
                            <span className="mt-2 text-sm text-gray-500 group-hover:text-white">Añadir al Equipo</span>
                        </button>
                    )}
                </div>
            </section>

            {/* PC Storage Section */}
            <section className="glass-panel rounded-2xl p-6 min-h-[500px]">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <Box className="text-cyber-secondary" />
                        <h2 className="text-xl font-bold">Cajas del PC</h2>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input
                                className="cyber-input w-full pl-9"
                                placeholder="Buscar Pokémon..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={handleAddNew} className="bg-cyber-secondary hover:bg-cyber-secondary/80 text-white px-4 py-2 rounded flex items-center gap-2 font-bold transition-colors">
                            <Plus size={18} /> <span className="hidden md:inline">Nuevo</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pcPokemon.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No hay Pokémon en el PC que coincidan.
                        </div>
                    ) : (
                        pcPokemon.map(p => (
                            <PokemonCard
                                key={p.id}
                                data={p}
                                onEdit={handleEdit}
                                onDelete={removePokemon}
                            />
                        ))
                    )}
                </div>
            </section>

            <EditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pokemon={editingPokemon}
            />
        </div>
    );
};
