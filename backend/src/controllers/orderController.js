import { memoryStore } from '../store/memoryStore.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
const emitProgress = (io, order, eventName = 'order:update') => {
  io.emit(eventName, order);
  io.emit('order:progress', { ref: order.ref, status: order.status, updatedAt: order.updatedAt });
};
export const listOrders = (_req, res) => res.json(memoryStore.listOrders());
export const getOrderByRef = (req, res) => {
  const order = memoryStore.getOrderByRef(req.params.ref);
  return order ? res.json(order) : res.status(404).json({ message: 'Commande introuvable' });
};
export const createOrder = (io) => (req, res) => {
  const order = memoryStore.createOrder(req.body);
  io.emit('order:new', order);
  emitProgress(io, order);
  res.status(201).json(order);
};
export const updateOrderStatus = (io) => (req, res) => {
  const { status } = req.body;
  if (!Object.values(ORDER_STATUS).includes(status)) return res.status(400).json({ message: 'Statut invalide' });
  const order = memoryStore.updateStatus(req.params.ref, status);
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  if (status === ORDER_STATUS.READY) emitProgress(io, order, 'order:ready');
  else if (status === ORDER_STATUS.SERVED) emitProgress(io, order, 'order:served');
  else emitProgress(io, order);
  res.json(order);
};
