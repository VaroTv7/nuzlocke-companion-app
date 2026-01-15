import React from 'react';
import { ScrollText, ShieldAlert, Skull, Heart, Trophy, Zap, AlertTriangle } from 'lucide-react';

export const RulesView: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
            <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-cyber-dark to-[#0f172a]">
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                    <div className="p-3 bg-cyber-primary/20 rounded-full text-cyber-primary shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                        <ScrollText size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-white">
                            REGLAMENTO TWITCH CUP 4
                        </h2>
                        <p className="text-gray-400 font-retro text-sm">Protocolo Randomlocke Estándar</p>
                    </div>
                </div>

                <div className="space-y-8 font-sans">

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Zap className="text-cyber-warning mt-1 shrink-0" />
                            <p className="text-lg leading-relaxed text-gray-200">
                                <strong className="text-cyber-primary">¿En qué consiste?</strong> Una aventura creada por TC Devs donde
                                <span className="text-cyber-warning font-bold"> TODO es aleatorio</span>.
                                Cualquier Pokémon puede aparecer en cualquier ruta (salvo legendarios), con stats, IVs, habilidades y ataques random.
                            </p>
                        </div>
                    </section>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="glass-panel p-5 border-l-4 border-cyber-danger">
                            <h3 className="font-bold text-cyber-danger flex items-center gap-2 mb-2">
                                <Skull size={18} /> Muerte Permanente
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Si un Pokémon se debilita, se debe dejar en el PC en una caja aparte ("Cementerio") para siempre.
                            </p>
                        </div>

                        <div className="glass-panel p-5 border-l-4 border-cyber-success">
                            <h3 className="font-bold text-cyber-success flex items-center gap-2 mb-2">
                                <Heart size={18} /> Vidas y Revivir
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Límite global de vidas (Habitual: 10, Extremo: 3).
                                <br />
                                <strong className="text-white">+1 Revivir</strong> por cada Líder de Gimnasio vencido (hasta Alto Mando).
                            </p>
                        </div>

                        <div className="glass-panel p-5 border-l-4 border-cyber-primary">
                            <h3 className="font-bold text-cyber-primary flex items-center gap-2 mb-2">
                                <Trophy size={18} /> Capturas
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Solo el <strong>primer Pokémon</strong> de cada ruta. Si ya lo tienes, puedes capturar el siguiente.
                                <br /><span className="text-xs text-gray-500 mt-1 block">Shinies son capturas extra (max 5, 2 en equipo).</span>
                            </p>
                        </div>

                        <div className="glass-panel p-5 border-l-4 border-purple-500">
                            <h3 className="font-bold text-purple-400 flex items-center gap-2 mb-2">
                                <ShieldAlert size={18} /> Combates Importantes
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Contra Entrenadores/Líderes: <strong>Prohibido recibir consejos</strong> y Chat en modo Emotes.
                            </p>
                        </div>
                    </div>

                    <section className="glass-panel bg-black/40 p-6 rounded-xl space-y-3">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            <AlertTriangle className="text-yellow-500" />
                            Cláusulas Especiales
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">
                            <li><strong className="text-white">Motes obligatorios</strong> para todos los Pokémon.</li>
                            <li><strong className="text-white">Fallos humanos</strong> (missclick) se pagan: no se repite turno.</li>
                            <li><strong className="text-white">Cláusula de Wipe:</strong> Si pierdes todo el equipo, puede haber un evento de salvación (especialmente early-game).</li>
                            <li>Intercambios por Pokémon/Objetos y Fósiles cuentan como capturas extra (según Devs).</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
