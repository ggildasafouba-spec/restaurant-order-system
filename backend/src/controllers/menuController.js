import { memoryStore } from '../store/memoryStore.js';
export const getMenu = (_req, res) => res.json(memoryStore.listMenu());
