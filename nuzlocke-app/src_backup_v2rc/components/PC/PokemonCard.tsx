import React from 'react';
import type { Pokemon } from '../../store/useGameStore';
import { TypeBadge } from '../Shared/TypeBadge';
import { Edit2, Trash2, Skull } from 'lucide-react';

interface Props {
    data: Pokemon;
    onEdit: (p: Pokemon) => void;
    onDelete: (id: string) => void;
    onDie?: (id: string) => void; // Optional if already dad
}

export const PokemonCard: React.FC<Props> = ({ data, onEdit, onDelete, onDie }) => {
    const isDead = data.status === 'dead';

    return (
        <div className={`glass-card p-3 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] group relative overflow-hidden ${isDead ? 'grayscale opacity-75' : ''}`}>
            {/* Sprite / Image */}
            <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                <img src={data.sprite} alt={data.name} className="w-12 h-12 object-contain rendering-pixelated" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg leading-none truncate">{data.name}</h3>
                        <span className="text-xs text-gray-400 italic">{data.species}</span>
                    </div>
                    <span className="font-retro text-cyber-primary text-xs">Lvl {data.level}</span>
                </div>

                <div className="flex gap-1 mt-2">
                    {data.types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                </div>
            </div>

            {/* Actions (Hidden until hover) */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cyber-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end px-3 gap-2">
                <button onClick={() => onEdit(data)} className="p-2 bg-cyber-primary/20 hover:bg-cyber-primary text-cyber-primary hover:text-black rounded-full transition-colors">
                    <Edit2 size={14} />
                </button>
                {!isDead && onDie && (
                    <button onClick={() => onDie(data.id)} className="p-2 bg-gray-700/50 hover:bg-gray-500 text-white rounded-full transition-colors" title="Marcar como debilitado">
                        <Skull size={14} />
                    </button>
                )}
                {/* <button onClick={() => onDelete(data.id)} className="p-2 bg-cyber-danger/20 hover:bg-cyber-danger text-cyber-danger hover:text-black rounded-full transition-colors">
            <Trash2 size={14} />
        </button> */}
                {/* Deletion tucked away in Edit usually better, but keeping simple */}
            </div>
        </div>
    );
};
