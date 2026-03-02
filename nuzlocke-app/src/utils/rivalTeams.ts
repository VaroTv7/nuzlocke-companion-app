import type { PkmnType } from './typeChart';

export interface RivalPokemon {
    species: string;
    level: number;
    types: PkmnType[];
}

export interface RivalTrainer {
    name: string;
    role: 'gym_leader' | 'elite_four' | 'champion' | 'rival' | 'boss';
    badge?: string;
    pokemon: RivalPokemon[];
}

export interface GameRivals {
    gameId: string;
    gameName: string;
    trainers: RivalTrainer[];
}

export const RIVAL_TEAMS: GameRivals[] = [
    // ═══ KANTO (Red/Blue/FireRed/LeafGreen) ═══
    {
        gameId: 'firered-leafgreen',
        gameName: 'RojoFuego / VerdeHoja',
        trainers: [
            {
                name: 'Brock', role: 'gym_leader', badge: 'Medalla Roca', pokemon: [
                    { species: 'geodude', level: 12, types: ['rock', 'ground'] },
                    { species: 'onix', level: 14, types: ['rock', 'ground'] },
                ]
            },
            {
                name: 'Misty', role: 'gym_leader', badge: 'Medalla Cascada', pokemon: [
                    { species: 'staryu', level: 18, types: ['water'] },
                    { species: 'starmie', level: 21, types: ['water', 'psychic'] },
                ]
            },
            {
                name: 'Lt. Surge', role: 'gym_leader', badge: 'Medalla Trueno', pokemon: [
                    { species: 'voltorb', level: 21, types: ['electric'] },
                    { species: 'pikachu', level: 18, types: ['electric'] },
                    { species: 'raichu', level: 24, types: ['electric'] },
                ]
            },
            {
                name: 'Erika', role: 'gym_leader', badge: 'Medalla Arcoíris', pokemon: [
                    { species: 'victreebel', level: 29, types: ['grass', 'poison'] },
                    { species: 'tangela', level: 24, types: ['grass'] },
                    { species: 'vileplume', level: 29, types: ['grass', 'poison'] },
                ]
            },
            {
                name: 'Koga', role: 'gym_leader', badge: 'Medalla Alma', pokemon: [
                    { species: 'koffing', level: 37, types: ['poison'] },
                    { species: 'muk', level: 39, types: ['poison'] },
                    { species: 'koffing', level: 37, types: ['poison'] },
                    { species: 'weezing', level: 43, types: ['poison'] },
                ]
            },
            {
                name: 'Sabrina', role: 'gym_leader', badge: 'Medalla Pantano', pokemon: [
                    { species: 'kadabra', level: 38, types: ['psychic'] },
                    { species: 'mr-mime', level: 37, types: ['psychic', 'fairy'] },
                    { species: 'venomoth', level: 38, types: ['bug', 'poison'] },
                    { species: 'alakazam', level: 43, types: ['psychic'] },
                ]
            },
            {
                name: 'Blaine', role: 'gym_leader', badge: 'Medalla Volcán', pokemon: [
                    { species: 'growlithe', level: 42, types: ['fire'] },
                    { species: 'ponyta', level: 40, types: ['fire'] },
                    { species: 'rapidash', level: 42, types: ['fire'] },
                    { species: 'arcanine', level: 47, types: ['fire'] },
                ]
            },
            {
                name: 'Giovanni', role: 'gym_leader', badge: 'Medalla Tierra', pokemon: [
                    { species: 'rhyhorn', level: 45, types: ['ground', 'rock'] },
                    { species: 'dugtrio', level: 42, types: ['ground'] },
                    { species: 'nidoqueen', level: 44, types: ['poison', 'ground'] },
                    { species: 'nidoking', level: 45, types: ['poison', 'ground'] },
                    { species: 'rhyhorn', level: 50, types: ['ground', 'rock'] },
                ]
            },
            {
                name: 'Lorelei (E4)', role: 'elite_four', pokemon: [
                    { species: 'dewgong', level: 52, types: ['water', 'ice'] },
                    { species: 'cloyster', level: 51, types: ['water', 'ice'] },
                    { species: 'slowbro', level: 52, types: ['water', 'psychic'] },
                    { species: 'jynx', level: 54, types: ['ice', 'psychic'] },
                    { species: 'lapras', level: 54, types: ['water', 'ice'] },
                ]
            },
            {
                name: 'Bruno (E4)', role: 'elite_four', pokemon: [
                    { species: 'onix', level: 51, types: ['rock', 'ground'] },
                    { species: 'hitmonchan', level: 53, types: ['fighting'] },
                    { species: 'hitmonlee', level: 53, types: ['fighting'] },
                    { species: 'onix', level: 54, types: ['rock', 'ground'] },
                    { species: 'machamp', level: 56, types: ['fighting'] },
                ]
            },
            {
                name: 'Agatha (E4)', role: 'elite_four', pokemon: [
                    { species: 'gengar', level: 54, types: ['ghost', 'poison'] },
                    { species: 'golbat', level: 54, types: ['poison', 'flying'] },
                    { species: 'haunter', level: 53, types: ['ghost', 'poison'] },
                    { species: 'arbok', level: 56, types: ['poison'] },
                    { species: 'gengar', level: 58, types: ['ghost', 'poison'] },
                ]
            },
            {
                name: 'Lance (E4)', role: 'elite_four', pokemon: [
                    { species: 'gyarados', level: 56, types: ['water', 'flying'] },
                    { species: 'dragonair', level: 54, types: ['dragon'] },
                    { species: 'dragonair', level: 54, types: ['dragon'] },
                    { species: 'aerodactyl', level: 58, types: ['rock', 'flying'] },
                    { species: 'dragonite', level: 60, types: ['dragon', 'flying'] },
                ]
            },
        ],
    },

    // ═══ SINNOH (Diamond/Pearl/Platinum) ═══
    {
        gameId: 'platinum',
        gameName: 'Platino',
        trainers: [
            {
                name: 'Gardenia', role: 'gym_leader', badge: 'Medalla Bosque', pokemon: [
                    { species: 'turtwig', level: 20, types: ['grass'] },
                    { species: 'cherrim', level: 20, types: ['grass'] },
                    { species: 'roserade', level: 22, types: ['grass', 'poison'] },
                ]
            },
            {
                name: 'Maylene', role: 'gym_leader', badge: 'Medalla Combate', pokemon: [
                    { species: 'meditite', level: 28, types: ['fighting', 'psychic'] },
                    { species: 'machoke', level: 29, types: ['fighting'] },
                    { species: 'lucario', level: 32, types: ['fighting', 'steel'] },
                ]
            },
            {
                name: 'Volkner', role: 'gym_leader', badge: 'Medalla Faro', pokemon: [
                    { species: 'jolteon', level: 46, types: ['electric'] },
                    { species: 'raichu', level: 46, types: ['electric'] },
                    { species: 'luxray', level: 48, types: ['electric'] },
                    { species: 'electivire', level: 50, types: ['electric'] },
                ]
            },
            {
                name: 'Cynthia', role: 'champion', pokemon: [
                    { species: 'spiritomb', level: 61, types: ['ghost', 'dark'] },
                    { species: 'roserade', level: 60, types: ['grass', 'poison'] },
                    { species: 'togekiss', level: 60, types: ['fairy', 'flying'] },
                    { species: 'lucario', level: 63, types: ['fighting', 'steel'] },
                    { species: 'milotic', level: 63, types: ['water'] },
                    { species: 'garchomp', level: 66, types: ['dragon', 'ground'] },
                ]
            },
        ],
    },

    // ═══ GALAR (Sword/Shield) ═══
    {
        gameId: 'sword-shield',
        gameName: 'Espada / Escudo',
        trainers: [
            {
                name: 'Milo', role: 'gym_leader', badge: 'Medalla Planta', pokemon: [
                    { species: 'gossifleur', level: 19, types: ['grass'] },
                    { species: 'eldegoss', level: 20, types: ['grass'] },
                ]
            },
            {
                name: 'Nessa', role: 'gym_leader', badge: 'Medalla Agua', pokemon: [
                    { species: 'goldeen', level: 22, types: ['water'] },
                    { species: 'arrokuda', level: 23, types: ['water'] },
                    { species: 'drednaw', level: 24, types: ['water', 'rock'] },
                ]
            },
            {
                name: 'Raihan', role: 'gym_leader', badge: 'Medalla Dragón', pokemon: [
                    { species: 'flygon', level: 47, types: ['ground', 'dragon'] },
                    { species: 'sandaconda', level: 46, types: ['ground'] },
                    { species: 'gigalith', level: 46, types: ['rock'] },
                    { species: 'duraludon', level: 48, types: ['steel', 'dragon'] },
                ]
            },
            {
                name: 'Leon', role: 'champion', pokemon: [
                    { species: 'aegislash', level: 62, types: ['steel', 'ghost'] },
                    { species: 'dragapult', level: 62, types: ['dragon', 'ghost'] },
                    { species: 'haxorus', level: 63, types: ['dragon'] },
                    { species: 'seismitoad', level: 64, types: ['water', 'ground'] },
                    { species: 'mr-rime', level: 64, types: ['ice', 'psychic'] },
                    { species: 'charizard', level: 65, types: ['fire', 'flying'] },
                ]
            },
        ],
    },

    // ═══ PALDEA (Scarlet/Violet) ═══
    {
        gameId: 'scarlet-violet',
        gameName: 'Escarlata / Púrpura',
        trainers: [
            {
                name: 'Katy', role: 'gym_leader', badge: 'Medalla Bicho', pokemon: [
                    { species: 'nymble', level: 14, types: ['bug'] },
                    { species: 'tarountula', level: 14, types: ['bug'] },
                    { species: 'teddiursa', level: 15, types: ['normal'] },
                ]
            },
            {
                name: 'Brassius', role: 'gym_leader', badge: 'Medalla Planta', pokemon: [
                    { species: 'petilil', level: 16, types: ['grass'] },
                    { species: 'smoliv', level: 16, types: ['grass', 'normal'] },
                    { species: 'sudowoodo', level: 17, types: ['rock'] },
                ]
            },
            {
                name: 'Iono', role: 'gym_leader', badge: 'Medalla Eléctrico', pokemon: [
                    { species: 'wattrel', level: 23, types: ['electric', 'flying'] },
                    { species: 'bellibolt', level: 23, types: ['electric'] },
                    { species: 'luxio', level: 23, types: ['electric'] },
                    { species: 'mismagius', level: 24, types: ['ghost'] },
                ]
            },
            {
                name: 'Larry', role: 'gym_leader', badge: 'Medalla Normal', pokemon: [
                    { species: 'komala', level: 35, types: ['normal'] },
                    { species: 'dudunsparce', level: 35, types: ['normal'] },
                    { species: 'staraptor', level: 36, types: ['normal', 'flying'] },
                ]
            },
            {
                name: 'Grusha', role: 'gym_leader', badge: 'Medalla Hielo', pokemon: [
                    { species: 'frosmoth', level: 47, types: ['ice', 'bug'] },
                    { species: 'beartic', level: 47, types: ['ice'] },
                    { species: 'cetitan', level: 48, types: ['ice'] },
                    { species: 'altaria', level: 48, types: ['dragon', 'flying'] },
                ]
            },
            {
                name: 'Rika (E4)', role: 'elite_four', pokemon: [
                    { species: 'whiscash', level: 57, types: ['water', 'ground'] },
                    { species: 'camerupt', level: 57, types: ['fire', 'ground'] },
                    { species: 'donphan', level: 57, types: ['ground'] },
                    { species: 'dugtrio', level: 57, types: ['ground'] },
                    { species: 'clodsire', level: 58, types: ['poison', 'ground'] },
                ]
            },
            {
                name: 'Poppy (E4)', role: 'elite_four', pokemon: [
                    { species: 'copperajah', level: 58, types: ['steel'] },
                    { species: 'magnezone', level: 58, types: ['electric', 'steel'] },
                    { species: 'bronzong', level: 58, types: ['steel', 'psychic'] },
                    { species: 'corviknight', level: 58, types: ['flying', 'steel'] },
                    { species: 'tinkaton', level: 59, types: ['fairy', 'steel'] },
                ]
            },
            {
                name: 'Geeta (Campeona)', role: 'champion', pokemon: [
                    { species: 'espathra', level: 61, types: ['psychic'] },
                    { species: 'gogoat', level: 61, types: ['grass'] },
                    { species: 'veluza', level: 61, types: ['water', 'psychic'] },
                    { species: 'avalugg', level: 61, types: ['ice'] },
                    { species: 'kingambit', level: 62, types: ['dark', 'steel'] },
                    { species: 'glimmora', level: 62, types: ['rock', 'poison'] },
                ]
            },
        ],
    },

    // ═══ HOENN (Ruby/Sapphire/Emerald/ORAS) ═══
    {
        gameId: 'omega-alpha',
        gameName: 'RubíOmega / ZafiroAlfa',
        trainers: [
            {
                name: 'Roxanne', role: 'gym_leader', badge: 'Medalla Piedra', pokemon: [
                    { species: 'geodude', level: 12, types: ['rock', 'ground'] },
                    { species: 'nosepass', level: 14, types: ['rock'] },
                ]
            },
            {
                name: 'Brawly', role: 'gym_leader', badge: 'Medalla Puño', pokemon: [
                    { species: 'machop', level: 14, types: ['fighting'] },
                    { species: 'makuhita', level: 16, types: ['fighting'] },
                ]
            },
            {
                name: 'Wattson', role: 'gym_leader', badge: 'Medalla Dinamo', pokemon: [
                    { species: 'voltorb', level: 19, types: ['electric'] },
                    { species: 'magneton', level: 21, types: ['electric', 'steel'] },
                    { species: 'electrike', level: 19, types: ['electric'] },
                ]
            },
            {
                name: 'Norman', role: 'gym_leader', badge: 'Medalla Equilibrio', pokemon: [
                    { species: 'spinda', level: 27, types: ['normal'] },
                    { species: 'vigoroth', level: 27, types: ['normal'] },
                    { species: 'linoone', level: 29, types: ['normal'] },
                    { species: 'slaking', level: 31, types: ['normal'] },
                ]
            },
            {
                name: 'Wallace', role: 'gym_leader', badge: 'Medalla Lluvia', pokemon: [
                    { species: 'luvdisc', level: 40, types: ['water'] },
                    { species: 'whiscash', level: 42, types: ['water', 'ground'] },
                    { species: 'sealeo', level: 40, types: ['ice', 'water'] },
                    { species: 'seaking', level: 42, types: ['water'] },
                    { species: 'milotic', level: 43, types: ['water'] },
                ]
            },
            {
                name: 'Steven', role: 'champion', pokemon: [
                    { species: 'skarmory', level: 57, types: ['steel', 'flying'] },
                    { species: 'claydol', level: 57, types: ['ground', 'psychic'] },
                    { species: 'aggron', level: 57, types: ['steel', 'rock'] },
                    { species: 'cradily', level: 57, types: ['rock', 'grass'] },
                    { species: 'armaldo', level: 57, types: ['rock', 'bug'] },
                    { species: 'metagross', level: 59, types: ['steel', 'psychic'] },
                ]
            },
        ],
    },

    // ═══ ALOLA (Sun/Moon/Ultra) ═══
    {
        gameId: 'ultra-sun-moon',
        gameName: 'UltraSol / UltraLuna',
        trainers: [
            {
                name: 'Hala (Kahuna)', role: 'boss', pokemon: [
                    { species: 'machop', level: 15, types: ['fighting'] },
                    { species: 'makuhita', level: 15, types: ['fighting'] },
                    { species: 'crabrawler', level: 16, types: ['fighting'] },
                ]
            },
            {
                name: 'Olivia (Kahuna)', role: 'boss', pokemon: [
                    { species: 'anorith', level: 27, types: ['rock', 'bug'] },
                    { species: 'lileep', level: 27, types: ['rock', 'grass'] },
                    { species: 'lycanroc', level: 28, types: ['rock'] },
                ]
            },
            {
                name: 'Acerola (E4)', role: 'elite_four', pokemon: [
                    { species: 'sableye', level: 56, types: ['dark', 'ghost'] },
                    { species: 'froslass', level: 56, types: ['ice', 'ghost'] },
                    { species: 'dhelmise', level: 56, types: ['ghost', 'grass'] },
                    { species: 'palossand', level: 57, types: ['ghost', 'ground'] },
                    { species: 'drifblim', level: 56, types: ['ghost', 'flying'] },
                ]
            },
            {
                name: 'Kukui (Campeón)', role: 'champion', pokemon: [
                    { species: 'lycanroc', level: 57, types: ['rock'] },
                    { species: 'braviary', level: 56, types: ['normal', 'flying'] },
                    { species: 'magnezone', level: 56, types: ['electric', 'steel'] },
                    { species: 'snorlax', level: 56, types: ['normal'] },
                    { species: 'ninetales', level: 56, types: ['ice', 'fairy'] },
                    { species: 'incineroar', level: 58, types: ['fire', 'dark'] },
                ]
            },
        ],
    },
];

export const getRivalsByGame = (gameId: string): GameRivals | undefined =>
    RIVAL_TEAMS.find(g => g.gameId === gameId);

export const getAllChampions = (): { gameName: string; trainer: RivalTrainer }[] =>
    RIVAL_TEAMS.flatMap(g =>
        g.trainers.filter(t => t.role === 'champion').map(t => ({ gameName: g.gameName, trainer: t }))
    );
