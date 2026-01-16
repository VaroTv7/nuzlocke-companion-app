import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Pokemon } from '../../store/useGameStore';
import { fetchPokemonSpecies, fetchMoveData, fetchPokemonList, fetchMoveList, fetchAbilityList, fetchNatureList, toggleShinyUrl, getSpriteUrl } from '../../utils/pokeapi';
import type { PkmnType } from '../../utils/typeChart';
import { X, Save, Sparkles, Sword, Star, Zap, Shield, HelpCircle, Trash2, Image as ImageIcon, Monitor, Gamepad2, Ghost } from 'lucide-react';
import { AutocompleteInput } from '../Shared/AutocompleteInput';
import { TypeBadge } from '../Shared/TypeBadge';

// EditModal.tsx

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
    isShiny: false,
    moves: [
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
        { name: '', type: 'normal', power: null, accuracy: null, pp: 0 },
    ],
    metLocation: 'Starter',
};

export const EditModal: React.FC<Props> = ({ isOpen, onClose, pokemon }) => {
    const { addPokemon, updatePokemon, removePokemon, boxes } = useGameStore();
    const [formData, setFormData] = useState<Pokemon>(EMPTY_POKEMON);
    const [loading, setLoading] = useState(false);
    const [viewingMove, setViewingMove] = useState<any>(null);
    const [currentSpeciesId, setCurrentSpeciesId] = useState<number | null>(null);

    // Lists for autocomplete
    const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
    const [allMoveNames, setAllMoveNames] = useState<string[]>([]);
    const [allAbilities, setAllAbilities] = useState<string[]>([]);
    const [allNatures, setAllNatures] = useState<string[]>([]);

    useEffect(() => {
        // Load lists once
        fetchPokemonList().then(setAllPokemonNames);
        fetchMoveList().then(setAllMoveNames);
        fetchAbilityList().then(setAllAbilities);
        fetchNatureList().then(setAllNatures);
    }, []);

    useEffect(() => {
        if (pokemon) {
            setFormData(pokemon);
        } else {
            setFormData({ ...EMPTY_POKEMON, id: '' });
        }
    }, [pokemon, isOpen]);

    // React to species change to load ID (for selector)
    useEffect(() => {
        const loadId = async () => {
            if (formData.species && !currentSpeciesId) {
                const data = await fetchPokemonSpecies(formData.species);
                if (data && data.externalId) {
                    setCurrentSpeciesId(data.externalId);
                }
            }
        };
        const timer = setTimeout(loadId, 1000);
        return () => clearTimeout(timer);
    }, [formData.species, currentSpeciesId]);

    const handleAutoFill = async (speciesName: string) => {
        if (!speciesName) return;
        setLoading(true);
        try {
            const data = await fetchPokemonSpecies(speciesName);
            if (data) {
                setCurrentSpeciesId(data.externalId);

                // Fix: Ensure ability is a string, not object
                const abilityName = (data.abilities && data.abilities.length > 0) ? data.abilities[0].name : '';

                setFormData(prev => ({
                    ...prev,
                    species: data.name,
                    types: data.types.map((t: string) => t as PkmnType),
                    sprite: data.sprite,
                    ability: abilityName // FORCE STRING
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

    const handleMoveClick = async (moveName: string) => {
        if (!moveName) return;
        const data = await fetchMoveData(moveName);
        if (data) {
            setViewingMove(data);
        }
    };

    const handleSave = () => {
        let finalBoxId = formData.boxId;

        // Logic enforcement: Team must be boxId 0
        if (formData.status === 'team') {
            finalBoxId = 0;
        } else if (finalBoxId === 0) {
            // If in box/dead but boxId is 0, default to first available box or 1
            finalBoxId = boxes.length > 0 ? boxes[0].id : 1;
        }

        const finalData = {
            ...formData,
            boxId: finalBoxId
        };

        if (pokemon && pokemon.id) { // Ensure ID exists
            updatePokemon(pokemon.id, finalData);
        } else {
            addPokemon(finalData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (!pokemon || !pokemon.id) return;
        if (confirm('¿Estás seguro de que quieres liberar a este Pokémon? Esta acción no se puede deshacer.')) {
            removePokemon(pokemon.id);
            onClose();
        }
    };

    // Correct Sprite URL for Shiny if needed
    const getDisplaySprite = () => {
        if (!formData.sprite) return null;
        return toggleShinyUrl(formData.sprite, formData.isShiny);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl border border-cyber-primary/50 shadow-[0_0_50px_rgba(0,243,255,0.2)]">

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

                <div className="p-6 space-y-8">
                    {/* Main Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* Avatar & Shinyness (Left Col) */}
                        <div className="md:col-span-3 flex flex-col items-center gap-4">
                            <div className={`w-40 h-40 rounded-full border-2 border-dashed flex items-center justify-center relative overflow-hidden group transition-all ${formData.isShiny ? 'border-cyber-warning bg-cyber-warning/10 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-white/20 bg-black/40'}`}>
                                {formData.sprite ? (
                                    <img src={getDisplaySprite() || ''} alt="Sprite" className="w-full h-full object-contain pixelated" />
                                ) : (
                                    <span className="text-4xl text-gray-700">?</span>
                                )}
                                {loading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-cyber-primary animate-pulse font-bold">CARGANDO...</div>}

                                <button
                                    onClick={() => {
                                        const newShinyState = !formData.isShiny;
                                        setFormData({
                                            ...formData,
                                            isShiny: newShinyState,
                                            sprite: toggleShinyUrl(formData.sprite, newShinyState)
                                        });
                                    }}
                                    className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-cyber-warning hover:text-black transition-colors"
                                    title="Alternar Shiny"
                                >
                                    <Star size={16} className={formData.isShiny ? 'fill-cyber-warning text-cyber-warning' : 'text-gray-500'} />
                                </button>
                            </div>

                            {/* Sprite Selector */}
                            {currentSpeciesId && (
                                <div className="flex gap-2 p-2 bg-black/40 rounded-lg border border-white/5 overflow-x-auto max-w-full">
                                    <button
                                        onClick={() => setFormData({ ...formData, sprite: getSpriteUrl(currentSpeciesId, 'default', formData.isShiny) })}
                                        className="p-1 hover:bg-white/10 rounded" title="Pixel Default"
                                    >
                                        <Gamepad2 size={16} className="text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, sprite: getSpriteUrl(currentSpeciesId, 'official-artwork', formData.isShiny) })}
                                        className="p-1 hover:bg-white/10 rounded" title="Official Art"
                                    >
                                        <ImageIcon size={16} className="text-purple-400" />
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, sprite: getSpriteUrl(currentSpeciesId, 'showdown', formData.isShiny) })}
                                        className="p-1 hover:bg-white/10 rounded" title="Showdown (Animated)"
                                    >
                                        <Sword size={16} className="text-red-400" />
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, sprite: getSpriteUrl(currentSpeciesId, 'home', formData.isShiny) })}
                                        className="p-1 hover:bg-white/10 rounded" title="Home 3D"
                                    >
                                        <Monitor size={16} className="text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, sprite: getSpriteUrl(currentSpeciesId, 'animated-gen5', formData.isShiny) })}
                                        className="p-1 hover:bg-white/10 rounded" title="Gen 5 Animated"
                                    >
                                        <Ghost size={16} className="text-green-400" />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-1 w-full justify-center flex-wrap">
                                {formData.types.map(t => (
                                    <span key={t} className={`px-3 py-1 rounded text-xs font-bold uppercase bg-${t} text-white shadow-sm`}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats & Info (Right Col) */}
                        <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                            <div className="col-span-full md:col-span-1">
                                <label className="text-xs text-cyber-primary font-bold uppercase tracking-wider mb-1 block">Especie</label>
                                <div className="flex gap-2">
                                    <AutocompleteInput
                                        className="cyber-input w-full"
                                        placeholder="ej. Bulbasaur"
                                        options={allPokemonNames}
                                        value={formData.species}
                                        onChange={(val) => setFormData({ ...formData, species: val })}
                                        onSelect={(val) => handleAutoFill(val)}
                                    />
                                </div>
                            </div>

                            <div className="col-span-full md:col-span-1">
                                <label className="text-xs text-cyber-secondary font-bold uppercase tracking-wider mb-1 block">Mote / Apodo</label>
                                <input
                                    className="cyber-input w-full"
                                    placeholder="Nombre del Pokémon"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

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

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Habilidad</label>
                                <AutocompleteInput
                                    className="cyber-input w-full"
                                    placeholder="ej. Overgrow"
                                    options={allAbilities}
                                    value={formData.ability}
                                    onChange={(val) => setFormData({ ...formData, ability: val })}
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Naturaleza</label>
                                <AutocompleteInput
                                    className="cyber-input w-full"
                                    placeholder="ej. Modest"
                                    options={allNatures}
                                    value={formData.nature}
                                    onChange={(val) => setFormData({ ...formData, nature: val })}
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Objeto Equipado</label>
                                <input
                                    className="cyber-input w-full"
                                    placeholder="ej. Oran Berry"
                                    value={formData.item}
                                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                />
                            </div>

                            {/* Status & Box Selection */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Estado</label>
                                <select
                                    className="cyber-input w-full"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="team">🎮 En Equipo</option>
                                    <option value="box">📦 En Caja</option>
                                    <option value="dead">💀 Muerto</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Caja</label>
                                <select
                                    className="cyber-input w-full"
                                    value={formData.status === 'team' ? 0 : (formData.boxId || (boxes[0]?.id || 1))}
                                    onChange={(e) => setFormData({ ...formData, boxId: parseInt(e.target.value) })}
                                    disabled={formData.status === 'team'}
                                >
                                    {formData.status === 'team' ? (
                                        <option value={0}>— Sin asignar (Equipo) —</option>
                                    ) : (
                                        boxes.map(box => (
                                            <option key={box.id} value={box.id}>{box.name}</option>
                                        ))
                                    )}
                                </select>
                                {formData.status === 'team' && (
                                    <p className="text-xs text-gray-600 mt-1">Los Pokémon en equipo no tienen caja asignada</p>
                                )}
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
                                <div key={idx} className="glass-panel p-3 bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
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
                                        {move.name && (
                                            <button
                                                onClick={() => handleMoveClick(move.name)}
                                                className="ml-auto text-gray-500 hover:text-cyber-primary transition-colors"
                                                title="Ver explicación"
                                            >
                                                <HelpCircle size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            {move.type && <TypeBadge type={move.type as PkmnType} size="sm" />}
                                            {move.name && (
                                                <span className="flex items-center gap-1">
                                                    {move.power !== null && move.power > 0 ? (
                                                        move.pp > 20 ? <Zap size={10} className="text-blue-400" /> : <Sword size={10} className="text-red-400" />
                                                    ) : <Shield size={10} className="text-gray-400" />}
                                                </span>
                                            )}
                                        </div>
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

                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-between items-center rounded-b-2xl">
                    {pokemon && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg font-bold text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/50 transition-all flex items-center gap-2"
                        >
                            <Trash2 size={16} /> LIBERAR
                        </button>
                    )}
                    <div className="flex gap-4 ml-auto">
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

                {/* Move Details Modal (Explicación) */}
                {viewingMove && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[110] animate-fade-in" onClick={() => setViewingMove(null)}>
                        <div className="glass-panel w-full max-w-md p-6 relative border border-white/20" onClick={e => e.stopPropagation()}>
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
        </div>
    );
};
