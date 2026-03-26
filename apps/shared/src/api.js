const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export async function fetchJson(path, options = {}) { const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options }); if (!response.ok) throw new Error(`Erreur API: ${response.status}`); return response.json(); }
export { API_URL };
