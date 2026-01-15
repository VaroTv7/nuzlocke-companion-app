import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { callGemini } from '../../utils/gemini';
import { HelpCircle, Send, X, Bot, Trash2, Loader2 } from 'lucide-react';

export const AICoach: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const state = useGameStore();
    const { geminiConfig, aiChatHistory, setAiChatHistory, clearAiChatHistory } = state;

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [aiChatHistory, isOpen]);

    const handleSend = async () => {
        if (!message.trim() || !geminiConfig.apiKey) return;

        const userMsg = message.trim();
        setMessage('');
        setLoading(true);

        const newHistory = [...aiChatHistory, { role: 'user' as const, parts: [{ text: userMsg }] }];
        setAiChatHistory(newHistory);

        try {
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
        } catch (error: any) {
            const errorMsg = error.message.includes('API Error')
                ? error.message
                : "Error de conexión con Coach Varo. Revisa tu API Key.";
            setAiChatHistory([...newHistory, { role: 'model', parts: [{ text: errorMsg }] }]);
        } finally {
            setLoading(false);
        }
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
                                {!geminiConfig.apiKey && <p className="text-[10px] text-cyber-danger italic uppercase">⚠️ Falta la API Key en Ajustes</p>}
                            </div>
                        )}
                        {aiChatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-cyber-purple/20 border border-cyber-purple/40 text-white rounded-tr-none'
                                    : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                                    }`}>
                                    {msg.parts[0].text}
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
                            placeholder="Dime cómo mejorar mi equipo..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-cyber-purple transition-all"
                            disabled={loading || !geminiConfig.apiKey}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim() || !geminiConfig.apiKey}
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
