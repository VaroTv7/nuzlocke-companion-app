import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BookOpen, AlertCircle } from 'lucide-react';

export const NotesWidget: React.FC = () => {
    const { notes, setNotes } = useGameStore();

    return (
        <div className="glass-card p-6 rounded-2xl md:col-span-2 lg:col-span-1 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyber-secondary">
                <BookOpen size={20} /> CUADERNO DE VIAJE
            </h2>
            <div className="flex-1 relative">
                <textarea
                    className="w-full h-full min-h-[150px] bg-black/40 border border-white/10 rounded-lg p-4 text-gray-300 resize-none focus:border-cyber-secondary focus:ring-1 focus:ring-cyber-secondary outline-none font-mono text-sm leading-relaxed"
                    placeholder="Escribe aquí recordatorios, zonas bloqueadas, o estrategias..."
                    value={notes || ''}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-600 pointer-events-none">
                    PERSISTENTE
                </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-black/20 p-2 rounded">
                <AlertCircle size={14} className="mt-0.5" />
                <p>Las notas se guardan automáticamente en tu navegador.</p>
            </div>
        </div>
    );
};
