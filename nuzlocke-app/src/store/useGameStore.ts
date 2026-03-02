import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PkmnType } from '../utils/typeChart';
import type { GameMode } from '../utils/gameRegistry';
import { fetchSave, createSave, updateSave, deleteSave as apiDeleteSave } from '../utils/api';

// UUID generator for storage
const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

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
    boxId: number;
    isShiny: boolean;
    moves: {
        name: string;
        type: PkmnType;
        power: number | null;
        accuracy: number | null;
        pp: number;
    }[];
    metLocation: string;
    // Gen-specific mechanics
    teraType?: PkmnType;
    dynamaxLevel?: number;
    canGigantamax?: boolean;
    megaStone?: string;
    zCrystal?: string;
}

// Dynamic badge system
interface BadgeState {
    total: number;
    earned: boolean[];
}

// State that gets saved
interface SaveableState {
    lives: number;
    badges: BadgeState;
    objectives: { id: string; text: string; completed: boolean }[];
    pokemon: Pokemon[];
    rules: { id: string; text: string }[];
    boxes: { id: number; name: string }[];
    notes: string;
    geminiConfig: { apiKey: string; model: string };
    aiChatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[];
    // New fields
    gameMode: GameMode;
    selectedGame: string;
}

export interface GameState extends SaveableState {
    // Save slot info
    currentSaveId: string | null;
    currentSaveName: string;
    isServerMode: boolean;
    isSyncing: boolean;

    // Actions
    addPokemon: (p: Pokemon) => void;
    updatePokemon: (id: string, updates: Partial<Pokemon>) => void;
    removePokemon: (id: string) => void;
    setLives: (n: number) => void;
    toggleBadge: (index: number) => void;
    setBadgeCount: (count: number) => void;
    toggleObjective: (id: string) => void;
    setNotes: (text: string) => void;
    setGeminiConfig: (config: { apiKey: string; model: string }) => void;
    setAiChatHistory: (history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => void;
    clearAiChatHistory: () => void;
    addBox: () => void;
    updateBox: (id: number, name: string) => void;
    setGameMode: (mode: GameMode) => void;
    setSelectedGame: (gameId: string) => void;

    // Server sync actions
    loadFromServer: (saveId: string) => Promise<boolean>;
    saveToServer: () => Promise<boolean>;
    createNewSave: (name: string) => Promise<boolean>;
    deleteSave: (saveId: string) => Promise<boolean>;
    setSaveName: (name: string) => void;
    importFromJSON: (jsonData: any) => Promise<void>;
}

const DEFAULT_STATE: SaveableState = {
    lives: 10,
    badges: { total: 8, earned: [false, false, false, false, false, false, false, false] },
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
        { id: 1, name: 'Caja 2' },
        { id: 2, name: 'Caja 3' },
        { id: 3, name: 'Cementerio' },
    ],
    notes: '',
    geminiConfig: { apiKey: '', model: 'gemini-2.5-flash' },
    aiChatHistory: [],
    gameMode: 'nuzlocke',
    selectedGame: 'scarlet-violet',
};

// Helper to extract saveable state
const getSaveableState = (state: GameState): SaveableState => ({
    lives: state.lives,
    badges: state.badges,
    objectives: state.objectives,
    pokemon: state.pokemon,
    rules: state.rules,
    boxes: state.boxes,
    notes: state.notes,
    geminiConfig: state.geminiConfig,
    aiChatHistory: state.aiChatHistory,
    gameMode: state.gameMode,
    selectedGame: state.selectedGame,
});

// Debounced auto-save
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (saveFunc: () => Promise<boolean>) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveFunc();
    }, 2000); // Save 2 seconds after last change
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_STATE,
            currentSaveId: null,
            currentSaveName: 'Local',
            isServerMode: false,
            isSyncing: false,

            addPokemon: (p) => {
                const newPokemon = {
                    ...p,
                    id: p.id || generateUUID(),
                    name: p.name || p.species || 'Sin Mote',
                    boxId: p.boxId !== undefined ? p.boxId : (get().boxes[0]?.id || 1),
                    status: p.status || (p.status === 'dead' ? 'dead' : (p.boxId === 0 ? 'team' : 'box'))
                };
                set((state) => ({ pokemon: [...state.pokemon, newPokemon] }));
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            updatePokemon: (id, updates) => {
                set((state) => ({
                    pokemon: state.pokemon.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                }));
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            removePokemon: (id) => {
                set((state) => ({
                    pokemon: state.pokemon.filter((p) => p.id !== id),
                }));
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setLives: (n) => {
                set({ lives: n });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            toggleBadge: (idx) => {
                set((state) => {
                    const newEarned = [...state.badges.earned];
                    if (idx < newEarned.length) {
                        newEarned[idx] = !newEarned[idx];
                    }
                    return { badges: { ...state.badges, earned: newEarned } };
                });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setBadgeCount: (count) => {
                set((state) => {
                    const currentEarned = state.badges.earned;
                    const newEarned = Array.from({ length: count }, (_, i) =>
                        i < currentEarned.length ? currentEarned[i] : false
                    );
                    return { badges: { total: count, earned: newEarned } };
                });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            toggleObjective: (id) => {
                set((state) => ({
                    objectives: state.objectives.map((o) =>
                        o.id === id ? { ...o, completed: !o.completed } : o
                    ),
                }));
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setNotes: (text) => {
                set({ notes: text });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setGeminiConfig: (config) => {
                set({ geminiConfig: config });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setAiChatHistory: (history) => {
                set({ aiChatHistory: history });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            clearAiChatHistory: () => {
                set({ aiChatHistory: [] });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            addBox: () => {
                set((state) => {
                    const nextBoxNum = state.boxes.length + 2;
                    return {
                        boxes: [...state.boxes, { id: state.boxes.length + 1, name: `Caja ${nextBoxNum}` }]
                    };
                });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            updateBox: (id, name) => {
                set((state) => ({
                    boxes: state.boxes.map(b => b.id === id ? { ...b, name } : b)
                }));
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setGameMode: (mode) => {
                set({ gameMode: mode });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },
            setSelectedGame: (gameId) => {
                set({ selectedGame: gameId });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },

            // Server sync actions
            loadFromServer: async (saveId: string) => {
                set({ isSyncing: true });
                try {
                    const data = await fetchSave(saveId);
                    if (data && data.state) {
                        const repairedState = { ...data.state };
                        // Migrate old boolean[] badges -> BadgeState
                        if (Array.isArray(repairedState.badges)) {
                            repairedState.badges = {
                                total: repairedState.badges.length,
                                earned: repairedState.badges,
                            };
                        }
                        if (!repairedState.badges || !repairedState.badges.earned) {
                            repairedState.badges = DEFAULT_STATE.badges;
                        }
                        // Ensure new fields have defaults
                        if (!repairedState.gameMode) repairedState.gameMode = 'nuzlocke';
                        if (!repairedState.selectedGame) repairedState.selectedGame = 'scarlet-violet';

                        set({
                            ...repairedState,
                            currentSaveId: data.id,
                            currentSaveName: data.name,
                            isServerMode: true,
                            isSyncing: false,
                        });
                        return true;
                    }
                    set({ isSyncing: false });
                    return false;
                } catch (error) {
                    console.error('Error loading from server:', error);
                    set({ isSyncing: false });
                    return false;
                }
            },

            saveToServer: async () => {
                const state = get();
                if (!state.currentSaveId || !state.isServerMode) return false;

                set({ isSyncing: true });
                try {
                    const result = await updateSave(
                        state.currentSaveId,
                        state.currentSaveName,
                        getSaveableState(state)
                    );
                    set({ isSyncing: false });
                    return !!result;
                } catch (error) {
                    console.error('Error saving to server:', error);
                    set({ isSyncing: false });
                    return false;
                }
            },

            createNewSave: async (name: string) => {
                set({ isSyncing: true });
                try {
                    const result = await createSave(name, DEFAULT_STATE);
                    if (result) {
                        set({
                            ...DEFAULT_STATE,
                            currentSaveId: result.id,
                            currentSaveName: result.name,
                            isServerMode: true,
                            isSyncing: false,
                        });
                        return true;
                    }
                    set({ isSyncing: false });
                    return false;
                } catch (error) {
                    console.error('Error creating save:', error);
                    set({ isSyncing: false });
                    return false;
                }
            },

            deleteSave: async (saveId: string) => {
                set({ isSyncing: true });
                try {
                    const success = await apiDeleteSave(saveId);
                    if (success && get().currentSaveId === saveId) {
                        set({
                            ...DEFAULT_STATE,
                            currentSaveId: null,
                            currentSaveName: 'Local',
                            isServerMode: false,
                        });
                    }
                    set({ isSyncing: false });
                    return success;
                } catch (error) {
                    console.error('Error deleting save:', error);
                    set({ isSyncing: false });
                    return false;
                }
            },

            setSaveName: (name: string) => {
                set({ currentSaveName: name });
                if (get().isServerMode) debouncedSave(() => get().saveToServer());
            },

            importFromJSON: async (data: any) => {
                if (!data.box_details) return;

                const importedPokemon: Pokemon[] = Object.entries(data.box_details).map(([nickname, details]: [string, any]) => {
                    const species = details.name;
                    const status = (data.team && data.team.includes(nickname)) ? 'team' : 'box';

                    return {
                        id: crypto.randomUUID(),
                        name: details.nickname || species,
                        species: species,
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species.toLowerCase().replace(/ /g, '-')}.png`,
                        types: [],
                        level: details.level || 5,
                        gender: 'N' as const,
                        nature: 'Docile',
                        ability: '',
                        item: details.item || '',
                        status: status as 'team' | 'box',
                        boxId: status === 'team' ? 0 : 1,
                        isShiny: false,
                        moves: (details.moves || []).map((m: string) => ({
                            name: m,
                            type: 'normal' as PkmnType,
                            power: null,
                            accuracy: null,
                            pp: 0
                        })),
                        metLocation: 'Importado'
                    };
                });

                set({ pokemon: importedPokemon });

                if (get().isServerMode) {
                    await get().saveToServer();
                }
            },
        }),
        {
            name: 'varo-pokemon-storage',
            version: 4,
            migrate: (persistedState: any, version) => {
                let state = { ...persistedState };

                if (version < 2) {
                    state = {
                        ...state,
                        currentSaveId: null,
                        currentSaveName: 'Local',
                        isServerMode: false,
                        isSyncing: false,
                        boxes: state.boxes || DEFAULT_STATE.boxes,
                        notes: state.notes || '',
                        pokemon: (state.pokemon || []).map((p: any) => ({
                            ...p,
                            boxId: p.boxId !== undefined ? p.boxId : (p.status === 'team' ? 0 : 1),
                            isShiny: p.isShiny || false
                        }))
                    };
                }

                if (version < 3) {
                    state.boxes = (state.boxes || []).map((b: any) => {
                        if (b.id === 1 && b.name === 'Caja 1') return { ...b, name: 'Caja 2' };
                        if (b.id === 2 && b.name === 'Caja 2') return { ...b, name: 'Caja 3' };
                        return b;
                    });
                    state.pokemon = (state.pokemon || []).map((p: any) => {
                        if (p.status === 'box' && p.boxId === 0) return { ...p, boxId: 1 };
                        return p;
                    });
                }

                if (version < 4) {
                    // Migrate badges from boolean[] to BadgeState
                    if (Array.isArray(state.badges)) {
                        state.badges = {
                            total: state.badges.length || 8,
                            earned: state.badges,
                        };
                    } else if (!state.badges || !state.badges.earned) {
                        state.badges = DEFAULT_STATE.badges;
                    }
                    // Add new fields with defaults
                    state.gameMode = state.gameMode || 'nuzlocke';
                    state.selectedGame = state.selectedGame || 'scarlet-violet';
                    // Ensure all Pokemon have new optional fields
                    state.pokemon = (state.pokemon || []).map((p: any) => ({
                        ...p,
                        teraType: p.teraType || undefined,
                        dynamaxLevel: p.dynamaxLevel || undefined,
                        canGigantamax: p.canGigantamax || undefined,
                        megaStone: p.megaStone || undefined,
                        zCrystal: p.zCrystal || undefined,
                    }));
                }

                return state;
            },
        }
    )
);
