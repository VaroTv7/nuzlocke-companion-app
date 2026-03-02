export interface GameInfo {
    id: string;
    name: string;
    generation: number;
    region: string;
    badgeCount: number;
    mechanics: ('tera' | 'dynamax' | 'mega' | 'zmove')[];
    dexRange: [number, number];
}

export const GAME_REGISTRY: GameInfo[] = [
    // Gen 1
    { id: 'red-blue', name: 'Pokémon Rojo/Azul', generation: 1, region: 'Kanto', badgeCount: 8, mechanics: [], dexRange: [1, 151] },
    { id: 'yellow', name: 'Pokémon Amarillo', generation: 1, region: 'Kanto', badgeCount: 8, mechanics: [], dexRange: [1, 151] },
    { id: 'firered-leafgreen', name: 'Pokémon RojoFuego/VerdeHoja', generation: 1, region: 'Kanto', badgeCount: 8, mechanics: [], dexRange: [1, 386] },
    { id: 'lets-go', name: "Pokémon Let's Go", generation: 1, region: 'Kanto', badgeCount: 8, mechanics: ['mega'], dexRange: [1, 153] },

    // Gen 2
    { id: 'gold-silver', name: 'Pokémon Oro/Plata', generation: 2, region: 'Johto', badgeCount: 16, mechanics: [], dexRange: [1, 251] },
    { id: 'crystal', name: 'Pokémon Cristal', generation: 2, region: 'Johto', badgeCount: 16, mechanics: [], dexRange: [1, 251] },
    { id: 'heartgold-soulsilver', name: 'Pokémon HeartGold/SoulSilver', generation: 2, region: 'Johto', badgeCount: 16, mechanics: [], dexRange: [1, 493] },

    // Gen 3
    { id: 'ruby-sapphire', name: 'Pokémon Rubí/Zafiro', generation: 3, region: 'Hoenn', badgeCount: 8, mechanics: [], dexRange: [1, 386] },
    { id: 'emerald', name: 'Pokémon Esmeralda', generation: 3, region: 'Hoenn', badgeCount: 8, mechanics: [], dexRange: [1, 386] },
    { id: 'omega-alpha', name: 'Pokémon RubíOmega/ZafiroAlfa', generation: 3, region: 'Hoenn', badgeCount: 8, mechanics: ['mega'], dexRange: [1, 721] },

    // Gen 4
    { id: 'diamond-pearl', name: 'Pokémon Diamante/Perla', generation: 4, region: 'Sinnoh', badgeCount: 8, mechanics: [], dexRange: [1, 493] },
    { id: 'platinum', name: 'Pokémon Platino', generation: 4, region: 'Sinnoh', badgeCount: 8, mechanics: [], dexRange: [1, 493] },
    { id: 'brilliant-shining', name: 'Pokémon Diamante Brillante/Perla Reluciente', generation: 4, region: 'Sinnoh', badgeCount: 8, mechanics: [], dexRange: [1, 493] },

    // Gen 5
    { id: 'black-white', name: 'Pokémon Negro/Blanco', generation: 5, region: 'Teselia', badgeCount: 8, mechanics: [], dexRange: [1, 649] },
    { id: 'black2-white2', name: 'Pokémon Negro 2/Blanco 2', generation: 5, region: 'Teselia', badgeCount: 8, mechanics: [], dexRange: [1, 649] },

    // Gen 6
    { id: 'x-y', name: 'Pokémon X/Y', generation: 6, region: 'Kalos', badgeCount: 8, mechanics: ['mega'], dexRange: [1, 721] },

    // Gen 7
    { id: 'sun-moon', name: 'Pokémon Sol/Luna', generation: 7, region: 'Alola', badgeCount: 7, mechanics: ['zmove'], dexRange: [1, 802] },
    { id: 'ultra-sun-moon', name: 'Pokémon UltraSol/UltraLuna', generation: 7, region: 'Alola', badgeCount: 7, mechanics: ['zmove', 'mega'], dexRange: [1, 807] },

    // Gen 8
    { id: 'sword-shield', name: 'Pokémon Espada/Escudo', generation: 8, region: 'Galar', badgeCount: 8, mechanics: ['dynamax'], dexRange: [1, 898] },
    { id: 'legends-arceus', name: 'Leyendas Pokémon: Arceus', generation: 8, region: 'Hisui', badgeCount: 0, mechanics: [], dexRange: [1, 905] },

    // Gen 9
    { id: 'scarlet-violet', name: 'Pokémon Escarlata/Púrpura', generation: 9, region: 'Paldea', badgeCount: 8, mechanics: ['tera'], dexRange: [1, 1025] },
    { id: 'legends-za', name: 'Leyendas Pokémon: Z-A', generation: 9, region: 'Kalos', badgeCount: 0, mechanics: ['mega'], dexRange: [1, 1025] },

    // Fan Games / Custom
    { id: 'fan-game-all', name: 'Fan Game — Todas las Mecánicas', generation: 9, region: 'Todas', badgeCount: 8, mechanics: ['tera', 'mega', 'dynamax', 'zmove'], dexRange: [1, 1025] },
];

export const getGameById = (id: string): GameInfo | undefined =>
    GAME_REGISTRY.find(g => g.id === id);

export const getGamesByRegion = (): Record<string, GameInfo[]> => {
    const map: Record<string, GameInfo[]> = {};
    GAME_REGISTRY.forEach(g => {
        if (!map[g.region]) map[g.region] = [];
        map[g.region].push(g);
    });
    return map;
};

export const getAvailableMechanics = (gameId: string): string[] => {
    const game = getGameById(gameId);
    return game?.mechanics || [];
};

export type GameMode = 'nuzlocke' | 'free' | 'competitive';

export const GAME_MODES: { value: GameMode; label: string; description: string }[] = [
    { value: 'nuzlocke', label: 'Nuzlocke', description: 'Reglas clásicas de Nuzlocke con seguimiento de vidas y muertes' },
    { value: 'free', label: 'Libre', description: 'Sin restricciones, companion general para cualquier partida' },
    { value: 'competitive', label: 'Competitivo', description: 'Enfocado en teambuilding y análisis de matchups' },
];
