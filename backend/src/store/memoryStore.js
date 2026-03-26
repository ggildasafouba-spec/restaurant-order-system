import { mockMenu } from '../data/mockMenu.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
const orders = [];
export const memoryStore = {
  listMenu: () => mockMenu,
  listOrders: () => orders,
  getOrderByRef: (ref) => orders.find((o) => o.ref === ref),
  createOrder(payload) {
    const order = {
      id: `${Date.now()}`,
      ref: `A${String(orders.length + 1).padStart(3, '0')}`,
      orderType: payload.orderType,
      tableNumber: payload.tableNumber || '',
      items: payload.items,
      total: payload.total,
      paid: payload.paid ?? true,
      status: ORDER_STATUS.NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.unshift(order);
    return order;
  },
  updateStatus(ref, status) {
    const order = orders.find((o) => o.ref === ref);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }
};
