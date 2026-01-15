const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8086;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============ API ROUTES ============

// GET /api/saves - List all saves
app.get('/api/saves', async (req, res) => {
    try {
        const saves = await db.getAllSaves();
        res.json(saves);
    } catch (err) {
        console.error('Error listing saves:', err);
        res.status(500).json({ error: 'Error al listar guardados' });
    }
});

// GET /api/saves/:id - Get specific save
app.get('/api/saves/:id', async (req, res) => {
    try {
        const data = await db.getSave(req.params.id);
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
app.post('/api/saves', async (req, res) => {
    try {
        const id = uuidv4();
        const { name, state } = req.body;
        const newSave = await db.createSave(id, name || 'Nueva Partida', state || {});
        res.status(201).json(newSave);
    } catch (err) {
        console.error('Error creating save:', err);
        res.status(500).json({ error: 'Error al crear guardado' });
    }
});

// PUT /api/saves/:id - Update save
app.put('/api/saves/:id', async (req, res) => {
    try {
        const { name, state } = req.body;
        // Check existance first is optional with SQL update but good for 404
        const existing = await db.getSave(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Guardado no encontrado' });
        }

        const updated = await db.updateSave(req.params.id, name, state);
        // Return full object merged
        res.json({
            ...existing,
            name: name !== undefined ? name : existing.name,
            state: state !== undefined ? state : existing.state,
            lastModified: updated.lastModified
        });
    } catch (err) {
        console.error('Error updating save:', err);
        res.status(500).json({ error: 'Error al actualizar guardado' });
    }
});

// DELETE /api/saves/:id - Delete save
app.delete('/api/saves/:id', async (req, res) => {
    try {
        const success = await db.deleteSave(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Guardado no encontrado' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting save:', err);
        res.status(500).json({ error: 'Error al eliminar guardado' });
    }
});

// ============ PROXY & CACHE ============

// GET /api/proxy/pokemon/:name
app.get('/api/proxy/pokemon/:name', async (req, res) => {
    const name = req.params.name.toLowerCase();
    try {
        // 1. Check Cache
        const cached = await db.getCachedPokemon(name);
        if (cached) {
            // console.log(`[CACHE HIT] ${name}`);
            return res.json(cached);
        }

        // 2. Fetch from PokeAPI
        // console.log(`[CACHE MISS] Fetching ${name}...`);
        const apiRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!apiRes.ok) {
            return res.status(apiRes.status).json({ error: 'Pokemon not found' });
        }
        const data = await apiRes.json();

        // 3. Serialize & Store (Keep it lightweight if possible, but full data is safer for now)
        const simplifiedData = {
            id: data.id,
            name: data.name,
            sprites: {
                front_default: data.sprites.front_default,
                other: data.sprites.other
            },
            types: data.types,
            stats: data.stats,
            abilities: data.abilities,
            // Add moves if needed later, but they are heavy.
            // For now, let's store what the app uses heavily.
        };

        db.cachePokemon(name, simplifiedData); // Fire and forget cache write
        res.json(simplifiedData);
    } catch (err) {
        console.error(`Proxy Error (${name}):`, err);
        res.status(500).json({ error: 'Proxy Error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'sqlite' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Varo Locke API (SQLite) running on port ${PORT}`);
});
