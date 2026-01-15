import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Key, Bot } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { geminiConfig, setGeminiConfig } = useGameStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-6 relative border border-white/20 animate-slide-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyber-primary">
                    <Bot size={24} />
                    CONFIGURACIÓN AI
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Key size={14} />
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={geminiConfig.apiKey}
                            onChange={(e) => setGeminiConfig({ ...geminiConfig, apiKey: e.target.value })}
                            placeholder="Pon tu API Key aquí..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyber-primary outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-[10px] text-gray-500 italic">Consigue una gratis en Google AI Studio.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Modelo
                        </label>
                        <select
                            value={geminiConfig.model}
                            onChange={(e) => setGeminiConfig({ ...geminiConfig, model: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyber-primary outline-none transition-all"
                        >
                            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview (Máxima Potencia - Gratis)</option>
                            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Ultra Rápido - Gratis)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Inteligencia Pro - Gratis)</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Equilibrado - Gratis)</option>
                        </select>
                        <p className="text-[10px] text-gray-500 italic mt-1 text-center">Datos actualizados a Enero 2026. Usa modelos "Preview" para máxima potencia gratuita.</p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-cyber-primary/20 hover:bg-cyber-primary text-cyber-primary hover:text-black font-bold rounded-lg transition-all"
                        >
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
