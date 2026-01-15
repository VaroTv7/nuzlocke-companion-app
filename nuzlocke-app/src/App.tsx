import { useState } from 'react'
import { useGameStore } from './store/useGameStore'
import { PCView } from './components/PC/PCView'
import { CombatView } from './components/Combat/CombatView'
import { RulesView } from './components/Rules/RulesView'
import { MoveDex } from './components/Dex/MoveDex'
import { Pokedex } from './components/Dex/Pokedex'
import { PokemonCard } from './components/PC/PokemonCard'
import { EditModal } from './components/PC/EditModal'
import { NotesWidget } from './components/Dashboard/NotesWidget'
import { SaveSelector } from './components/Shared/SaveSelector'
import { Plus, Swords, BookOpen, Search, Cloud, CloudOff, FileDown } from 'lucide-react'
import type { Pokemon } from './store/useGameStore'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pc' | 'combat' | 'movedex' | 'pokedex' | 'rules'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);

  const {
    lives, badges, toggleBadge, pokemon, removePokemon,
    currentSaveId, currentSaveName, isServerMode, isSyncing,
    loadFromServer, createNewSave, deleteSave: storeDeleteSave,
    importFromJSON
  } = useGameStore();

  const team = (pokemon || []).filter(p => p.status === 'team');

  const handleAddNew = () => {
    setEditingPokemon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (p: Pokemon) => {
    setEditingPokemon(p);
    setIsModalOpen(true);
  };

  const handleSelectSave = async (id: string) => {
    await loadFromServer(id);
  };

  const handleCreateSave = async (name: string) => {
    await createNewSave(name);
  };

  const handleDeleteSave = async (id: string) => {
    await storeDeleteSave(id);
  };

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
    const state = useGameStore.getState();
    return {
      lives: state.lives,
      badges: state.badges,
      objectives: state.objectives,
      pokemon: state.pokemon,
      rules: state.rules,
      boxes: state.boxes,
      notes: state.notes,
    };
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white font-cyber p-4 pb-20 md:pb-8 selection:bg-cyber-primary selection:text-black">
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/10 px-4 py-3 flex justify-between items-center bg-black/80 backdrop-blur-md">
        <h1 className="text-xl font-retro text-cyber-primary tracking-tighter">
          VARO<span className="text-white">LOCKE</span> <span className="text-xs text-cyber-secondary align-top">v2.0</span>
        </h1>
        <div className="flex items-center gap-3">
          {/* Save Selector */}
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
              title="Importar JSON de Windows"
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

          {/* Lives Counter */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
            <button
              onClick={() => useGameStore.getState().setLives(Math.max(0, lives - 1))}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-cyber-danger font-bold transition-colors"
            >
              -
            </button>
            <span className="text-sm font-bold text-cyber-danger mx-1">❤️ {lives}</span>
            <button
              onClick={() => useGameStore.getState().setLives(lives + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-cyber-success font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </header>

      <main className="mt-20 max-w-7xl mx-auto grid gap-6">

        {/* Navigation Tabs */}
        <nav className="fixed bottom-0 left-0 w-full md:static md:w-auto z-40 bg-cyber-dark/95 backdrop-blur md:bg-transparent border-t md:border-t-0 border-white/10 md:mb-6 overflow-x-auto">
          <div className="flex justify-start md:justify-center gap-2 md:gap-4 p-3 md:p-0 min-w-max mx-auto">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'pc', label: 'PC Box' },
              { id: 'combat', label: 'Combate', icon: <Swords size={16} className="-ml-1" /> },
              { id: 'movedex', label: 'Ataques', icon: <Search size={16} className="-ml-1" /> },
              { id: 'pokedex', label: 'PokéDex', icon: <BookOpen size={16} className="-ml-1" /> },
              { id: 'rules', label: 'Normas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg font-bold border transition-all duration-300 uppercase tracking-widest text-xs md:text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                  : 'bg-glass-100 border-transparent text-gray-400 hover:text-white hover:bg-glass-200'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* View Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-cyber-warning">🏆</span> Medallas
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-center">
                {badges.map((active, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleBadge(idx)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 transition-all duration-500 flex items-center justify-center relative group ${active
                      ? 'border-cyber-primary bg-cyber-primary/20 shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                      : 'border-white/10 bg-black/40 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                      }`}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border ${active ? 'bg-gradient-to-br from-yellow-400 to-orange-600 border-yellow-300' : 'bg-gray-800 border-gray-600'}`}>
                      <span className={`text-lg md:text-xl font-black ${active ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
                        {idx + 1}
                      </span>
                    </div>
                    {active && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-cyber-primary/30" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* ACTIVE TEAM & NOTES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ACTIVE TEAM DASHBOARD */}
              <section className="glass-card p-6 rounded-2xl border-white/10 col-span-1 lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyber-primary">
                  <span className="text-2xl">⚡</span> EQUIPO ACTIVO
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {team.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                      <p className="font-retro text-xl mb-2">EQUIPO VACÍO</p>
                      <button onClick={() => setActiveTab('pc')} className="text-cyber-secondary hover:underline">
                        Ir al PC para reclutar
                      </button>
                    </div>
                  )}

                  {team.map(p => (
                    <PokemonCard
                      key={p.id}
                      data={p}
                      onEdit={handleEdit}
                      onDelete={removePokemon}
                    />
                  ))}

                  {team.length < 6 && (
                    <button
                      onClick={handleAddNew}
                      className="glass-card flex flex-col items-center justify-center p-6 border-dashed border-2 border-white/20 hover:border-cyber-primary/50 group h-48 md:h-auto transition-all bg-black/20"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyber-primary/20 transition-colors">
                        <Plus className="text-gray-400 group-hover:text-cyber-primary" size={24} />
                      </div>
                      <span className="mt-3 text-sm text-gray-500 group-hover:text-white uppercase tracking-wider font-bold">Reclutar</span>
                    </button>
                  )}
                </div>
              </section>

              {/* NOTES WIDGET */}
              <NotesWidget />
            </div>
          </div>
        )}

        {/* RENDER ALL VIEWS */}
        {activeTab === 'pc' && <PCView />}
        {activeTab === 'combat' && <CombatView />}
        {activeTab === 'movedex' && <MoveDex />}
        {activeTab === 'pokedex' && <Pokedex />}
        {activeTab === 'rules' && <RulesView />}

      </main>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pokemon={editingPokemon}
      />
    </div>
  )
}

export default App
