import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PkmnType } from '../utils/typeChart';
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
}

// State that gets saved
interface SaveableState {
    lives: number;
    badges: boolean[];
    objectives: { id: string; text: string; completed: boolean }[];
    pokemon: Pokemon[];
    rules: { id: string; text: string }[];
    boxes: { id: number; name: string }[];
    notes: string;
    geminiConfig: { apiKey: string; model: string };
    aiChatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[];
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
    toggleObjective: (id: string) => void;
    setNotes: (text: string) => void;
    setGeminiConfig: (config: { apiKey: string; model: string }) => void;
    setAiChatHistory: (history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => void;
    clearAiChatHistory: () => void;
    addBox: () => void;
    updateBox: (id: number, name: string) => void;

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
        { id: 1, name: 'Caja 2' },
        { id: 2, name: 'Caja 3' },
        { id: 3, name: 'Cementerio' },
    ],
    notes: '',
    geminiConfig: { apiKey: '', model: 'gemini-2.5-flash' },
    aiChatHistory: [],
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
                    const newBadges = [...state.badges];
                    newBadges[idx] = !newBadges[idx];
                    return { badges: newBadges };
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

            // Server sync actions
            loadFromServer: async (saveId: string) => {
                set({ isSyncing: true });
                try {
                    const data = await fetchSave(saveId);
                    if (data && data.state) {
                        // Ensure badges array is valid (repair for bad imports)
                        const repairedState = { ...data.state };
                        if (!repairedState.badges || !Array.isArray(repairedState.badges) || repairedState.badges.length !== 8) {
                            repairedState.badges = [false, false, false, false, false, false, false, false];
                        }

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
                        // Reset to default if we deleted current save
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
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species.toLowerCase().replace(/ /g, '-')}.png`, // Placeholder, will fix/update in UI if needed or via API later
                        types: [], // UI/API will fill this
                        level: details.level || 5,
                        gender: 'N',
                        nature: 'Docile',
                        ability: '',
                        item: details.item || '',
                        status: status as 'team' | 'box',
                        boxId: status === 'team' ? 0 : 1,
                        isShiny: false,
                        moves: (details.moves || []).map((m: string) => ({
                            name: m,
                            type: 'normal',
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
            name: 'varo-locke-storage',
            version: 3,
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
                    // Rename "Caja 1" to "Caja 2" if it hasn't been changed to something custom
                    state.boxes = (state.boxes || []).map((b: any) => {
                        if (b.id === 1 && b.name === 'Caja 1') return { ...b, name: 'Caja 2' };
                        if (b.id === 2 && b.name === 'Caja 2') return { ...b, name: 'Caja 3' };
                        return b;
                    });
                    // Repair any pokemon with status 'box' but boxId 0
                    state.pokemon = (state.pokemon || []).map((p: any) => {
                        if (p.status === 'box' && p.boxId === 0) return { ...p, boxId: 1 };
                        return p;
                    });
                }
                return state;
            },
        }
    )
);
