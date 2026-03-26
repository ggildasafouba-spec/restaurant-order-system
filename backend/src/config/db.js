import mongoose from 'mongoose';
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try { await mongoose.connect(uri); console.log('MongoDB connecté'); }
  catch (error) { console.warn('MongoDB indisponible, mode mémoire activé.', error.message); }
}
