// API client for save management
// Connects to the backend API on port 8086

// Determine API base URL based on current location
const getApiBaseUrl = (): string => {
    // In production, the API runs on port 8086 of the same host
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

    // Explicitly target the backend port 8086
    return `${protocol}//${host}:8086/api`;
};

const API_BASE = getApiBaseUrl();

export interface SaveSlot {
    id: string;
    name: string;
    lastModified: string | null;
    pokemonCount: number;
    lives: number;
}

export interface SaveData {
    id: string;
    name: string;
    createdAt: string;
    lastModified: string;
    state: any;
}

// Fetch all save slots
export async function fetchSaves(): Promise<SaveSlot[]> {
    try {
        const res = await fetch(`${API_BASE}/saves`);
        if (!res.ok) throw new Error('Failed to fetch saves');
        return await res.json();
    } catch (error) {
        console.error('API Error (fetchSaves):', error);
        return [];
    }
}

// Fetch a specific save
export async function fetchSave(id: string): Promise<SaveData | null> {
    try {
        const res = await fetch(`${API_BASE}/saves/${id}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('API Error (fetchSave):', error);
        return null;
    }
}

// Create a new save
export async function createSave(name: string, state: any): Promise<SaveData | null> {
    try {
        const res = await fetch(`${API_BASE}/saves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, state }),
        });
        if (!res.ok) throw new Error('Failed to create save');
        return await res.json();
    } catch (error) {
        console.error('API Error (createSave):', error);
        return null;
    }
}

// Update an existing save
export async function updateSave(id: string, name: string, state: any): Promise<SaveData | null> {
    try {
        const res = await fetch(`${API_BASE}/saves/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, state }),
        });
        if (!res.ok) throw new Error('Failed to update save');
        return await res.json();
    } catch (error) {
        console.error('API Error (updateSave):', error);
        return null;
    }
}

// Delete a save
export async function deleteSave(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/saves/${id}`, {
            method: 'DELETE',
        });
        return res.ok;
    } catch (error) {
        console.error('API Error (deleteSave):', error);
        return false;
    }
}

// Check API health
export async function checkApiHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/health`);
        return res.ok;
    } catch {
        return false;
    }
}
