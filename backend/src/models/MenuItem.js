import mongoose from 'mongoose';
const menuItemSchema = new mongoose.Schema({ name: String, description: String, price: Number, category: String, available: Boolean, image: String }, { timestamps: true });
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
