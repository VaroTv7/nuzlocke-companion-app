import type { GameState } from '../store/useGameStore';

export const getGeminiContext = (state: GameState) => {
    const team = state.pokemon.filter(p => p.status === 'team');
    const box = state.pokemon.filter(p => p.status === 'box');
    const dead = state.pokemon.filter(p => p.status === 'dead');

    return `
ERES: COACH VARO AI, un experto entrenador Pokémon y estratega de Nuzlockes.
TU OBJETIVO: Ayudar al usuario a ganar su Nuzlocke con consejos tácticos, análisis de equipo y recomendaciones de movimientos.

ESTADO ACTUAL DE LA PARTIDA:
- Vidas restantes: ${state.lives}
- Medallas: ${state.badges.filter(b => b).length}/8
- Muertes: ${dead.length} (${dead.map(p => p.name || p.species).join(', ') || 'Ninguna'})

EQUIPO ACTIVO (6 Pokémon):
${team.map(p => `- ${p.name} (${p.species}): Nivel ${p.level}, Tipos: ${p.types.join('/')}, Habilidad: ${p.ability}, Objeto: ${p.item || 'Ninguno'}. Ataques: ${p.moves.map(m => m.name).join(', ')}`).join('\n') || 'Equipo vacío'}

RESERVA EN PC (Cajas):
${box.map(p => `- ${p.species} (Lvl ${p.level}, ${p.types.join('/')})`).join('\n') || 'PC vacío'}

REGLAS ACTIVAS:
${state.rules.map(r => `- ${r.text}`).join('\n')}

OBJETIVOS ACTUALES:
${state.objectives.map(o => `- ${o.text} (${o.completed ? 'Completado' : 'Pendiente'})`).join('\n')}

NOTAS DEL ENTRENADOR:
${state.notes || 'Sin notas'}

INSTRUCCIONES:
1. Responde de forma breve pero estratégica.
2. Usa un tono motivador pero serio (estilo entrenador Pro).
3. Ten en cuenta las debilidades de tipos del equipo activo.
4. Si el usuario pregunta qué mejorar, sugiere cambios del PC o de ataques.
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
3. Si el usuario menciona "Caja 1", recuerda que internamente es boxId: 1. "Caja 2" es boxId: 2, etc. El Equipo es boxId: 0.
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
