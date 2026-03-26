import { createOrder, getOrderByRef, listOrders, updateOrderStatus } from '../controllers/orderController.js';
export const registerOrderRoutes = (app, io) => { app.get('/api/orders', listOrders); app.get('/api/orders/:ref', getOrderByRef); app.post('/api/orders', createOrder(io)); app.patch('/api/orders/:ref/status', updateOrderStatus(io)); };
