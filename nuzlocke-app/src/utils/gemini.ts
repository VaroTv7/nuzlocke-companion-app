import type { GameState } from '../store/useGameStore';

export const getGeminiContext = (state: GameState) => {
    const team = state.pokemon.filter(p => p.status === 'team');
    const box = state.pokemon.filter(p => p.status === 'box');
    const dead = state.pokemon.filter(p => p.status === 'dead');

    const earnedBadges = state.badges.earned.filter(b => b).length;
    const isNuzlocke = state.gameMode === 'nuzlocke';
    const isCompetitive = state.gameMode === 'competitive';

    const modeDesc = isNuzlocke
        ? 'un experto estratega de Nuzlockes. Cada decisión importa, porque las muertes son permanentes.'
        : isCompetitive
            ? 'un analista competitivo de Pokémon. Te especializas en teambuilding, tier lists, y matchups del metagame.'
            : 'un companion general de Pokémon. Ayudas con estrategia, datos, debilidades, y cualquier duda sobre Pokémon.';

    return `
ERES: VARO AI, ${modeDesc}
MODO: ${state.gameMode.toUpperCase()} | JUEGO: ${state.selectedGame}

ESTADO ACTUAL:
${isNuzlocke ? `- Vidas restantes: ${state.lives}\n- Muertes: ${dead.length} (${dead.map(p => p.name || p.species).join(', ') || 'Ninguna'})` : ''}
- Medallas: ${earnedBadges}/${state.badges.total}

EQUIPO ACTIVO:
${team.map(p => `- ${p.name} (${p.species}): Lvl ${p.level}, Tipos: ${p.types.join('/')}, Habilidad: ${p.ability}, Objeto: ${p.item || 'Ninguno'}${p.teraType ? `, Tera: ${p.teraType}` : ''}. Ataques: ${p.moves.map(m => m.name).join(', ')}`).join('\n') || 'Equipo vacío'}

RESERVA EN PC:
${box.map(p => `- ${p.species} (Lvl ${p.level}, ${p.types.join('/')})`).join('\n') || 'PC vacío'}

${isNuzlocke ? `REGLAS ACTIVAS:\n${state.rules.map(r => `- ${r.text}`).join('\n')}` : ''}

OBJETIVOS:
${state.objectives.map(o => `- ${o.text} (${o.completed ? '✅' : '⬜'})`).join('\n') || 'Sin objetivos'}

NOTAS: ${state.notes || 'Sin notas'}

INSTRUCCIONES:
1. Responde de forma breve pero estratégica. Máximo 3 párrafos.
2. Usa un tono motivador pero profesional.
3. Ten en cuenta las debilidades y coberturas del equipo.
4. Sugiere mejoras concretas (cambios de Pokémon del PC, cambios de ataques, objetos).
5. Responde siempre en español.
`;
};

export const callGemini = async (apiKey: string, model: string, history: any[], nextMessage: string, state: GameState) => {
    const systemPrompt = getGeminiContext(state);

    const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Entendido. Soy Coach Varo AI. Estoy listo para analizar tu equipo y darte consejos para ganar este Nuzlocke." }] },
        ...history,
        { role: 'user', parts: [{ text: nextMessage }] }
    ];

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || response.statusText;
            throw new Error(`API Error (${response.status}): ${errorMsg}`);
        }

        if (data.error) throw new Error(data.error.message);

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Gemini no devolvió ninguna respuesta (Posible bloqueo de seguridad).");
        }

        return data.candidates[0].content;
    } catch (error: any) {
        console.error('Gemini Error Details:', error);
        throw error;
    }
};

export const callGeminiCommand = async (apiKey: string, model: string, command: string, state: GameState) => {
    const prompt = `
Actúa como un generador de datos JSON para Pokémon. 
Tu objetivo es transformar el comando del usuario en un objeto JSON que represente a un Pokémon con la siguiente interfaz exacta:

interface Pokemon {
    id: string; // Genera un UUID aleatorio
    name: string; // El mote si se especifica, si no la especie
    species: string; // Capitalizado (ej: Pikachu)
    sprite: string; // URL: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/\${species_lowercased}.png
    types: PkmnType[]; // Array de strings en minúsculas (ej: ["electric", "steel"])
    level: number;
    gender: 'M' | 'F' | 'N';
    nature: string;
    ability: string;
    item: string;
    status: 'team' | 'box' | 'dead';
    boxId: number; // 0 para team, 1+ para boxes
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

Comando del usuario: "${command}"

CAJAS DISPONIBLES EN LA PARTIDA:
${state.boxes.map(b => `- ID ${b.id}: "${b.name}"`).join('\n')}
(ID 0 es siempre el EQUIPO ACTIVO)

REGLAS:
1. Responde ÚNICAMENTE con el objeto JSON. Sin explicaciones, sin bloques de código, solo el objeto entre llaves {}.
2. Si el usuario no especifica algo (como naturaleza u objeto), inventa uno coherente o usa valores por defecto.
3. Asigna el boxId basándote EXCLUSIVAMENTE en la lista de cajas proporcionada arriba. Busca el nombre que pide el usuario y usa su ID. El Equipo siempre es boxId: 0.
4. Asegúrate de que los movimientos existan y tengan datos coherentes de PP, potencia (si aplica) y tipo.
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1, // Baja temperatura para mayor consistencia
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Error en comando AI");

        const text = data.candidates[0].content.parts[0].text;
        // Limpiar posible formato markdown si la IA ignora las instrucciones
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error in AI Command:', error);
        throw error;
    }
};
