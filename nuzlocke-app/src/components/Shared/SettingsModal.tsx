import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Key, Bot, Gamepad2, Trophy } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { GAME_REGISTRY, GAME_MODES } from '../../utils/gameRegistry';
import type { GameMode } from '../../utils/gameRegistry';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MODEL_OPTIONS = [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Máxima Potencia)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Equilibrado)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Rápido)' },
];

const GAME_OPTIONS = GAME_REGISTRY.map(g => ({
    value: g.id,
    label: `${g.name} (${g.region})`,
}));

const MODE_OPTIONS = GAME_MODES.map(m => ({
    value: m.value,
    label: m.label,
}));

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        geminiConfig, setGeminiConfig,
        gameMode, setGameMode,
        selectedGame, setSelectedGame,
        setBadgeCount,
    } = useGameStore();

    if (!isOpen) return null;

    const handleGameChange = (gameId: string) => {
        setSelectedGame(gameId);
        const game = GAME_REGISTRY.find(g => g.id === gameId);
        if (game) {
            setBadgeCount(game.badgeCount);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="glass-card w-full max-w-lg p-6 relative border border-white/20 rounded-2xl animate-slide-up max-h-[85vh] overflow-y-auto custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyber-primary">
                    <Bot size={24} />
                    CONFIGURACIÓN
                </h2>

                <div className="space-y-6">
                    {/* ═══ GAME MODE ═══ */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                            <Gamepad2 size={16} /> Modo de Juego
                        </h3>
                        <CustomSelect
                            options={MODE_OPTIONS}
                            value={gameMode}
                            onChange={(v) => setGameMode(v as GameMode)}
                            id="game-mode-select"
                        />
                        <p className="text-[11px] text-gray-500 italic">
                            {GAME_MODES.find(m => m.value === gameMode)?.description}
                        </p>
                    </div>

                    {/* ═══ GAME SELECT ═══ */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                            <Trophy size={16} /> Juego Activo
                        </h3>
                        <CustomSelect
                            options={GAME_OPTIONS}
                            value={selectedGame}
                            onChange={handleGameChange}
                            searchable
                            id="game-select"
                        />
                        {(() => {
                            const game = GAME_REGISTRY.find(g => g.id === selectedGame);
                            if (!game) return null;
                            return (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {game.mechanics.length > 0 ? (
                                        game.mechanics.map(m => (
                                            <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyber-secondary/20 text-cyber-secondary border border-cyber-secondary/30">
                                                {m === 'tera' ? 'Teracristalización' : m === 'dynamax' ? 'Dynamax' : m === 'mega' ? 'Mega Evolución' : 'Movimientos Z'}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-gray-500 italic">Sin mecánicas especiales</span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <hr className="border-white/5" />

                    {/* ═══ AI CONFIG ═══ */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                            <Key size={16} /> Gemini API Key
                        </h3>
                        <input
                            type="password"
                            value={geminiConfig.apiKey}
                            onChange={(e) => setGeminiConfig({ ...geminiConfig, apiKey: e.target.value })}
                            placeholder="Pon tu API Key aquí..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary/30 outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-[10px] text-gray-500 italic">Consigue una gratis en Google AI Studio.</p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                            Modelo AI
                        </h3>
                        <CustomSelect
                            options={MODEL_OPTIONS}
                            value={geminiConfig.model}
                            onChange={(v) => setGeminiConfig({ ...geminiConfig, model: v })}
                            id="model-select"
                        />
                    </div>

                    {/* ═══ SAVE ═══ */}
                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-cyber-primary/20 hover:bg-cyber-primary text-cyber-primary hover:text-black font-bold rounded-xl transition-all duration-200"
                        >
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
