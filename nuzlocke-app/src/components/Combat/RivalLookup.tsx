import React, { useState, useMemo } from 'react';
import { Shield, Users, Crown, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { RIVAL_TEAMS, getRivalsByGame } from '../../utils/rivalTeams';
import { getDefensiveMatchups } from '../../utils/typeChart';
import { useGameStore } from '../../store/useGameStore';
import type { PkmnType } from '../../utils/typeChart';
import type { RivalTrainer } from '../../utils/rivalTeams';

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

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    gym_leader: { label: 'Líder de Gimnasio', icon: <Shield size={14} />, color: 'text-cyber-primary' },
    elite_four: { label: 'Alto Mando', icon: <Star size={14} />, color: 'text-cyber-purple' },
    champion: { label: 'Campeón/a', icon: <Crown size={14} />, color: 'text-cyber-warning' },
    rival: { label: 'Rival', icon: <Users size={14} />, color: 'text-cyber-secondary' },
    boss: { label: 'Kahuna / Jefe', icon: <Star size={14} />, color: 'text-orange-400' },
};

const TypeBadge: React.FC<{ type: PkmnType }> = ({ type }) => (
    <span
        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
        style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}
    >
        {TYPE_NAMES_ES[type] || type}
    </span>
);

const TrainerCard: React.FC<{ trainer: RivalTrainer }> = ({ trainer }) => {
    const [expanded, setExpanded] = useState(false);
    const roleConfig = ROLE_CONFIG[trainer.role] || ROLE_CONFIG.rival;

    // Compute team weaknesses
    const teamWeaknesses = useMemo(() => {
        const weakCount: Record<string, number> = {};
        trainer.pokemon.forEach(p => {
            const matchups = getDefensiveMatchups(p.types);
            [4, 2].forEach(mult => {
                matchups[mult]?.forEach(type => {
                    weakCount[type] = (weakCount[type] || 0) + (mult === 4 ? 2 : 1);
                });
            });
        });
        return Object.entries(weakCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type: type as PkmnType, count }));
    }, [trainer.pokemon]);

    return (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className={`${roleConfig.color}`}>{roleConfig.icon}</span>
                    <div className="text-left">
                        <p className="font-bold text-white">{trainer.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{roleConfig.label}{trainer.badge ? ` — ${trainer.badge}` : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{trainer.pokemon.length} Pokémon</span>
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 animate-fade-in">
                    {/* Pokémon list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {trainer.pokemon.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-black/30 border border-white/5">
                                <img
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.species.split('-')[0]}.png`}
                                    alt={p.species}
                                    className="w-10 h-10 pixelated"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white capitalize truncate">{p.species.replace('-', ' ')}</p>
                                    <p className="text-[10px] text-gray-400">Lvl {p.level}</p>
                                </div>
                                <div className="flex gap-1">
                                    {p.types.map(t => <TypeBadge key={t} type={t} />)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Team weaknesses */}
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">🎯 Tipos más efectivos contra este equipo</p>
                        <div className="flex flex-wrap gap-1.5">
                            {teamWeaknesses.map(({ type, count }) => (
                                <div key={type} className="flex items-center gap-1">
                                    <TypeBadge type={type} />
                                    <span className="text-[10px] font-bold text-red-400">×{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RivalLookup: React.FC = () => {
    const { selectedGame } = useGameStore();
    const [selectedGameFilter, setSelectedGameFilter] = useState(selectedGame);
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const gameData = getRivalsByGame(selectedGameFilter);
    const availableGames = RIVAL_TEAMS.map(g => ({ id: g.gameId, name: g.gameName }));

    const filteredTrainers = gameData?.trainers.filter(t =>
        roleFilter === 'all' || t.role === roleFilter
    ) || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users size={24} className="text-cyber-primary" />
                Rival Lookup
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={selectedGameFilter}
                    onChange={e => setSelectedGameFilter(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-primary/50"
                >
                    {availableGames.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                <div className="flex gap-1.5">
                    {[
                        { value: 'all', label: 'Todos' },
                        { value: 'gym_leader', label: 'Gimnasios' },
                        { value: 'elite_four', label: 'Alto Mando' },
                        { value: 'champion', label: 'Campeón' },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setRoleFilter(f.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === f.value
                                    ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40'
                                    : 'bg-white/5 text-gray-400 border border-transparent hover:text-white'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trainer list */}
            {filteredTrainers.length > 0 ? (
                <div className="space-y-2">
                    {filteredTrainers.map((t, i) => (
                        <TrainerCard key={`${t.name}-${i}`} trainer={t} />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-8 rounded-2xl text-center">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg font-semibold">No hay datos de rivales para este juego</p>
                    <p className="text-gray-600 text-sm mt-1">Disponible para: FRLG, Platino, ORAS, USUM, Espada/Escudo, Escarlata/Púrpura</p>
                </div>
            )}
        </div>
    );
};
