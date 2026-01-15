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
