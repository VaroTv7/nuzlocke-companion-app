import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Pokemon } from '../../store/useGameStore';
import { callGemini, callGeminiCommand } from '../../utils/gemini';
import { fetchPokemonSpecies, fetchMoveData, toggleShinyUrl } from '../../utils/pokeapi';
import type { PkmnType } from '../../utils/typeChart';
import { HelpCircle, Send, X, Bot, Trash2, Loader2, Check, Ban } from 'lucide-react';

export const AICoach: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingPokemon, setPendingPokemon] = useState<Pokemon | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const state = useGameStore();
    const { geminiConfig, aiChatHistory, setAiChatHistory, clearAiChatHistory, addPokemon } = state;

    const creationKeywords = ['añade', 'crea', 'pon', 'add', 'create', 'genera', 'generate', 'invoca', 'summon'];

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [aiChatHistory, isOpen]);

    const handleSend = async () => {
        if (!message.trim() || !geminiConfig.apiKey) return;

        const userMsg = message.trim();
        const isCreationCommand = creationKeywords.some(kw => userMsg.toLowerCase().startsWith(kw));

        setMessage('');
        setLoading(true);

        const newHistory = [...aiChatHistory, { role: 'user' as const, parts: [{ text: userMsg }] }];
        setAiChatHistory(newHistory);

        try {
            if (isCreationCommand) {
                const aiResult = await callGeminiCommand(
                    geminiConfig.apiKey,
                    geminiConfig.model,
                    userMsg,
                    state as any
                );

                if (aiResult && aiResult.species) {
                    // Hydrate with PokeAPI for accurate sprites and types
                    const apiData = await fetchPokemonSpecies(aiResult.species);
                    if (apiData) {
                        aiResult.species = apiData.name;
                        // Use helper to set correct shiny sprite immediately
                        aiResult.sprite = toggleShinyUrl(apiData.sprite, aiResult.isShiny);
                        aiResult.types = apiData.types as PkmnType[];

                        // Ensure ability is valid string
                        if (apiData.abilities && apiData.abilities.length > 0) {
                            aiResult.ability = apiData.abilities[0].name;
                        }

                        // Hydrate moves
                        const hydratedMoves = await Promise.all(aiResult.moves.map(async (m: any) => {
                            if (!m.name) return m;
                            const moveData = await fetchMoveData(m.name);
                            if (moveData) {
                                return {
                                    name: moveData.name,
                                    type: moveData.type as PkmnType,
                                    power: moveData.power,
                                    accuracy: moveData.accuracy,
                                    pp: moveData.pp
                                };
                            }
                            return m;
                        }));
                        aiResult.moves = hydratedMoves;
                    }

                    setPendingPokemon(aiResult);
                    setAiChatHistory([...newHistory, {
                        role: 'model',
                        parts: [{ text: `¡He proyectado un ${aiResult.species}! Revisa los detalles y confírmame si quieres que lo teletransporte a tu PC.` }]
                    }]);
                }
            } else {
                const response = await callGemini(
                    geminiConfig.apiKey,
                    geminiConfig.model,
                    aiChatHistory,
                    userMsg,
                    state as any
                );

                if (response) {
                    setAiChatHistory([...newHistory, response]);
                }
            }
        } catch (error: any) {
            const errorMsg = error.message.includes('API Error')
                ? error.message
                : "Error de conexión con Coach Varo. Revisa tu API Key.";
            setAiChatHistory([...newHistory, { role: 'model', parts: [{ text: errorMsg }] }]);
        } finally {
            setLoading(false);
        }
    };

    const confirmCreation = () => {
        if (pendingPokemon) {
            addPokemon(pendingPokemon);
            setAiChatHistory([...aiChatHistory, {
                role: 'model',
                parts: [{ text: `✅ ¡Teletransporte completado! ${pendingPokemon.name} ya está en tu almacenamiento.` }]
            }]);
            setPendingPokemon(null);
        }
    };

    const cancelCreation = () => {
        setPendingPokemon(null);
        setAiChatHistory([...aiChatHistory, {
            role: 'model',
            parts: [{ text: "❌ Operación cancelada. ¿Necesitas ayuda con otra cosa?" }]
        }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[70]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform border-2 ${isOpen
                    ? 'bg-cyber-danger border-white/20 rotate-90'
                    : 'bg-cyber-purple border-cyber-purple/50 hover:scale-110 shadow-[0_0_20px_rgba(188,19,254,0.4)]'
                    }`}
            >
                {isOpen ? <X size={28} /> : <HelpCircle size={28} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 -right-6 md:right-0 w-[90vw] md:w-[400px] h-[60vh] md:h-[500px] glass-card flex flex-col border border-white/20 animate-fade-in shadow-2xl rounded-2xl overflow-hidden z-[80]">
                    {/* Header */}
                    <div className="bg-cyber-purple/20 p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="text-cyber-purple" size={20} />
                            <span className="font-retro text-sm tracking-widest">COACH VARO AI</span>
                        </div>
                        <button onClick={clearAiChatHistory} className="text-gray-500 hover:text-cyber-danger transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
                        {aiChatHistory.length === 0 && (
                            <div className="text-center py-10 space-y-2 opacity-50">
                                <Bot size={40} className="mx-auto text-cyber-purple mb-4" />
                                <p className="text-xs font-bold uppercase tracking-tighter italic">"Pregúntame sobre tu equipo o estrategia..."</p>
                                <p className="text-[10px] text-cyber-secondary italic uppercase mt-2">✨ Prueba: "Añade un Pikachu nivel 20"</p>
                                {!geminiConfig.apiKey && <p className="text-[10px] text-cyber-danger italic uppercase">⚠️ Falta la API Key en Ajustes</p>}
                            </div>
                        )}
                        {aiChatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-cyber-purple text-white font-bold rounded-tr-none shadow-[0_0_15px_rgba(188,19,254,0.3)]'
                                    : 'bg-white/10 border border-white/20 text-gray-200 rounded-tl-none backdrop-blur-sm'
                                    }`}>
                                    {msg.parts[0].text}

                                    {/* Preview Card inside history if it was the last AI message and we have pendingPokemon */}
                                    {msg.role === 'model' && i === aiChatHistory.length - 1 && pendingPokemon && (
                                        <div className="mt-4 p-3 bg-black/60 rounded-lg border border-cyber-purple/30 animate-pulse-slow">
                                            <div className="flex items-center gap-3">
                                                <img src={pendingPokemon.sprite} alt="" className="w-12 h-12 pixelated bg-white/5 rounded" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-cyber-primary">{pendingPokemon.name}</p>
                                                    <p className="text-[10px] uppercase text-gray-500">
                                                        {pendingPokemon.species} Lvl.{pendingPokemon.level} —
                                                        Destino: <span className="text-cyber-secondary font-bold">{pendingPokemon.boxId === 0 ? 'EQUIPO' : (state.boxes.find(b => b.id === pendingPokemon.boxId)?.name || `Caja ${pendingPokemon.boxId}`)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={confirmCreation}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-cyber-success/20 hover:bg-cyber-success/40 text-cyber-success text-xs font-bold rounded border border-cyber-success/30 transition-all"
                                                >
                                                    <Check size={14} /> ACEPTAR
                                                </button>
                                                <button
                                                    onClick={cancelCreation}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-cyber-danger/20 hover:bg-cyber-danger/40 text-cyber-danger text-xs font-bold rounded border border-cyber-danger/30 transition-all"
                                                >
                                                    <Ban size={14} /> CANCELAR
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none flex items-center gap-2 text-gray-400">
                                    <Loader2 size={16} className="animate-spin text-cyber-purple" />
                                    <span className="text-xs italic">Analizando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-black/60 border-t border-white/10 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Dime cómo mejorar o añade un Pokémon..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-cyber-purple transition-all"
                            disabled={loading || !geminiConfig.apiKey || !!pendingPokemon}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim() || !geminiConfig.apiKey || !!pendingPokemon}
                            className="p-2 bg-cyber-purple hover:bg-purple-600 disabled:opacity-50 disabled:grayscale transition-all rounded-lg"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
