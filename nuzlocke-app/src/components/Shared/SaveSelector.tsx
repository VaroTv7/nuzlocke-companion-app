import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, Plus, Trash2, Check, X, RefreshCw, Download, Upload, Save, Zap } from 'lucide-react';
import { fetchSaves, createSave, type SaveSlot } from '../../utils/api';
import { useGameStore } from '../../store/useGameStore';
import { processSmartImport } from '../../utils/importer';

interface Props {
    currentSaveId: string | null;
    currentSaveName: string;
    onSelectSave: (id: string) => void;
    onCreateSave: (name: string) => void;
    onDeleteSave: (id: string) => void;
    getStateForSave: () => any;
}

export const SaveSelector: React.FC<Props> = ({
    currentSaveId,
    currentSaveName,
    onSelectSave,
    onCreateSave,
    onDeleteSave,
    getStateForSave,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [saves, setSaves] = useState<SaveSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [newSaveName, setNewSaveName] = useState('');
    const [showNewSaveInput, setShowNewSaveInput] = useState(false);
    const [showSaveAsInput, setShowSaveAsInput] = useState(false);
    const [saveAsName, setSaveAsName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<string | null>(null);

    // Smart Import State
    const [showSmartImport, setShowSmartImport] = useState(false);
    const [smartImportJson, setSmartImportJson] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadSaves = async () => {
        setLoading(true);
        const data = await fetchSaves();
        setSaves(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            loadSaves();
        }
    }, [isOpen]);

    const handleCreateSave = () => {
        if (newSaveName.trim()) {
            onCreateSave(newSaveName.trim());
            setNewSaveName('');
            setShowNewSaveInput(false);
            setTimeout(loadSaves, 500);
        }
    };

    const handleDelete = (id: string) => {
        onDeleteSave(id);
        setConfirmDelete(null);
        setTimeout(loadSaves, 500);
    };

    // SAVE AS: Save current state with a new name
    const handleSaveAs = async () => {
        if (!saveAsName.trim()) return;

        setLoading(true);
        try {
            const currentState = getStateForSave();
            const result = await createSave(saveAsName.trim(), currentState);
            if (result) {
                // Switch to the new save
                useGameStore.setState({
                    currentSaveId: result.id,
                    currentSaveName: result.name,
                    isServerMode: true,
                });
                setImportStatus('✅ Guardado como: ' + saveAsName.trim());
                setTimeout(() => setImportStatus(null), 2000);
            }
            setSaveAsName('');
            setShowSaveAsInput(false);
            setTimeout(loadSaves, 500);
        } catch (err) {
            console.error('Save As error:', err);
            setImportStatus('❌ Error al guardar');
            setTimeout(() => setImportStatus(null), 2000);
        } finally {
            setLoading(false);
        }
    };

    // SMART IMPORT: Process JSON text
    const handleSmartImport = async () => {

        if (!smartImportJson.trim()) return;

        setLoading(true);
        try {
            const newState = await processSmartImport(smartImportJson);
            if (!newState) {
                setImportStatus('❌ Error en formato JSON');
                setTimeout(() => setImportStatus(null), 3000);
                return;
            }

            // Create a new save on server for this imported data
            const saveName = newState.currentSaveName || `Smart Import ${new Date().toLocaleTimeString()}`;
            const result = await createSave(saveName, newState);

            if (result) {
                // Switch to the new save
                useGameStore.setState({
                    ...newState,
                    currentSaveId: result.id,
                    currentSaveName: result.name,
                    isServerMode: true,
                });

                // Show detailed status
                const teamCount = newState.pokemon.filter(p => p.status === 'team').length;
                const boxCount = newState.pokemon.length - teamCount;
                setImportStatus(`✅ Importado: ${teamCount} Equipo / ${boxCount} Caja`);

                setTimeout(() => setImportStatus(null), 4000);
                setShowSmartImport(false);
                setSmartImportJson('');
                setIsOpen(false);
            }
        } catch (err) {
            console.error('Smart Import error:', err);
            setImportStatus('❌ Error al importar');
            setTimeout(() => setImportStatus(null), 3000);
        } finally {
            setLoading(false);
            setTimeout(loadSaves, 500);
        }
    };

    // EXPORT: Download current state as JSON file
    const handleExport = () => {
        const state = getStateForSave();
        const exportData = {
            name: currentSaveName || 'VaroLocke Export',
            exportedAt: new Date().toISOString(),
            version: '2.0',
            state: state,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `varolocke-${currentSaveName || 'backup'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setImportStatus('✅ Exportado!');
        setTimeout(() => setImportStatus(null), 2000);
    };

    // IMPORT: Load state from JSON file
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (!data.state) {
                    setImportStatus('❌ Archivo inválido');
                    setTimeout(() => setImportStatus(null), 3000);
                    return;
                }

                // Load the imported state directly into the store
                const store = useGameStore.getState();

                // Apply imported state
                if (data.state.lives !== undefined) store.setLives(data.state.lives);
                if (data.state.notes !== undefined) store.setNotes(data.state.notes);

                // For arrays, we need to set them differently - use setState
                useGameStore.setState({
                    ...data.state,
                    currentSaveId: null,
                    currentSaveName: data.name || 'Importado',
                    isServerMode: false,
                });

                setImportStatus('✅ Importado: ' + (data.name || 'Partida'));
                setTimeout(() => setImportStatus(null), 3000);
                setIsOpen(false);
            } catch (err) {
                console.error('Import error:', err);
                setImportStatus('❌ Error al leer archivo');
                setTimeout(() => setImportStatus(null), 3000);
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Nunca';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative">
            {/* Hidden file input for import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-cyber-panel/80 hover:bg-cyber-panel border border-white/10 rounded-lg transition-colors"
            >
                <FolderOpen size={16} className="text-cyber-warning" />
                <span className="text-sm font-bold truncate max-w-[120px]">
                    {currentSaveName || 'Sin partida'}
                </span>
            </button>

            {/* Import Status Toast */}
            {importStatus && (
                <div className="absolute top-full left-0 mt-2 px-4 py-2 bg-cyber-dark border border-cyber-primary/50 rounded-lg text-sm font-bold animate-fade-in z-50">
                    {importStatus}
                </div>
            )}

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute top-full left-0 mt-2 w-80 bg-cyber-dark border border-cyber-primary/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                        {showSmartImport ? (
                            <div className="p-3">
                                <h3 className="font-bold text-sm text-cyber-warning mb-2 flex items-center gap-2">
                                    <Zap size={16} /> Importación Rápida (v2.0)
                                </h3>
                                <p className="text-xs text-gray-400 mb-2">
                                    Pega tu JSON aquí. Si 'team' está vacío, se rellenará desde la caja.
                                </p>
                                <textarea
                                    value={smartImportJson}
                                    onChange={(e) => setSmartImportJson(e.target.value)}
                                    placeholder={JSON.stringify({
                                        "name": "Partida Pro",
                                        "game": "Pokémon Edición Completa",
                                        "team": ["Draco", "Tifón", "Voltio", "Sombra", "Roca", "Mente"],
                                        "box_details": {
                                            "Draco": { "name": "Charizard", "nickname": "Draco", "level": 55, "item": "Carbón", "moves": ["Lanzallamas", "Tajo Aéreo", "Garra Dragón", "Terremoto"] },
                                            "Tifón": { "name": "Gyarados", "nickname": "Tifón", "level": 54, "item": "Agua Mística", "moves": ["Cascada", "Triturar", "Danza Dragón", "Colmillo Hielo"] },
                                            "Voltio": { "name": "Jolteon", "nickname": "Voltio", "level": 53, "item": "Imán", "moves": ["Rayo", "Voltiocambio", "Bola Sombra", "Onda Trueno"] },
                                            "Sombra": { "name": "Gengar", "nickname": "Sombra", "level": 54, "item": "Hechizo", "moves": ["Bola Sombra", "Bomba Lodo", "Hipnosis", "Come Sueños"] },
                                            "Roca": { "name": "Tyranitar", "nickname": "Roca", "level": 56, "item": "Restos", "moves": ["Roca Afilada", "Triturar", "Terremoto", "Trampa Rocas"] },
                                            "Mente": { "name": "Alakazam", "nickname": "Mente", "level": 55, "item": "Cuchara Torcida", "moves": ["Psíquico", "Bola Sombra", "Onda Certera", "Recuperación"] }
                                        }
                                    }, null, 2)}
                                    className="w-full h-64 text-xs bg-black/40 border border-white/10 rounded p-2 text-gray-300 focus:border-cyber-warning focus:outline-none resize-none font-mono"
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleSmartImport}
                                        disabled={loading || !smartImportJson.trim()}
                                        className="flex-1 py-1.5 bg-cyber-warning/20 hover:bg-cyber-warning text-cyber-warning hover:text-black rounded font-bold text-xs"
                                    >
                                        Importar
                                    </button>
                                    <button
                                        onClick={() => setShowSmartImport(false)}
                                        className="py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded font-bold text-xs"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-cyber-primary">
                                        Partidas Guardadas
                                    </h3>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setShowSmartImport(true)}
                                            className="p-1.5 hover:bg-white/10 rounded text-cyber-warning"
                                            title="Importar JSON Rápido"
                                        >
                                            <Zap size={14} />
                                        </button>
                                        <button
                                            onClick={handleExport}
                                            className="p-1.5 hover:bg-white/10 rounded text-cyber-success"
                                            title="Exportar a USB/Archivo"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1.5 hover:bg-white/10 rounded text-blue-400"
                                            title="Restaurar de Archivo"
                                        >
                                            <Upload size={14} />
                                        </button>
                                        <button
                                            onClick={loadSaves}
                                            className="p-1.5 hover:bg-white/10 rounded"
                                            disabled={loading}
                                        >
                                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </div>

                                {/* Save List */}
                                <div className="max-h-64 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <RefreshCw className="animate-spin mx-auto mb-2" />
                                            Cargando...
                                        </div>
                                    ) : saves.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No hay partidas en servidor
                                        </div>
                                    ) : (
                                        saves.map(save => (
                                            <div
                                                key={save.id}
                                                className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${save.id === currentSaveId ? 'bg-cyber-primary/10 border-l-2 border-l-cyber-primary' : ''
                                                    }`}
                                            >
                                                {confirmDelete === save.id ? (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-cyber-danger">¿Eliminar?</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDelete(save.id)}
                                                                className="p-1 bg-cyber-danger/20 hover:bg-cyber-danger text-cyber-danger hover:text-white rounded"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(null)}
                                                                className="p-1 bg-white/10 hover:bg-white/20 rounded"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            onClick={() => {
                                                                onSelectSave(save.id);
                                                                setIsOpen(false);
                                                            }}
                                                            className="flex-1 text-left"
                                                        >
                                                            <div className="font-bold text-sm truncate">{save.name}</div>
                                                            <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                                                <span>❤️ {save.lives}</span>
                                                                <span>🎮 {save.pokemonCount} Pokémon</span>
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {formatDate(save.lastModified)}
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(save.id)}
                                                            className="p-2 text-gray-500 hover:text-cyber-danger hover:bg-cyber-danger/10 rounded ml-2"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {/* Save As (current state) */}
                        <div className="p-3 border-t border-white/10 bg-black/20">
                            {showSaveAsInput ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={saveAsName}
                                        onChange={(e) => setSaveAsName(e.target.value)}
                                        placeholder="Nombre para guardar..."
                                        className="flex-1 px-3 py-2 bg-black/40 border border-cyber-success/40 rounded text-sm focus:border-cyber-success focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
                                    />
                                    <button
                                        onClick={handleSaveAs}
                                        className="px-3 py-2 bg-cyber-success/20 hover:bg-cyber-success text-cyber-success hover:text-black rounded font-bold text-sm"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSaveAsInput(false);
                                            setSaveAsName('');
                                        }}
                                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSaveAsInput(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyber-success/10 hover:bg-cyber-success/20 text-cyber-success rounded-lg font-bold text-sm transition-colors"
                                >
                                    <Save size={16} />
                                    Guardar Como...
                                </button>
                            )}
                        </div>

                        {/* New Save (blank) */}
                        <div className="p-3 border-t border-white/5 bg-black/30">
                            {showNewSaveInput ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSaveName}
                                        onChange={(e) => setNewSaveName(e.target.value)}
                                        placeholder="Nombre partida nueva..."
                                        className="flex-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-sm focus:border-cyber-primary focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateSave()}
                                    />
                                    <button
                                        onClick={handleCreateSave}
                                        className="px-3 py-2 bg-cyber-primary/20 hover:bg-cyber-primary text-cyber-primary hover:text-black rounded font-bold text-sm"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNewSaveInput(false);
                                            setNewSaveName('');
                                        }}
                                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewSaveInput(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg font-bold text-sm transition-colors"
                                >
                                    <Plus size={16} />
                                    Nueva Partida (Vacía)
                                </button>
                            )}
                        </div>

                        {/* Export/Import Help */}
                        <div className="px-3 py-2 border-t border-white/5 bg-black/40 text-[10px] text-gray-600 text-center">
                            💾 Exportar/Importar para USB o backup local
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
