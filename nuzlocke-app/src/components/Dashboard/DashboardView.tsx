import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { PokemonCard } from '../PC/PokemonCard';
import { EditModal } from '../PC/EditModal';
import { NotesWidget } from './NotesWidget';
import { TeamAnalysis } from './TeamAnalysis';
import { Plus } from 'lucide-react';
import type { Pokemon } from '../../store/useGameStore';

export const DashboardView: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
    const navigate = useNavigate();

    const { badges, toggleBadge, pokemon, removePokemon, gameMode } = useGameStore();

    const team = (pokemon || []).filter(p => p.status === 'team');

    const handleAddNew = () => {
        setEditingPokemon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (p: Pokemon) => {
        setEditingPokemon(p);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ═══ BADGES ═══ */}
            {badges.total > 0 && (
                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-cyber-warning">🏆</span> Medallas
                    </h2>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-center">
                        {badges.earned.map((active, idx) => (
                            <button
                                key={idx}
                                onClick={() => toggleBadge(idx)}
                                className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 transition-all duration-500 flex items-center justify-center relative group ${active
                                    ? 'border-cyber-primary bg-cyber-primary/20 shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                                    : 'border-white/10 bg-black/40 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border ${active ? 'bg-gradient-to-br from-yellow-400 to-orange-600 border-yellow-300' : 'bg-gray-800 border-gray-600'}`}>
                                    <span className={`text-lg md:text-xl font-black ${active ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
                                        {idx + 1}
                                    </span>
                                </div>
                                {active && (
                                    <div className="absolute inset-0 rounded-full animate-ping bg-cyber-primary/30 pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ TEAM & ANALYSIS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ACTIVE TEAM */}
                <section className="glass-card p-6 rounded-2xl border-white/10 col-span-1 lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyber-primary">
                        <span className="text-2xl">⚡</span> EQUIPO ACTIVO
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {team.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                                <p className="font-retro text-xl mb-2">EQUIPO VACÍO</p>
                                <button onClick={() => navigate('/app/pc')} className="text-cyber-secondary hover:underline">
                                    Ir al PC para reclutar
                                </button>
                            </div>
                        )}

                        {team.map(p => (
                            <PokemonCard
                                key={p.id}
                                data={p}
                                onEdit={handleEdit}
                                onDelete={removePokemon}
                            />
                        ))}

                        {team.length < 6 && (
                            <button
                                onClick={handleAddNew}
                                className="glass-card flex flex-col items-center justify-center p-6 border-dashed border-2 border-white/20 hover:border-cyber-primary/50 group h-48 md:h-auto transition-all bg-black/20 rounded-2xl"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyber-primary/20 transition-colors">
                                    <Plus className="text-gray-400 group-hover:text-cyber-primary" size={24} />
                                </div>
                                <span className="mt-3 text-sm text-gray-500 group-hover:text-white uppercase tracking-wider font-bold">Reclutar</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* ANALYSIS INTERFACE */}
                <TeamAnalysis team={team} />
            </div>

            {/* ═══ NUZLOCKE-SPECIFIC: RULES & OBJECTIVES ═══ */}
            {gameMode === 'nuzlocke' && (
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-cyber-secondary flex items-center gap-2">
                        <span>📋</span> Reglas del Nuzlocke
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Reglas Activas</h3>
                            <ul className="space-y-1">
                                {useGameStore.getState().rules.map(r => (
                                    <li key={r.id} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-cyber-danger mt-0.5">•</span>
                                        {r.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Objetivos</h3>
                            <ul className="space-y-1">
                                {useGameStore.getState().objectives.map(o => (
                                    <li
                                        key={o.id}
                                        onClick={() => useGameStore.getState().toggleObjective(o.id)}
                                        className={`text-sm flex items-start gap-2 cursor-pointer transition-colors ${o.completed ? 'text-cyber-success line-through opacity-60' : 'text-gray-300'}`}
                                    >
                                        <span className="mt-0.5">{o.completed ? '✅' : '⬜'}</span>
                                        {o.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ NOTES ═══ */}
            <NotesWidget />

            {/* ═══ EDIT MODAL ═══ */}
            <EditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pokemon={editingPokemon}
            />
        </div>
    );
};
