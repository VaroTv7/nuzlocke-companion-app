import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { PokemonCard } from './PokemonCard';
import { EditModal } from './EditModal';
import { Plus, Package, Check } from 'lucide-react';
import type { Pokemon } from '../../store/useGameStore';

export const PCView: React.FC = () => {
    const { pokemon, boxes, addBox, updateBox, removePokemon } = useGameStore();
    const [currentBoxId, setCurrentBoxId] = useState(0); // 0 = Team, 1+ = Boxes
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
    const [editingBoxId, setEditingBoxId] = useState<number | null>(null);
    const [editingBoxName, setEditingBoxName] = useState('');

    // Filter Logic
    // If boxId is 0, show status 'team'.
    // If boxId > 0, show status 'box' AND p.boxId matches.
    // BUT we also have a 'dead' status which usually goes to Cementerio (let's say box 3 is Cementerio by default logic or we filter by status).
    // Let's Simplify:
    // Tab 0: Team
    // Tab X: Box X content.
    // We need to ensure 'dead' pokemon are visible somewhere. Let's assume Box 3 is set as 'Cementerio' in store.

    const visiblePokemon = pokemon.filter(p => {
        if (currentBoxId === 0) return p.status === 'team';

        // Check if this box is intended for dead pokemon? 
        // For simplicity, let's just stick to boxId.
        // If p.status is 'dead', maybe it should force boxId to the Graveyard box?
        // Let's trust the data is consistent: if dead, it might be in a box named Cementerio.
        if (p.status === 'dead') {
            // If we are viewing the Graveyard (Box 3 usually), show them?
            // Or just filter by boxId.
            return p.boxId === currentBoxId;
        }

        return p.status === 'box' && p.boxId === currentBoxId;
    });

    const handleBoxRename = (id: number) => {
        if (editingBoxId === id) {
            // Save
            updateBox(id, editingBoxName);
            setEditingBoxId(null);
        } else {
            // Start Edit
            const box = boxes.find(b => b.id === id);
            if (box) {
                setEditingBoxName(box.name);
                setEditingBoxId(id);
            }
        }
    };

    const handleAddNew = () => {
        setEditingPokemon(null);
        setIsModalOpen(true);
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Control Panel */}
            <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 justify-between items-center bg-[#0f172a]">
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setCurrentBoxId(0)}
                        className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${currentBoxId === 0 ? 'bg-cyber-primary text-black' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        EQUIPO
                    </button>
                    {(boxes || []).map(box => (
                        <div key={box.id} className="relative group">
                            {editingBoxId === box.id ? (
                                <div className="flex items-center gap-1 bg-black/40 rounded px-2 py-1">
                                    <input
                                        value={editingBoxName}
                                        onChange={(e) => setEditingBoxName(e.target.value)}
                                        className="bg-transparent text-sm w-24 outline-none text-white"
                                        autoFocus
                                    />
                                    <button onClick={() => handleBoxRename(box.id)} className="text-green-400"><Check size={14} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setCurrentBoxId(box.id)}
                                    // Make "Cementerio" red or distinct if needed
                                    className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${currentBoxId === box.id
                                        ? 'bg-cyber-secondary text-black'
                                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                        }`}
                                    onDoubleClick={() => handleBoxRename(box.id)}
                                >
                                    {box.name}
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addBox}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        title="Nueva Caja"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleAddNew}
                        className="flex-1 md:flex-none px-6 py-2 bg-cyber-primary text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-cyber-primary/80 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                    >
                        <Plus size={18} /> POKÉMON
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visiblePokemon.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center">
                        <Package size={48} className="mb-4 opacity-50" />
                        <p className="text-xl font-bold">Caja Vacía</p>
                        <p className="text-sm">No hay Pokémon en esta ubicación.</p>
                    </div>
                )}
                {visiblePokemon.map(p => (
                    <PokemonCard
                        key={p.id}
                        data={p}
                        onEdit={(pk) => {
                            setEditingPokemon(pk);
                            setIsModalOpen(true);
                        }}
                        onDelete={removePokemon}
                    />
                ))}
            </div>

            <EditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pokemon={editingPokemon}
            />
        </div>
    );
};
