import React from 'react';
import { getDefensiveMatchups } from '../../utils/typeChart';
import { TypeBadge } from '../Shared/TypeBadge';
import { ShieldAlert } from 'lucide-react';
import type { Pokemon } from '../../store/useGameStore';

interface TeamAnalysisProps {
    team: Pokemon[];
}

export const TeamAnalysis: React.FC<TeamAnalysisProps> = ({ team }) => {
    if (team.length === 0) return null;

    return (
        <section className="glass-card p-6 rounded-2xl border-white/10 h-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyber-danger">
                <ShieldAlert size={24} />
                ANÁLISIS DE RIESGOS
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {team.map(pkmn => {
                    const matchups = getDefensiveMatchups(pkmn.types);
                    const hasCritical = matchups[4].length > 0 || matchups[2].length > 0;

                    if (!hasCritical) return null;

                    return (
                        <div key={pkmn.id} className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-retro text-sm text-white capitalize">{pkmn.name || pkmn.species}</span>
                                <div className="flex gap-1">
                                    {pkmn.types.map(t => (
                                        <div key={t} className="scale-75 origin-right -mr-2">
                                            <TypeBadge type={t as any} size="sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {matchups[4].length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                        <span className="text-[10px] font-bold text-red-500 uppercase px-1 px-1 bg-red-500/10 rounded">Crítico x4</span>
                                        {matchups[4].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                    </div>
                                )}
                                {matchups[2].length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                        <span className="text-[10px] font-bold text-orange-500 uppercase px-1 bg-orange-500/10 rounded">Débil x2</span>
                                        {matchups[2].map(t => <TypeBadge key={t} type={t} size="sm" />)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
