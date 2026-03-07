import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useGameStore, getSaveableState } from '../../store/useGameStore';
import { SaveSelector } from '../Shared/SaveSelector';
import { SettingsModal } from '../Shared/SettingsModal';
import { AICoach } from '../Dashboard/AICoach';
import {
    Settings, Cloud, CloudOff, FileDown,
    LayoutDashboard, HardDrive, Swords, Search, BookOpen,
    Hammer, MoreHorizontal, Heart, ChevronLeft, ChevronRight, Users
} from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/pc', label: 'PC Box', icon: HardDrive },
    { path: '/app/combat', label: 'Combate', icon: Swords },
    { path: '/app/rivals', label: 'Rivales', icon: Users },
    { path: '/app/dex', label: 'PokéDex', icon: BookOpen },
    { path: '/app/builder', label: 'Builder', icon: Hammer },
    { path: '/app/movedex', label: 'Ataques', icon: Search },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
    const location = useLocation();

    const {
        lives, gameMode,
        currentSaveId, currentSaveName, isServerMode, isSyncing,
        loadFromServer, createNewSave, deleteSave: storeDeleteSave,
        importFromJSON
    } = useGameStore();

    const handleSelectSave = async (id: string) => { await loadFromServer(id); };
    const handleCreateSave = async (name: string) => { await createNewSave(name); };
    const handleDeleteSave = async (id: string) => { await storeDeleteSave(id); };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                await importFromJSON(json);
            } catch (err) {
                console.error('Error parsing JSON:', err);
            }
        };
        reader.readAsText(file);
    };

    const getStateForSave = () => {
        return getSaveableState(useGameStore.getState());
    };

    // Mobile shows max 4 items + "more"
    const mobileMainItems = NAV_ITEMS.slice(0, 4);
    const mobileMoreItems = NAV_ITEMS.slice(4);

    return (
        <div className="min-h-screen bg-cyber-dark text-white font-cyber selection:bg-cyber-primary selection:text-black">
            {/* ═══ HEADER ═══ */}
            <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/10 px-4 py-3 flex justify-between items-center bg-black/80 backdrop-blur-md">
                <h1 className="text-xl font-retro text-cyber-primary tracking-tighter">
                    VARO<span className="text-white">POKÉMON</span>{' '}
                    <span className="text-xs text-cyber-secondary align-top hidden sm:inline">CompanioTool</span>
                </h1>
                <div className="flex items-center gap-3">
                    <SaveSelector
                        currentSaveId={currentSaveId}
                        currentSaveName={currentSaveName}
                        onSelectSave={handleSelectSave}
                        onCreateSave={handleCreateSave}
                        onDeleteSave={handleDeleteSave}
                        getStateForSave={getStateForSave}
                    />

                    {/* Sync Status */}
                    <div className="flex items-center gap-1" title={isServerMode ? 'Sincronizado con servidor' : 'Solo local'}>
                        {isServerMode ? (
                            <Cloud size={16} className={`text-cyber-success ${isSyncing ? 'animate-pulse' : ''}`} />
                        ) : (
                            <CloudOff size={16} className="text-gray-500" />
                        )}
                    </div>

                    {/* Import JSON */}
                    <div className="relative group">
                        <button
                            onClick={() => document.getElementById('import-json-input')?.click()}
                            className="p-2 rounded-full hover:bg-white/10 text-cyber-purple transition-all border border-white/5 hover:border-cyber-purple/50 bg-black/20"
                            title="Importar JSON"
                        >
                            <FileDown size={18} />
                        </button>
                        <input
                            id="import-json-input"
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImportJSON}
                        />
                    </div>

                    {/* Settings */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-cyber-primary transition-all border border-white/5 bg-black/20"
                        title="Configuración"
                    >
                        <Settings size={18} />
                    </button>

                    {/* Lives Counter — only in Nuzlocke mode */}
                    {gameMode === 'nuzlocke' && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                            <button
                                onClick={() => useGameStore.getState().setLives(Math.max(0, lives - 1))}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-cyber-danger font-bold transition-colors"
                            >−</button>
                            <Heart size={14} className="text-cyber-danger" fill="currentColor" />
                            <span className="text-sm font-bold text-cyber-danger">{lives}</span>
                            <button
                                onClick={() => useGameStore.getState().setLives(lives + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-cyber-success font-bold transition-colors"
                            >+</button>
                        </div>
                    )}
                </div>
            </header>

            {/* ═══ DESKTOP SIDEBAR ═══ */}
            <aside className={`hidden md:flex fixed top-[61px] left-0 h-[calc(100vh-61px)] z-40 flex-col border-r border-white/10 bg-cyber-panel/90 backdrop-blur-lg transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-52'}`}>
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${isActive
                                    ? 'bg-cyber-primary/15 text-cyber-primary shadow-[0_0_12px_rgba(0,243,255,0.1)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
              `}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-3 border-t border-white/10 text-gray-500 hover:text-white transition-colors flex items-center justify-center"
                >
                    {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </aside>

            {/* ═══ MOBILE BOTTOM NAV ═══ */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-cyber-dark/95 backdrop-blur-lg border-t border-white/10">
                <div className="flex items-center justify-around py-2 px-1 relative">
                    {mobileMainItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${isActive
                                    ? 'text-cyber-primary'
                                    : 'text-gray-500 active:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
                                {isActive && <div className="w-1 h-1 rounded-full bg-cyber-primary mt-0.5" />}
                            </NavLink>
                        );
                    })}

                    {/* More button */}
                    {mobileMoreItems.length > 0 && (
                        <button
                            onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${mobileMoreOpen ? 'text-cyber-primary' : 'text-gray-500'
                                }`}
                        >
                            <MoreHorizontal size={20} />
                            <span className="text-[10px] font-semibold tracking-tight">Más</span>
                        </button>
                    )}

                    {/* More dropdown */}
                    {mobileMoreOpen && (
                        <div className="absolute bottom-full mb-2 right-2 bg-cyber-panel border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden min-w-[160px]">
                            {mobileMoreItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMoreOpen(false)}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                    ${isActive ? 'bg-cyber-primary/15 text-cyber-primary' : 'text-gray-300 hover:bg-white/5'}
                  `}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className={`pt-[73px] pb-20 md:pb-8 transition-all duration-300 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-52'}`}>
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>

            {/* ═══ GLOBAL MODALS ═══ */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <AICoach />
        </div>
    );
};
