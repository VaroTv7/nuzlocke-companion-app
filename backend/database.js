const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'saves.db');
const SAVES_DIR = path.join(__dirname, 'saves');
const MIGRATED_DIR = path.join(__dirname, 'migrated_saves');

// Ensure migration directory exists
if (!fs.existsSync(MIGRATED_DIR)) {
    fs.mkdirSync(MIGRATED_DIR);
}

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
    });
}

function migrateJSONFiles() {
    if (!fs.existsSync(SAVES_DIR)) return;

    const files = fs.readdirSync(SAVES_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) return;

    console.log(`Checking ${files.length} files for migration...`);

    const stmt = db.prepare("INSERT OR IGNORE INTO saves (id, name, state, last_modified) VALUES (?, ?, ?, ?)");

    files.forEach(file => {
        try {
            const filePath = path.join(SAVES_DIR, file);
            const rawData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(rawData);

            const id = data.id || file.replace('.json', '');
            const name = data.name || 'Sin nombre';
            const state = JSON.stringify(data.state || {});
            const lastModified = data.lastModified || new Date().toISOString();

            stmt.run(id, name, state, lastModified, (err) => {
                if (err) {
                    console.error(`Failed to migrate ${file}:`, err.message);
                } else {
                    console.log(`Migrated ${file} to SQLite.`);
                    // Move to migrated folder to avoid re-processing
                    fs.renameSync(filePath, path.join(MIGRATED_DIR, file));
                }
            });
        } catch (err) {
            console.error(`Error reading ${file} for migration:`, err);
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
