const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8086;
const SAVES_DIR = process.env.SAVES_DIR || path.join(__dirname, 'saves');

// Ensure saves directory exists
if (!fs.existsSync(SAVES_DIR)) {
    fs.mkdirSync(SAVES_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Get save file path
const getSavePath = (id) => path.join(SAVES_DIR, `${id}.json`);

// Helper: Read save file
const readSave = (id) => {
    const filePath = getSavePath(id);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

// Helper: Write save file
const writeSave = (id, data) => {
    const filePath = getSavePath(id);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// ============ API ROUTES ============

// GET /api/saves - List all saves
app.get('/api/saves', (req, res) => {
    try {
        const files = fs.readdirSync(SAVES_DIR).filter(f => f.endsWith('.json'));
        const saves = files.map(f => {
            const id = f.replace('.json', '');
            const data = readSave(id);
            return {
                id,
                name: data?.name || 'Sin nombre',
                lastModified: data?.lastModified || null,
                pokemonCount: data?.state?.pokemon?.length || 0,
                lives: data?.state?.lives || 0,
            };
        });
        res.json(saves);
    } catch (err) {
        console.error('Error listing saves:', err);
        res.status(500).json({ error: 'Error al listar guardados' });
    }
});

// GET /api/saves/:id - Get specific save
app.get('/api/saves/:id', (req, res) => {
    try {
        const data = readSave(req.params.id);
        if (!data) {
            return res.status(404).json({ error: 'Guardado no encontrado' });
        }
        res.json(data);
    } catch (err) {
        console.error('Error reading save:', err);
        res.status(500).json({ error: 'Error al leer guardado' });
    }
});

// POST /api/saves - Create new save
app.post('/api/saves', (req, res) => {
    try {
        const id = uuidv4();
        const { name, state } = req.body;
        const data = {
            id,
            name: name || 'Nueva Partida',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            state: state || {},
        };
        writeSave(id, data);
        res.status(201).json(data);
    } catch (err) {
        console.error('Error creating save:', err);
        res.status(500).json({ error: 'Error al crear guardado' });
    }
});

// PUT /api/saves/:id - Update save
app.put('/api/saves/:id', (req, res) => {
    try {
        const existing = readSave(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Guardado no encontrado' });
        }
        const { name, state } = req.body;
        const data = {
            ...existing,
            name: name !== undefined ? name : existing.name,
            state: state !== undefined ? state : existing.state,
            lastModified: new Date().toISOString(),
        };
        writeSave(req.params.id, data);
        res.json(data);
    } catch (err) {
        console.error('Error updating save:', err);
        res.status(500).json({ error: 'Error al actualizar guardado' });
    }
});

// DELETE /api/saves/:id - Delete save
app.delete('/api/saves/:id', (req, res) => {
    try {
        const filePath = getSavePath(req.params.id);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Guardado no encontrado' });
        }
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting save:', err);
        res.status(500).json({ error: 'Error al eliminar guardado' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Varo Locke API running on port ${PORT}`);
    console.log(`📁 Saves directory: ${SAVES_DIR}`);
});
