import type { GameState, Pokemon } from '../store/useGameStore';
import { fetchPokemonSpecies } from './pokeapi';

// reusable UUID generator
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

interface SimplifiedPokemon {
    name: string; // Species name in the import JSON
    nickname?: string;
    level?: number;
    item?: string | null;
    moves?: string[];
}

interface SimplifiedImportData {
    name?: string;
    game?: string;
    team?: string[]; // List of nicknames
    box?: string[];  // List of nicknames
    dead?: string[]; // List of nicknames
    notes?: string;
    box_details?: Record<string, SimplifiedPokemon>;
}

export const processSmartImport = async (jsonString: string): Promise<GameState | null> => {
    try {
        const data: SimplifiedImportData = JSON.parse(jsonString);

        // Validate basic structure
        if (!data.box_details && !data.team && !data.box) {
            console.error("Invalid Smart Import format: missing core data");
            return null;
        }

        const newPokemonPromises: Promise<Pokemon | null>[] = [];
        const boxDetails = data.box_details || {};

        // Helper to process a list of nicknames into Pokemon objects
        const createPokemonTask = async (nickname: string, location: 'team' | 'box' | 'dead'): Promise<Pokemon | null> => {
            const details = boxDetails[nickname];

            // If we have details, create a full pokemon. If not, create a placeholder.
            const speciesName = details?.name || 'Unknown';
            const displayName = details?.nickname || nickname; // Use nickname if available, else key

            // Fetch API data for sprite/types
            let apiData = null;
            if (speciesName !== 'Unknown') {
                try {
                    apiData = await fetchPokemonSpecies(speciesName);
                } catch (e) {
                    console.warn(`Could not fetch data for ${speciesName}`);
                }
            }

            // Default moves if empty
            const moves = (details?.moves && details.moves.length > 0) ? details.moves : ['Placaje', 'Gruñido'];

            return {
                id: generateUUID(),
                species: speciesName.toLowerCase(), // Store as lowercase
                name: displayName, // Nickname is primary name
                level: details?.level || 5,
                gender: 'N', // Default to Neutral
                nature: 'Fuerte', // Default
                ability: apiData?.abilities?.[0] || 'Unknown',
                status: location,
                item: details?.item || '',
                boxId: 0,
                moves: moves.map(m => ({
                    name: m,
                    type: 'normal',
                    power: null,
                    accuracy: null,
                    pp: 10
                })),
                metLocation: 'Imported',
                types: apiData?.types || ['normal'],
                sprite: apiData?.sprite || `https://img.pokemondb.net/sprites/home/normal/${speciesName.toLowerCase()}.png`,
                isShiny: false
            };
        };

        // Queue reference processing
        const queueTasks = (list: string[] | undefined, location: 'team' | 'box' | 'dead') => {
            if (!list) return;
            list.forEach(nickname => {
                newPokemonPromises.push(createPokemonTask(nickname, location));
            });
        };

        queueTasks(data.team, 'team');
        queueTasks(data.box, 'box');
        queueTasks(data.dead, 'dead');

        // Resolve all pokemon data fetches in parallel
        const resolvedPokemon = await Promise.all(newPokemonPromises);
        let validPokemon = resolvedPokemon.filter(p => p !== null) as Pokemon[];

        // AUTO-FILL TEAM IF EMPTY TO IMPROVE UX
        // If the import has no team but has box pokemon, move the first 6 to the team.
        const teamPokemon = validPokemon.filter(p => p.status === 'team');
        if (teamPokemon.length === 0 && validPokemon.length > 0) {
            let count = 0;
            validPokemon = validPokemon.map(p => {
                // If it's a box pokemon and we have fewer than 6 in team, move it
                if (p.status === 'box' && count < 6) {
                    count++;
                    return { ...p, status: 'team' };
                }
                return p;
            });
        }

        // Create the partial state to merge
        const importedState: any = {
            player: {
                name: "Player",
                id: generateUUID(),
                badges: 0,
                startTime: new Date().toISOString(),
            },
            gameName: data.game || "Imported Game",
            pokemon: validPokemon,
            rules: [],
            notes: data.notes || '',
            lives: 10,
            badges: [false, false, false, false, false, false, false, false],
            objectives: [],
            boxes: [{ id: 0, name: 'Caja 1' }, { id: 1, name: 'Caja 2' }, { id: 2, name: 'Caja 3' }],

            // System state
            currentSaveId: null,
            currentSaveName: data.name || "Importada",
            isServerMode: false,
            isSyncing: false
        };

        return importedState as GameState;

    } catch (e) {
        console.error("Smart Import Parsing Error:", e);
        return null;
    }
};
