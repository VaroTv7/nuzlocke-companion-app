import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PkmnType } from '../utils/typeChart';

export interface Pokemon {
    id: string;
    name: string;
    species: string;
    sprite: string;
    types: PkmnType[];
    level: number;
    gender: 'M' | 'F' | 'N';
    nature: string;
    ability: string;
    item: string;
    status: 'team' | 'box' | 'dead';
    boxId: number; // 0 for team, 1-N for PC boxes
    moves: {
        name: string;
        type: PkmnType;
        power: number | null;
        accuracy: number | null;
        pp: number;
    }[];
    metLocation: string;
}

interface GameState {
    lives: number;
    badges: boolean[];
    objectives: { id: string; text: string; completed: boolean }[];
    pokemon: Pokemon[];
    rules: { id: string; text: string }[];
    boxes: { id: number; name: string }[];

    // Actions
    addPokemon: (p: Pokemon) => void;
    updatePokemon: (id: string, updates: Partial<Pokemon>) => void;
    removePokemon: (id: string) => void;
    setLives: (n: number) => void;
    toggleBadge: (index: number) => void;
    toggleObjective: (id: string) => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            lives: 10,
            badges: [false, false, false, false, false, false, false, false],
            objectives: [
                { id: '1', text: 'Derrotar al Alto Mando', completed: false },
                { id: '2', text: 'Completar la Pokédex Regional', completed: false },
            ],
            pokemon: [],
            rules: [
                { id: '1', text: 'Si un Pokémon se debilita, muere.' },
                { id: '2', text: 'Solo capturar el primer Pokémon de ruta.' },
            ],
            boxes: [
                { id: 1, name: 'Caja 1' },
                { id: 2, name: 'Caja 2' },
                { id: 3, name: 'Cementerio' }, // Logical box, separate from status='dead'
            ],

            addPokemon: (p) => set((state) => ({ pokemon: [...state.pokemon, p] })),
            updatePokemon: (id, updates) => set((state) => ({
                pokemon: state.pokemon.map((p) => (p.id === id ? { ...p, ...updates } : p)),
            })),
            removePokemon: (id) => set((state) => ({
                pokemon: state.pokemon.filter((p) => p.id !== id),
            })),
            setLives: (n) => set({ lives: n }),
            toggleBadge: (idx) => set((state) => {
                const newBadges = [...state.badges];
                newBadges[idx] = !newBadges[idx];
                return { badges: newBadges };
            }),
            toggleObjective: (id) => set((state) => ({
                objectives: state.objectives.map((o) =>
                    o.id === id ? { ...o, completed: !o.completed } : o
                ),
            })),
        }),
        {
            name: 'varo-locke-storage',
        }
    )
);
