import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({ ref: String, orderType: String, tableNumber: String, items: Array, total: Number, status: String, paid: Boolean }, { timestamps: true });
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
