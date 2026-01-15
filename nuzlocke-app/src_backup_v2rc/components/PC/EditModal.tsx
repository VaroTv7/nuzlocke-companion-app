import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Pokemon } from '../../store/useGameStore';
import { fetchPokemonSpecies, fetchMoveData, fetchPokemonList, fetchMoveList } from '../../utils/pokeapi';
import { TYPES } from '../../utils/typeChart';
import type { PkmnType } from '../../utils/typeChart';
import { X, Save, RefreshCw, Sparkles, Sword } from 'lucide-react';
import { AutocompleteInput } from '../Shared/AutocompleteInput';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pokemon: Pokemon | null;
}

const EMPTY_POKEMON: Pokemon = {
    id: '',
    name: '',
    species: '',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
    types: ['normal'],
    level: 5,
    gender: 'N',
    nature: 'Hardy',
    ability: '',
    item: '',
    status: 'team',
    boxId: 0,
    moves: [
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
    ],
    metLocation: 'Starter',
};

export const EditModal: React.FC<Props> = ({ isOpen, onClose, pokemon }) => {
    const { addPokemon, updatePokemon } = useGameStore();
    const [formData, setFormData] = useState<Pokemon>(EMPTY_POKEMON);
    const [loading, setLoading] = useState(false);

    // Lists for autocomplete
    const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
    const [allMoveNames, setAllMoveNames] = useState<string[]>([]);

    useEffect(() => {
        // Load lists once
        fetchPokemonList().then(setAllPokemonNames);
        fetchMoveList().then(setAllMoveNames);
    }, []);

    useEffect(() => {
        if (pokemon) {
            setFormData(pokemon);
        } else {
            setFormData({ ...EMPTY_POKEMON, id: crypto.randomUUID() });
        }
    }, [pokemon, isOpen]);

    const handleAutoFill = async (speciesName: string) => {
        if (!speciesName) return;
        setLoading(true);
        try {
            const data = await fetchPokemonSpecies(speciesName);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    species: data.name,
                    types: data.types.map((t: string) => t as PkmnType),
                    sprite: data.sprite
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMoveAutoFill = async (index: number, moveName: string) => {
        if (!moveName) return;
        try {
            const data = await fetchMoveData(moveName);
            if (data) {
                const newMoves = [...formData.moves];
                newMoves[index] = {
                    ...newMoves[index],
                    name: data.name,
                    type: data.type as PkmnType,
                    power: data.power,
                    accuracy: data.accuracy,
                    pp: data.pp
                };
                setFormData(prev => ({ ...prev, moves: newMoves }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = () => {
        const finalData = {
            ...formData,
            name: formData.name || formData.species || 'Sin Mote'
        };

        if (pokemon) {
            updatePokemon(pokemon.id, finalData);
        } else {
            addPokemon(finalData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyber-primary/50 shadow-[0_0_50px_rgba(0,243,255,0.2)]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-cyber-dark z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {pokemon ? 'EDITAR POKÉMON' : 'NUEVO RECLUTA'}
                        <Sparkles className="text-cyber-warning" size={20} />
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Main Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-32 h-32 rounded-full bg-black/40 border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden group">
                                {formData.sprite ? (
                                    <img src={formData.sprite} alt="Sprite" className="w-full h-full object-contain pixelated" />
                                ) : (
                                    <span className="text-4xl text-gray-700">?</span>
                                )}
                                {loading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-cyber-primary animate-pulse font-bold">CARGANDO...</div>}
                            </div>
                            <div className="flex gap-1 w-full justify-center">
                                {formData.types.map(t => (
                                    <span key={t} className={`px-3 py-1 rounded text-xs font-bold uppercase bg-${t} text-white shadow-sm`}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Fields Column */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="text-xs text-cyber-primary font-bold uppercase tracking-wider mb-1 block">Especie (Autocompletar)</label>
                                <div className="flex gap-2">
                                    <AutocompleteInput
                                        className="cyber-input w-full"
                                        placeholder="ej. Bulbasaur"
                                        options={allPokemonNames}
                                        value={formData.species}
                                        onChange={(val) => setFormData({ ...formData, species: val })}
                                        onSelect={(val) => handleAutoFill(val)}
                                    />
                                    <button
                                        onClick={() => handleAutoFill(formData.species)}
                                        className="p-3 bg-cyber-primary/20 hover:bg-cyber-primary text-cyber-primary hover:text-black rounded-lg transition-colors"
                                        title="Recargar datos"
                                        disabled={loading}
                                    >
                                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-cyber-secondary font-bold uppercase tracking-wider mb-1 block">Mote / Apodo</label>
                                <input
                                    className="cyber-input w-full"
                                    placeholder="Nombre del Pokémon"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Nivel</label>
                                    <input
                                        type="number"
                                        className="cyber-input w-full"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Género</label>
                                    <select
                                        className="cyber-input w-full"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                    >
                                        <option value="M">Macho</option>
                                        <option value="F">Hembra</option>
                                        <option value="N">Sin Género</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Moves Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-cyber-danger">
                            <Sword size={18} /> MOVIMIENTOS
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {formData.moves.map((move, idx) => (
                                <div key={idx} className="glass-panel p-3 bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                                    <div className="flex gap-2 items-center mb-2">
                                        <span className="text-gray-500 font-mono text-xs">0{idx + 1}</span>
                                        <AutocompleteInput
                                            className="bg-transparent border-b border-white/10 focus:border-cyber-primary text-sm w-full outline-none py-1"
                                            placeholder="—"
                                            value={move.name}
                                            options={allMoveNames}
                                            onChange={(val) => {
                                                const newMoves = [...formData.moves];
                                                newMoves[idx] = { ...move, name: val };
                                                setFormData({ ...formData, moves: newMoves });
                                            }}
                                            onSelect={(val) => handleMoveAutoFill(idx, val)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span className={`uppercase font-bold text-${move.type}`}>{move.type || '???'}</span>
                                        <div className="flex gap-2">
                                            <span>POW: <b className="text-white">{move.power || '-'}</b></span>
                                            <span>ACC: <b className="text-white">{move.accuracy || '-'}</b></span>
                                            <span>PP: <b className="text-white">{move.pp || '-'}</b></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-4 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2 rounded-lg font-bold bg-cyber-primary text-black hover:bg-cyber-primary/80 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> GUARDAR
                    </button>
                </div>

            </div>
        </div>
    );
};
