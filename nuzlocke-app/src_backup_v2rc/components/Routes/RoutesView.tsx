import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Map, CheckCircle, XCircle } from 'lucide-react';


const REGIONS = [
    'Pueblo Paleta', 'Ruta 1', 'Ciudad Verde', 'Ruta 2', 'Bosque Verde', 'Ciudad Plateada', 'Ruta 3', 'Mt. Moon', 'Ruta 4'
    // Add more as needed
];

export const RoutesView: React.FC = () => {
    // This would ideally interact with a "Routes" store, but for now we can infer used routes from the Pokemon locations if we had that field.
    // For MVP v2.0, let's allow manual toggling or simple visual tracking.

    // BETTER IDEA: Show which routes have been "used" based on existing Pokemon 'metLocation' (we need to add this field).

    const { pokemon } = useGameStore();
    const [filter, setFilter] = useState<'all' | 'caught' | 'failed'>('all');

    // Mock data for route status since we don't store route data yet.
    // In a full implementation, update store/useGameStore.ts to include `routes: Record<string, RouteStatus>`

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-cyber-dark/80 to-cyber-primary/10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-cyber-primary/20 rounded-full text-cyber-primary">
                        <Map size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Registro de Rutas</h2>
                        <p className="text-gray-400 text-sm">Control de encuentros Nuzlocke</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REGIONS.map(route => {
                        // Check if we have a pokemon from this route
                        // This implies adding 'metLocation' to Pokemon interface. 
                        // For now we will display a placeholder UI to show the 'Functionality'

                        return (
                            <div key={route} className="glass-panel p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                                <span className="font-bold">{route}</span>
                                <div className="flex gap-2">
                                    <button className="text-gray-500 hover:text-cyber-success" title="Atrapado"><CheckCircle size={20} /></button>
                                    <button className="text-gray-500 hover:text-cyber-danger" title="Fallado"><XCircle size={20} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
