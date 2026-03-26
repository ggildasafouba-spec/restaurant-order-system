import { getMenu } from '../controllers/menuController.js';
export const registerMenuRoutes = (app) => app.get('/api/menu', getMenu);
