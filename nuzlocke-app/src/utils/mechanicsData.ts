import type { PkmnType } from './typeChart';

// ═══════════════════════════════════════════
// MEGA EVOLUTION DATABASE
// ═══════════════════════════════════════════
export interface MegaEvolution {
    pokemon: string;
    stone: string;
    newTypes: PkmnType[];
    newAbility: string;
    statBoosts: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
}

export const MEGA_EVOLUTIONS: MegaEvolution[] = [
    { pokemon: 'venusaur', stone: 'Venusaurita', newTypes: ['grass', 'poison'], newAbility: 'Espesura (Mega)', statBoosts: { hp: 0, atk: 20, def: 20, spa: 20, spd: 20, spe: 20 } },
    { pokemon: 'charizard', stone: 'Charizardita X', newTypes: ['fire', 'dragon'], newAbility: 'Garra Dura', statBoosts: { hp: 0, atk: 46, def: 17, spa: 0, spd: 0, spe: 37 } },
    { pokemon: 'charizard', stone: 'Charizardita Y', newTypes: ['fire', 'flying'], newAbility: 'Sequía', statBoosts: { hp: 0, atk: 6, def: 0, spa: 54, spd: 0, spe: 40 } },
    { pokemon: 'blastoise', stone: 'Blastoisita', newTypes: ['water'], newAbility: 'Megadisparador', statBoosts: { hp: 0, atk: 10, def: 10, spa: 50, spd: 10, spe: 20 } },
    { pokemon: 'alakazam', stone: 'Alakazamita', newTypes: ['psychic'], newAbility: 'Rastro', statBoosts: { hp: 0, atk: 0, def: 10, spa: 40, spd: 0, spe: 50 } },
    { pokemon: 'gengar', stone: 'Gengarita', newTypes: ['ghost', 'poison'], newAbility: 'Garra Sombra', statBoosts: { hp: 0, atk: 0, def: 20, spa: 40, spd: 0, spe: 40 } },
    { pokemon: 'kangaskhan', stone: 'Kangaskhanita', newTypes: ['normal'], newAbility: 'Amor Filial', statBoosts: { hp: 0, atk: 30, def: 20, spa: 0, spd: 20, spe: 30 } },
    { pokemon: 'pinsir', stone: 'Pinsirita', newTypes: ['bug', 'flying'], newAbility: 'Piel Celeste', statBoosts: { hp: 0, atk: 30, def: 10, spa: 0, spd: 10, spe: 50 } },
    { pokemon: 'gyarados', stone: 'Gyaradosita', newTypes: ['water', 'dark'], newAbility: 'Rompemoldes', statBoosts: { hp: 0, atk: 30, def: 20, spa: 0, spd: 20, spe: 30 } },
    { pokemon: 'aerodactyl', stone: 'Aerodactylita', newTypes: ['rock', 'flying'], newAbility: 'Garras Duras', statBoosts: { hp: 0, atk: 30, def: 20, spa: 10, spd: 10, spe: 30 } },
    { pokemon: 'mewtwo', stone: 'Mewtwoita X', newTypes: ['psychic', 'fighting'], newAbility: 'Impasible', statBoosts: { hp: 0, atk: 80, def: 20, spa: 0, spd: 0, spe: 0 } },
    { pokemon: 'mewtwo', stone: 'Mewtwoita Y', newTypes: ['psychic'], newAbility: 'Insomnio', statBoosts: { hp: 0, atk: 0, def: 0, spa: 50, spd: 30, spe: 20 } },
    { pokemon: 'ampharos', stone: 'Ampharosita', newTypes: ['electric', 'dragon'], newAbility: 'Rompemoldes', statBoosts: { hp: 0, atk: 0, def: 20, spa: 55, spd: 0, spe: -10 } },
    { pokemon: 'scizor', stone: 'Scizorita', newTypes: ['bug', 'steel'], newAbility: 'Experto', statBoosts: { hp: 0, atk: 40, def: 20, spa: 0, spd: 20, spe: 20 } },
    { pokemon: 'heracross', stone: 'Heracrossita', newTypes: ['bug', 'fighting'], newAbility: 'Garra Trampa', statBoosts: { hp: 0, atk: 40, def: 10, spa: 0, spd: 10, spe: -10 } },
    { pokemon: 'tyranitar', stone: 'Tyranitarita', newTypes: ['rock', 'dark'], newAbility: 'Chorro Arena', statBoosts: { hp: 0, atk: 30, def: 30, spa: 0, spd: 0, spe: 40 } },
    { pokemon: 'blaziken', stone: 'Blazikenita', newTypes: ['fire', 'fighting'], newAbility: 'Impulso', statBoosts: { hp: 0, atk: 40, def: 10, spa: 10, spd: 10, spe: 30 } },
    { pokemon: 'gardevoir', stone: 'Gardevoirita', newTypes: ['psychic', 'fairy'], newAbility: 'Pixilar', statBoosts: { hp: 0, atk: 0, def: 0, spa: 40, spd: 40, spe: 20 } },
    { pokemon: 'mawile', stone: 'Mawilita', newTypes: ['steel', 'fairy'], newAbility: 'Fuerza Bruta', statBoosts: { hp: 0, atk: 50, def: 10, spa: 0, spd: 10, spe: 10 } },
    { pokemon: 'aggron', stone: 'Aggronita', newTypes: ['steel'], newAbility: 'Filtro', statBoosts: { hp: 0, atk: 30, def: 50, spa: 0, spd: 20, spe: 0 } },
    { pokemon: 'medicham', stone: 'Medichamita', newTypes: ['fighting', 'psychic'], newAbility: 'Puño Puro', statBoosts: { hp: 0, atk: 40, def: 0, spa: 0, spd: 0, spe: 20 } },
    { pokemon: 'manectric', stone: 'Manectricita', newTypes: ['electric'], newAbility: 'Pararrayos', statBoosts: { hp: 0, atk: 20, def: 0, spa: 40, spd: 0, spe: 40 } },
    { pokemon: 'banette', stone: 'Banettita', newTypes: ['ghost'], newAbility: 'Bromista', statBoosts: { hp: 0, atk: 40, def: 10, spa: 0, spd: 10, spe: 40 } },
    { pokemon: 'absol', stone: 'Absolita', newTypes: ['dark'], newAbility: 'Ojo Mágico', statBoosts: { hp: 0, atk: 40, def: 0, spa: 40, spd: 0, spe: 20 } },
    { pokemon: 'garchomp', stone: 'Garchompita', newTypes: ['dragon', 'ground'], newAbility: 'Corpulencia', statBoosts: { hp: 0, atk: 40, def: 0, spa: 40, spd: 0, spe: -10 } },
    { pokemon: 'lucario', stone: 'Lucarionita', newTypes: ['fighting', 'steel'], newAbility: 'Adaptable', statBoosts: { hp: 0, atk: 35, def: 0, spa: 25, spd: 0, spe: 40 } },
    { pokemon: 'abomasnow', stone: 'Abomasnowita', newTypes: ['grass', 'ice'], newAbility: 'Alerta Nieve', statBoosts: { hp: 0, atk: 30, def: 30, spa: 30, spd: 30, spe: -20 } },
    { pokemon: 'lopunny', stone: 'Lopunnita', newTypes: ['normal', 'fighting'], newAbility: 'Audacia', statBoosts: { hp: 0, atk: 60, def: 0, spa: 0, spd: 0, spe: 60 } },
    { pokemon: 'gallade', stone: 'Galladita', newTypes: ['psychic', 'fighting'], newAbility: 'Filo Interior', statBoosts: { hp: 0, atk: 40, def: 20, spa: 0, spd: 0, spe: 40 } },
    { pokemon: 'salamence', stone: 'Salamencita', newTypes: ['dragon', 'flying'], newAbility: 'Piel Celeste', statBoosts: { hp: 0, atk: 10, def: 40, spa: 0, spd: 10, spe: 40 } },
    { pokemon: 'metagross', stone: 'Metagrossita', newTypes: ['steel', 'psychic'], newAbility: 'Garras Duras', statBoosts: { hp: 0, atk: 30, def: 10, spa: 0, spd: 10, spe: 50 } },
    { pokemon: 'rayquaza', stone: 'Draco Ascenso', newTypes: ['dragon', 'flying'], newAbility: 'Delta Stream', statBoosts: { hp: 0, atk: 30, def: 0, spa: 30, spd: 0, spe: 40 } },
    { pokemon: 'swampert', stone: 'Swampertita', newTypes: ['water', 'ground'], newAbility: 'Nado Rápido', statBoosts: { hp: 0, atk: 40, def: 20, spa: 0, spd: 20, spe: 20 } },
    { pokemon: 'sceptile', stone: 'Sceptilita', newTypes: ['grass', 'dragon'], newAbility: 'Pararrayos', statBoosts: { hp: 0, atk: 10, def: 10, spa: 45, spd: 0, spe: 35 } },
    { pokemon: 'sableye', stone: 'Sableyita', newTypes: ['dark', 'ghost'], newAbility: 'Espejo Mágico', statBoosts: { hp: 0, atk: 0, def: 65, spa: 20, spd: 65, spe: -50 } },
    { pokemon: 'sharpedo', stone: 'Sharpedoita', newTypes: ['water', 'dark'], newAbility: 'Mandíbula Fuerte', statBoosts: { hp: 0, atk: 30, def: 10, spa: 30, spd: 10, spe: 20 } },
    { pokemon: 'camerupt', stone: 'Cameruptita', newTypes: ['fire', 'ground'], newAbility: 'Fuerza Bruta', statBoosts: { hp: 0, atk: 20, def: 0, spa: 45, spd: 20, spe: -5 } },
    { pokemon: 'altaria', stone: 'Altariita', newTypes: ['dragon', 'fairy'], newAbility: 'Pixilar', statBoosts: { hp: 0, atk: 10, def: 0, spa: 40, spd: 0, spe: 50 } },
    { pokemon: 'glalie', stone: 'Glalita', newTypes: ['ice'], newAbility: 'Piel Helada', statBoosts: { hp: 0, atk: 40, def: 0, spa: 40, spd: 0, spe: 20 } },
    { pokemon: 'steelix', stone: 'Steelixita', newTypes: ['steel', 'ground'], newAbility: 'Corpulencia', statBoosts: { hp: 0, atk: 40, def: 30, spa: 0, spd: 30, spe: -10 } },
    { pokemon: 'pidgeot', stone: 'Pidgeotita', newTypes: ['normal', 'flying'], newAbility: 'Sin Límite', statBoosts: { hp: 0, atk: 0, def: 10, spa: 65, spd: 0, spe: 25 } },
    { pokemon: 'slowbro', stone: 'Slowbroita', newTypes: ['water', 'psychic'], newAbility: 'Caparazón', statBoosts: { hp: 0, atk: 0, def: 50, spa: 20, spd: 0, spe: 30 } },
    { pokemon: 'beedrill', stone: 'Beedrilita', newTypes: ['bug', 'poison'], newAbility: 'Adaptable', statBoosts: { hp: 0, atk: 60, def: -20, spa: 0, spd: -20, spe: 80 } },
    { pokemon: 'audino', stone: 'Audinita', newTypes: ['normal', 'fairy'], newAbility: 'Sanadora', statBoosts: { hp: 0, atk: 0, def: 40, spa: 20, spd: 40, spe: 0 } },
    { pokemon: 'diancie', stone: 'Diancita', newTypes: ['rock', 'fairy'], newAbility: 'Ojo Mágico', statBoosts: { hp: 0, atk: 40, def: -40, spa: 40, spd: -40, spe: 100 } },
];

export const getMegaEvolutions = (pokemon: string): MegaEvolution[] =>
    MEGA_EVOLUTIONS.filter(m => m.pokemon === pokemon.toLowerCase());

// ═══════════════════════════════════════════
// Z-MOVES DATABASE
// ═══════════════════════════════════════════
export interface ZMoveInfo {
    crystal: string;
    type: PkmnType;
    moveName: string;
    basePower: number;
    category: 'physical' | 'special';
}

export const Z_MOVES: ZMoveInfo[] = [
    { crystal: 'Normastal Z', type: 'normal', moveName: 'Carrera Arrolladora', basePower: 200, category: 'physical' },
    { crystal: 'Pirostal Z', type: 'fire', moveName: 'Hecatombe Piroclásmico', basePower: 185, category: 'special' },
    { crystal: 'Hidrostal Z', type: 'water', moveName: 'Superremolino Abisal', basePower: 185, category: 'special' },
    { crystal: 'Electrostal Z', type: 'electric', moveName: 'Gigavoltio Destructor', basePower: 185, category: 'special' },
    { crystal: 'Fitostal Z', type: 'grass', moveName: 'Megatón Floral', basePower: 190, category: 'special' },
    { crystal: 'Criostal Z', type: 'ice', moveName: 'Crioaliento Gélido', basePower: 185, category: 'special' },
    { crystal: 'Lizastal Z', type: 'fighting', moveName: 'Golpe Maestro', basePower: 190, category: 'physical' },
    { crystal: 'Toxistal Z', type: 'poison', moveName: 'Corriente Ácida Corrosiva', basePower: 175, category: 'special' },
    { crystal: 'Geostal Z', type: 'ground', moveName: 'Tectónica Abisal', basePower: 180, category: 'physical' },
    { crystal: 'Aerostal Z', type: 'flying', moveName: 'Picado Supersónico', basePower: 190, category: 'physical' },
    { crystal: 'Psicostal Z', type: 'psychic', moveName: 'Disrupción Psíquica', basePower: 175, category: 'special' },
    { crystal: 'Insectostal Z', type: 'bug', moveName: 'Golpe Devastador', basePower: 175, category: 'physical' },
    { crystal: 'Litostal Z', type: 'rock', moveName: 'Aplastamiento Pétreo', basePower: 190, category: 'physical' },
    { crystal: 'Espectrostal Z', type: 'ghost', moveName: 'Saqueo Espectral', basePower: 180, category: 'physical' },
    { crystal: 'Dracostal Z', type: 'dragon', moveName: 'Devastación Draconiana', basePower: 185, category: 'special' },
    { crystal: 'Nicostal Z', type: 'dark', moveName: 'Agujero Negro Triturahuesos', basePower: 180, category: 'physical' },
    { crystal: 'Metalostal Z', type: 'steel', moveName: 'Hipercañón Acerino', basePower: 180, category: 'physical' },
    { crystal: 'Feeristal Z', type: 'fairy', moveName: 'Fuerza Feérica Arrasadora', basePower: 190, category: 'special' },
];

export const getZMoveByType = (type: PkmnType): ZMoveInfo | undefined =>
    Z_MOVES.find(z => z.type === type);

// ═══════════════════════════════════════════
// MAX MOVE DATABASE (Dynamax/Gigantamax)
// ═══════════════════════════════════════════
export interface MaxMoveInfo {
    type: PkmnType;
    moveName: string;
    effect: string;
}

export const MAX_MOVES: MaxMoveInfo[] = [
    { type: 'normal', moveName: 'Max Strike', effect: 'Baja Velocidad rival' },
    { type: 'fire', moveName: 'Max Flare', effect: 'Activa Sol' },
    { type: 'water', moveName: 'Max Geyser', effect: 'Activa Lluvia' },
    { type: 'electric', moveName: 'Max Lightning', effect: 'Activa Campo Eléctrico' },
    { type: 'grass', moveName: 'Max Overgrowth', effect: 'Activa Campo de Hierba' },
    { type: 'ice', moveName: 'Max Hailstorm', effect: 'Activa Granizo' },
    { type: 'fighting', moveName: 'Max Knuckle', effect: 'Sube Ataque aliado' },
    { type: 'poison', moveName: 'Max Ooze', effect: 'Sube At. Especial aliado' },
    { type: 'ground', moveName: 'Max Quake', effect: 'Sube Def. Especial aliado' },
    { type: 'flying', moveName: 'Max Airstream', effect: 'Sube Velocidad aliado' },
    { type: 'psychic', moveName: 'Max Mindstorm', effect: 'Activa Campo Psíquico' },
    { type: 'bug', moveName: 'Max Flutterby', effect: 'Baja At. Especial rival' },
    { type: 'rock', moveName: 'Max Rockfall', effect: 'Activa Tormenta de Arena' },
    { type: 'ghost', moveName: 'Max Phantasm', effect: 'Baja Defensa rival' },
    { type: 'dragon', moveName: 'Max Wyrmwind', effect: 'Baja Ataque rival' },
    { type: 'dark', moveName: 'Max Darkness', effect: 'Baja Def. Especial rival' },
    { type: 'steel', moveName: 'Max Steelspike', effect: 'Sube Defensa aliado' },
    { type: 'fairy', moveName: 'Max Starfall', effect: 'Activa Campo de Niebla' },
];

export const getMaxMoveByType = (type: PkmnType): MaxMoveInfo | undefined =>
    MAX_MOVES.find(m => m.type === type);

// ═══════════════════════════════════════════
// GIGANTAMAX POKEMON
// ═══════════════════════════════════════════
export interface GmaxInfo {
    pokemon: string;
    gmaxMove: string;
    moveType: PkmnType;
    effect: string;
}

export const GMAX_POKEMON: GmaxInfo[] = [
    { pokemon: 'charizard', gmaxMove: 'G-Max Wildfire', moveType: 'fire', effect: 'Daño residual 4 turnos (no-Fire)' },
    { pokemon: 'butterfree', gmaxMove: 'G-Max Befuddle', moveType: 'bug', effect: 'Envenenamiento/Parálisis/Sueño aleatorio' },
    { pokemon: 'pikachu', gmaxMove: 'G-Max Volt Crash', moveType: 'electric', effect: 'Paraliza a todos los rivales' },
    { pokemon: 'meowth', gmaxMove: 'G-Max Gold Rush', moveType: 'normal', effect: 'Confusión + dinero extra' },
    { pokemon: 'machamp', gmaxMove: 'G-Max Chi Strike', moveType: 'fighting', effect: 'Sube probabilidad de crítico' },
    { pokemon: 'gengar', gmaxMove: 'G-Max Terror', moveType: 'ghost', effect: 'Impide huida/cambio' },
    { pokemon: 'kingler', gmaxMove: 'G-Max Foam Burst', moveType: 'water', effect: 'Baja Velocidad rival -2' },
    { pokemon: 'lapras', gmaxMove: 'G-Max Resonance', moveType: 'ice', effect: 'Aurora Veil 5 turnos' },
    { pokemon: 'eevee', gmaxMove: 'G-Max Cuddle', moveType: 'normal', effect: 'Enamoramiento a rivales' },
    { pokemon: 'snorlax', gmaxMove: 'G-Max Replenish', moveType: 'normal', effect: '50% chance restaurar baya' },
    { pokemon: 'garbodor', gmaxMove: 'G-Max Malodor', moveType: 'poison', effect: 'Envenenamiento a todos los rivales' },
    { pokemon: 'corviknight', gmaxMove: 'G-Max Wind Rage', moveType: 'flying', effect: 'Elimina barreras/hazards' },
    { pokemon: 'drednaw', gmaxMove: 'G-Max Stonesurge', moveType: 'water', effect: 'Stealth Rock al rival' },
    { pokemon: 'coalossal', gmaxMove: 'G-Max Volcalith', moveType: 'rock', effect: 'Daño residual 4 turnos (no-Rock)' },
    { pokemon: 'sandaconda', gmaxMove: 'G-Max Sandblast', moveType: 'ground', effect: 'Trampa arena 4-5 turnos' },
    { pokemon: 'centiskorch', gmaxMove: 'G-Max Centiferno', moveType: 'fire', effect: 'Trampa fuego 4-5 turnos' },
    { pokemon: 'grimmsnarl', gmaxMove: 'G-Max Snooze', moveType: 'dark', effect: 'Bostezo al rival' },
    { pokemon: 'alcremie', gmaxMove: 'G-Max Finale', moveType: 'fairy', effect: 'Cura HP aliados' },
    { pokemon: 'copperajah', gmaxMove: 'G-Max Steelsurge', moveType: 'steel', effect: 'Trampa acero al rival' },
    { pokemon: 'duraludon', gmaxMove: 'G-Max Depletion', moveType: 'dragon', effect: 'Reduce PP del último movimiento rival' },
    { pokemon: 'hatterene', gmaxMove: 'G-Max Smite', moveType: 'fairy', effect: 'Confusión a todos los rivales' },
    { pokemon: 'toxtricity', gmaxMove: 'G-Max Stun Shock', moveType: 'electric', effect: 'Envenenamiento o parálisis' },
    { pokemon: 'orbeetle', gmaxMove: 'G-Max Gravitas', moveType: 'psychic', effect: 'Gravedad 5 turnos' },
    { pokemon: 'inteleon', gmaxMove: 'G-Max Hydrosnipe', moveType: 'water', effect: 'Ignora habilidad rival' },
    { pokemon: 'cinderace', gmaxMove: 'G-Max Fireball', moveType: 'fire', effect: 'Ignora habilidad rival' },
    { pokemon: 'rillaboom', gmaxMove: 'G-Max Drum Solo', moveType: 'grass', effect: 'Ignora habilidad rival' },
    { pokemon: 'urshifu', gmaxMove: 'G-Max One Blow', moveType: 'dark', effect: 'Ignora Protección' },
];

export const getGmaxInfo = (pokemon: string): GmaxInfo | undefined =>
    GMAX_POKEMON.find(g => g.pokemon === pokemon.toLowerCase());

// ═══════════════════════════════════════════
// TERA TYPE UTILITIES
// ═══════════════════════════════════════════

/**
 * In Terastallization, the Pokémon's defensive typing becomes ONLY the Tera type.
 * STAB is additive: original STAB types + Tera type all get STAB.
 */
export const getTeraDefensiveTypes = (teraType: PkmnType): PkmnType[] => {
    return [teraType]; // Tera replaces both types with single Tera type for defense
};

/**
 * Get all STAB types considering Tera type.
 * If the Tera type matches an original type, it gets an additional Tera STAB boost.
 */
export const getTeraStabTypes = (originalTypes: PkmnType[], teraType: PkmnType): PkmnType[] => {
    const stabSet = new Set([...originalTypes, teraType]);
    return Array.from(stabSet);
};

// ═══════════════════════════════════════════
// Z-MOVE BASE POWER LOOKUP
// ═══════════════════════════════════════════
// Maps base move power → Z-Move power for physical/special Z-moves
export const getZMovePower = (basePower: number | null): number => {
    if (!basePower || basePower <= 55) return 100;
    if (basePower <= 65) return 120;
    if (basePower <= 75) return 140;
    if (basePower <= 85) return 160;
    if (basePower <= 95) return 175;
    if (basePower <= 100) return 180;
    if (basePower <= 110) return 185;
    if (basePower <= 125) return 190;
    if (basePower <= 130) return 195;
    return 200;
};
