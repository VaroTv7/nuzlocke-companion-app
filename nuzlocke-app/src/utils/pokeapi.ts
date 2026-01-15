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

        // Prefer animated Showdown sprite, fallback to official artwork, then default
        const sprite = data.sprites?.other?.showdown?.front_default
            || data.sprites?.other?.['official-artwork']?.front_default
            || data.sprites?.front_default;

        const result = {
            name: data.name, // Keep logical ID as name
            externalId: data.id,
            sprite: sprite,
            types: data.types.map((t: any) => t.type.name),
            stats: data.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat })),
            abilities: data.abilities.map((a: any) => ({ name: a.ability.name, is_hidden: a.is_hidden })),
            moves: data.moves.map((m: any) => ({ move: m.move })), // [NEW] Map moves for Pokedex
            height: data.height,
            weight: data.weight,
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

        // Get Flavor Text (Description) in Spanish or English
        const flavorEntries = data.flavor_text_entries || [];
        const esFlavor = flavorEntries.find((f: any) => f.language.name === 'es');
        const enFlavor = flavorEntries.find((f: any) => f.language.name === 'en');
        const description = esFlavor ? esFlavor.flavor_text : (enFlavor ? enFlavor.flavor_text : 'Sin descripción');

        const result = {
            name: displayName, // Store Spanish name if found
            originalName: data.name,
            type: data.type.name,
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
            description: description.replace(/\n/g, ' '), // Clean newlines
            damage_class: data.damage_class?.name,
        };

        cache[`move_${cleanBox}`] = result;
        return result;

    } catch (error) {
        return null;
    }
}

export const fetchAbilityList = async (): Promise<string[]> => {
    try {
        if (cache['all_abilities']) return cache['all_abilities'];
        const res = await fetch('https://pokeapi.co/api/v2/ability?limit=360');
        const data = await res.json();
        const list = data.results.map((a: any) => a.name);
        cache['all_abilities'] = list;
        return list;
    } catch (e) {
        return [];
    }
}

export const fetchNatureList = async (): Promise<string[]> => {
    // Natures are static in games but we can fetch to be safe
    // Hardcoding them is also fine as there are only 25, but let's fetch for consistency
    try {
        if (cache['all_natures']) return cache['all_natures'];
        const res = await fetch('https://pokeapi.co/api/v2/nature?limit=30');
        const data = await res.json();
        const list = data.results.map((a: any) => a.name);
        cache['all_natures'] = list;
        return list;
    } catch (e) {
        return ['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'];
    }
}
