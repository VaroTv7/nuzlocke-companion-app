import React from 'react';
import type { PkmnType } from '../../utils/typeChart';

// Traducciones al español
const TYPE_NAMES_ES: Record<PkmnType, string> = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada',
};

const typeColors: Record<PkmnType, string> = {
    normal: 'bg-[#A8A77A]',
    fire: 'bg-[#EE8130]',
    water: 'bg-[#6390F0]',
    electric: 'bg-[#F7D02C]',
    grass: 'bg-[#7AC74C]',
    ice: 'bg-[#96D9D6]',
    fighting: 'bg-[#C22E28]',
    poison: 'bg-[#A33EA1]',
    ground: 'bg-[#E2BF65]',
    flying: 'bg-[#A98FF3]',
    psychic: 'bg-[#F95587]',
    bug: 'bg-[#A6B91A]',
    rock: 'bg-[#B6A136]',
    ghost: 'bg-[#735797]',
    dragon: 'bg-[#6F35FC]',
    dark: 'bg-[#705746]',
    steel: 'bg-[#B7B7CE]',
    fairy: 'bg-[#D685AD]',
};

export const TypeBadge: React.FC<{ type: PkmnType; size?: 'sm' | 'md' }> = ({ type, size = 'md' }) => {
    return (
        <span
            className={`${typeColors[type]
                } text-white font-bold uppercase rounded shadow-sm flex items-center justify-center ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                }`}
            style={{
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}
        >
            {TYPE_NAMES_ES[type] || type}
        </span>
    );
};
