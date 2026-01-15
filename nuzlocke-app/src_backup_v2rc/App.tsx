import { useState } from 'react'
import { useGameStore } from './store/useGameStore'
import { PCView } from './components/PC/PCView'
import { CombatView } from './components/Combat/CombatView'
import { RulesView } from './components/Rules/RulesView'
import { PokemonCard } from './components/PC/PokemonCard'
import { EditModal } from './components/PC/EditModal'
import { Plus } from 'lucide-react'
import type { Pokemon } from './store/useGameStore'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pc' | 'combat' | 'rules'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { lives, badges, toggleBadge, pokemon, removePokemon } = useGameStore();

  const team = pokemon.filter(p => p.status === 'team');

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white font-cyber p-4 pb-20 md:pb-8 selection:bg-cyber-primary selection:text-black">
      {/* Top Bar / Header */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/10 px-4 py-3 flex justify-between items-center bg-black/80 backdrop-blur-md">
        <h1 className="text-xl font-retro text-cyber-primary tracking-tighter">
          VARO<span className="text-white">LOCKE</span> <span className="text-xs text-cyber-secondary align-top">v2.0</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
            <span className="text-sm font-bold text-cyber-danger">❤️ {lives}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-20 max-w-7xl mx-auto grid gap-6">

        {/* Navigation Tabs */}
        <nav className="fixed bottom-0 left-0 w-full md:static md:w-auto z-40 bg-cyber-dark/95 backdrop-blur md:bg-transparent border-t md:border-t-0 border-white/10 md:mb-6">
          <div className="flex justify-around md:justify-center gap-2 md:gap-4 p-3 md:p-0 max-w-lg mx-auto md:max-w-none">
            {['dashboard', 'pc', 'combat', 'rules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-bold border transition-all duration-300 uppercase tracking-widest text-xs md:text-sm ${activeTab === tab
                    ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                    : 'bg-glass-100 border-transparent text-gray-400 hover:text-white hover:bg-glass-200'
                  }`}
              >
                {tab === 'rules' ? 'Normas' : tab}
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
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${idx + 1}.png`}
                      alt={`Medalla ${idx + 1}`}
                      className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
                      onError={(e) => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg')}
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* ACTIVE TEAM DASHBOARD */}
            <section className="glass-card p-6 rounded-2xl border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyber-primary">
                <span className="text-2xl">⚡</span> EQUIPO ACTIVO
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    onEdit={() => { }} // Read only in dashboard or redirect?
                    onDelete={removePokemon}
                    showEdit={false} // Maybe just show basics
                  />
                ))}

                {team.length < 6 && team.length > 0 && (
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
          </div>
        )}

        {activeTab === 'pc' && <PCView />}

        {activeTab === 'combat' && <CombatView />}

        {activeTab === 'rules' && <RulesView />}

      </main>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pokemon={null}
      />
    </div>
  )
}

export default App
