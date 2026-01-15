import type { PkmnType } from "./typeChart";

// Cache for API responses to avoid rate limits
const cache: Record<string, any> = {};

// Autocomplete Helpers
export const fetchPokemonList = async (): Promise<string[]> => {
    try {
        if (cache['all_pokemon']) return cache['all_pokemon'];
        // Limit to 1025 (Gen 9)
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await res.json();
        const list = data.results.map((p: any) => p.name);
        cache['all_pokemon'] = list;
        return list;
    } catch (e) {
        console.error("Error fetching pokemon list", e);
        return [];
    }
};

export const fetchMoveList = async (): Promise<string[]> => {
    try {
        if (cache['all_moves']) return cache['all_moves'];
        const res = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
        const data = await res.json();
        const list = data.results.map((m: any) => m.name);
        cache['all_moves'] = list;
        return list;
    } catch (e) {
        console.error("Error fetching move list", e);
        return [];
    }
};

export const fetchPokemonSpecies = async (name: string): Promise<any> => {
    const cleanName = name.toLowerCase().trim();
    if (!cleanName) return null;

    if (cache[cleanName]) return cache[cleanName];

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();

        const result = {
            name: data.name, // Keep logical ID as name
            externalId: data.id,
            sprite: data.sprites.front_default || data.sprites.other['official-artwork'].front_default,
            types: data.types.map((t: any) => t.type.name),
            // Fetch stats or other details if needed
        };

        // Cache it
        cache[cleanName] = result;
        return result;
    } catch (error) {
        console.error(`Error fetching pokemon ${name}:`, error);
        return null;
    }
}

export const fetchMoveData = async (moveName: string): Promise<any> => {
    const cleanBox = moveName.toLowerCase().trim().replace(/ /g, '-');
    if (!cleanBox) return null;

    if (cache[`move_${cleanBox}`]) return cache[`move_${cleanBox}`];

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${cleanBox}`);
        if (!response.ok) throw new Error('Move not found');
        const data = await response.json();

        // Get Spanish Name if available
        const esEntry = data.names.find((n: any) => n.language.name === 'es');
        const displayName = esEntry ? esEntry.name : data.name;

        const result = {
            name: displayName, // Store Spanish name if found
            type: data.type.name,
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
        };

        cache[`move_${cleanBox}`] = result;
        return result;

    } catch (error) {
        console.error(`Error fetching move ${moveName}:`, error);
        return null;
    }
}
