const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'saves.db');
const SAVES_DIR = process.env.SAVES_DIR || path.join(__dirname, 'saves');
const MIGRATED_DIR = path.join(SAVES_DIR, '..', 'migrated_saves');

// Ensure directories exist
if (!fs.existsSync(SAVES_DIR)) fs.mkdirSync(SAVES_DIR, { recursive: true });
if (!fs.existsSync(MIGRATED_DIR)) fs.mkdirSync(MIGRATED_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initialize();
    }
});

function initialize() {
    db.serialize(() => {
        // Create Saves Table
        db.run(`CREATE TABLE IF NOT EXISTS saves (
            id TEXT PRIMARY KEY,
            name TEXT,
            state TEXT, 
            last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Cache Table (for Optimization Phase)
        db.run(`CREATE TABLE IF NOT EXISTS pokemon_cache (
            name TEXT PRIMARY KEY,
            data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migrate existing JSON files
        migrateJSONFiles();
        // Recover from bad migration (empty states)
        recoverBadMigration();
    });
}

function getSafeState(data) {
    // If data has a 'state' property, use it.
    // Otherwise, the data itself is likely the state (legacy format),
    // but we should try to exclude metadata like 'id', 'name', 'lastModified' if possible.
    if (data.state) return data.state;

    // Legacy format hypothesis: Root object is state
    const state = { ...data };
    delete state.id;
    delete state.name;
    delete state.lastModified;
    return state;
}

function migrateJSONFiles() {
    if (!fs.existsSync(SAVES_DIR)) return;

    const files = fs.readdirSync(SAVES_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) return;

    console.log(`Checking ${files.length} files for migration...`);

    const stmt = db.prepare("INSERT OR IGNORE INTO saves (id, name, state, last_modified) VALUES (?, ?, ?, ?)");

    for (const file of files) {
        try {
            const filePath = path.join(SAVES_DIR, file);
            const rawData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(rawData);

            const id = data.id || file.replace('.json', '');
            const name = data.name || 'Sin nombre';
            const state = JSON.stringify(getSafeState(data));
            const lastModified = data.lastModified || new Date().toISOString();

            stmt.run(id, name, state, lastModified, (err) => {
                if (err) {
                    console.error(`Failed to migrate ${file}:`, err.message);
                } else {
                    console.log(`Migrated ${file} to SQLite.`);
                    // SAFE MOVE: Use copy + unlink instead of rename for cross-device support (Docker)
                    try {
                        fs.copyFileSync(filePath, path.join(MIGRATED_DIR, file));
                        fs.unlinkSync(filePath);
                    } catch (moveErr) {
                        console.error(`Error moving ${file} to migrated folder:`, moveErr);
                    }
                }
            });
        } catch (err) {
            console.error(`Error reading ${file} for migration:`, err);
        }
    }
    stmt.finalize();
}

function recoverBadMigration() {
    // Check if we have files in migrated_saves but DB entries have empty states
    if (!fs.existsSync(MIGRATED_DIR)) return;

    const files = fs.readdirSync(MIGRATED_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) return;

    // Check one file to see if we need recovery
    // We update ALL entries matching these files that have suspect states
    const stmt = db.prepare(`UPDATE saves SET state = ? WHERE id = ? AND (state = '{}' OR state LIKE '{"lives":0%')`);

    console.log(`Checking ${files.length} migrated files for recovery...`);

    files.forEach(file => {
        try {
            const filePath = path.join(MIGRATED_DIR, file);
            const rawData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(rawData);

            const id = data.id || file.replace('.json', '');
            const safeState = getSafeState(data);

            // Only update if the logic actually yields something different than empty
            if (Object.keys(safeState).length > 0) {
                const stateStr = JSON.stringify(safeState);
                stmt.run(stateStr, id, function (err) {
                    if (!err && this.changes > 0) {
                        console.log(`Recovered save data for ${id}`);
                    }
                });
            }
        } catch (err) {
            console.error(`Recovery error for ${file}:`, err);
        }
    });
    stmt.finalize();
}

// Database API Methods API
module.exports = {
    getAllSaves: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, name, last_modified, state FROM saves", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    lastModified: row.last_modified,
                    // Parse state just to get summary info if needed, or keep it strict
                    pokemonCount: JSON.parse(row.state).pokemon?.length || 0,
                    lives: JSON.parse(row.state).lives || 0
                })));
            });
        });
    },

    getSave: (id) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM saves WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                else if (!row) resolve(null);
                else resolve({
                    id: row.id,
                    name: row.name,
                    lastModified: row.last_modified,
                    state: JSON.parse(row.state)
                });
            });
        });
    },

    createSave: (id, name, state) => {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            db.run("INSERT INTO saves (id, name, state, last_modified) VALUES (?, ?, ?, ?)",
                [id, name, JSON.stringify(state), now], function (err) {
                    if (err) reject(err);
                    else resolve({ id, name, state, lastModified: now });
                });
        });
    },

    updateSave: (id, name, state) => {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            // Dynamic update query
            db.run(`UPDATE saves SET 
                name = COALESCE(?, name), 
                state = COALESCE(?, state), 
                last_modified = ? 
                WHERE id = ?`,
                [name, state ? JSON.stringify(state) : null, now, id], function (err) {
                    if (err) reject(err);
                    else resolve({ id, name, state, lastModified: now });
                });
        });
    },

    deleteSave: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM saves WHERE id = ?", [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    },

    // Cache methods for later
    getCachedPokemon: (name) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT data FROM pokemon_cache WHERE name = ?", [name], (err, row) => {
                if (err) reject(err);
                else resolve(row ? JSON.parse(row.data) : null);
            });
        });
    },

    cachePokemon: (name, data) => {
        db.run("INSERT OR REPLACE INTO pokemon_cache (name, data) VALUES (?, ?)", [name, JSON.stringify(data)]);
    }
};
