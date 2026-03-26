from pathlib import Path
root = Path('/mnt/data/restaurant-order-system')

def write(rel, content):
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')

write('package.json', '''{
  "name": "restaurant-order-system",
  "private": true,
  "workspaces": ["backend", "apps/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace backend\" \"npm run dev --workspace apps/client-caisse\" \"npm run dev --workspace apps/cuisinier\" \"npm run dev --workspace apps/serveur\" \"npm run dev --workspace apps/suivi-client\"",
    "build": "npm run build --workspaces",
    "seed": "node backend/src/scripts/seed.js"
  },
  "devDependencies": {
    "concurrently": "^9.0.1"
  }
}
''')
write('.gitignore', 'node_modules\n.env\n/dist\ncoverage\n*.log\n')
write('README.md', '''# Application de gestion de commandes pour restaurant

Base de projet conforme au cahier des charges : serveur Node.js central, 4 interfaces React, synchronisation temps réel Socket.io, modèles de données pour menu/commandes/utilisateurs.

## Lancer le projet
```bash
npm install
cp backend/.env.example backend/.env
npm run dev
```

## Applications
- Client / Caisse : http://localhost:5173
- Cuisinier : http://localhost:5174
- Serveur : http://localhost:5175
- Suivi client : http://localhost:5176
- API : http://localhost:4000
''')

write('backend/package.json', '''{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "build": "echo build backend",
    "seed": "node src/scripts/seed.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.6.1",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
''')
write('backend/.env.example', 'PORT=4000\nMONGODB_URI=mongodb://localhost:27017/restaurant-orders\n')
write('backend/src/constants/orderStatus.js', '''export const ORDER_STATUS = {
  NEW: 'new',
  IN_PREPARATION: 'in_preparation',
  READY: 'ready',
  SERVED: 'served'
};
''')
write('backend/src/data/mockMenu.js', '''export const mockMenu = [
  { id: 'm1', name: 'Burger Signature', description: 'Steak, cheddar, sauce maison', price: 12.5, category: 'Burgers', available: true, image: '/images/burger.jpg' },
  { id: 'm2', name: 'Salade César', description: 'Poulet, croûtons, parmesan', price: 10.9, category: 'Salades', available: true, image: '/images/salade.jpg' },
  { id: 'm3', name: 'Pizza Margherita', description: 'Tomate, mozzarella, basilic', price: 11.5, category: 'Pizzas', available: true, image: '/images/pizza.jpg' }
];
''')
write('backend/src/store/memoryStore.js', '''import { mockMenu } from '../data/mockMenu.js';
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
''')
write('backend/src/controllers/menuController.js', "import { memoryStore } from '../store/memoryStore.js';\nexport const getMenu = (_req, res) => res.json(memoryStore.listMenu());\n")
write('backend/src/controllers/orderController.js', '''import { memoryStore } from '../store/memoryStore.js';
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
''')
write('backend/src/routes/menuRoutes.js', "import { getMenu } from '../controllers/menuController.js';\nexport const registerMenuRoutes = (app) => app.get('/api/menu', getMenu);\n")
write('backend/src/routes/orderRoutes.js', "import { createOrder, getOrderByRef, listOrders, updateOrderStatus } from '../controllers/orderController.js';\nexport const registerOrderRoutes = (app, io) => { app.get('/api/orders', listOrders); app.get('/api/orders/:ref', getOrderByRef); app.post('/api/orders', createOrder(io)); app.patch('/api/orders/:ref/status', updateOrderStatus(io)); };\n")
write('backend/src/sockets/index.js', "export const attachSocketHandlers = (io) => io.on('connection', (socket) => { console.log(`Socket connecté : ${socket.id}`); socket.on('disconnect', () => console.log(`Socket déconnecté : ${socket.id}`)); });\n")
write('backend/src/config/db.js', '''import mongoose from 'mongoose';
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try { await mongoose.connect(uri); console.log('MongoDB connecté'); }
  catch (error) { console.warn('MongoDB indisponible, mode mémoire activé.', error.message); }
}
''')
write('backend/src/server.js', '''import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDb } from './config/db.js';
import { registerMenuRoutes } from './routes/menuRoutes.js';
import { registerOrderRoutes } from './routes/orderRoutes.js';
import { attachSocketHandlers } from './sockets/index.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] } });
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
registerMenuRoutes(app);
registerOrderRoutes(app, io);
attachSocketHandlers(io);
const PORT = process.env.PORT || 4000;
connectDb().finally(() => server.listen(PORT, () => console.log(`API démarrée sur ${PORT}`)));
''')
write('backend/src/models/MenuItem.js', '''import mongoose from 'mongoose';
const menuItemSchema = new mongoose.Schema({ name: String, description: String, price: Number, category: String, available: Boolean, image: String }, { timestamps: true });
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
''')
write('backend/src/models/Order.js', '''import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({ ref: String, orderType: String, tableNumber: String, items: Array, total: Number, status: String, paid: Boolean }, { timestamps: true });
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
''')
write('backend/src/models/User.js', '''import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({ name: String, email: String, role: String, passwordHash: String }, { timestamps: true });
export const User = mongoose.models.User || mongoose.model('User', userSchema);
''')
write('backend/src/scripts/seed.js', "console.log('Seed exemple à compléter pour MongoDB.');\n")

shared_api = "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';\nexport async function fetchJson(path, options = {}) { const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options }); if (!response.ok) throw new Error(`Erreur API: ${response.status}`); return response.json(); }\nexport { API_URL };\n"
shared_socket = "import { io } from 'socket.io-client';\nimport { API_URL } from './api';\nexport const socket = io(API_URL, { autoConnect: true });\n"
shared_status = "export const statusSteps = [{ key: 'new', label: 'Commande validée' }, { key: 'in_preparation', label: 'En préparation' }, { key: 'ready', label: 'Prête' }, { key: 'served', label: 'Servie' }];\n"
write('apps/shared/src/api.js', shared_api)
write('apps/shared/src/socket.js', shared_socket)
write('apps/shared/src/orderStatus.js', shared_status)

css = ''':root { font-family: Inter, system-ui, sans-serif; color: #1f2937; background: #f6f8fb; }\n* { box-sizing: border-box; }\nbody { margin: 0; }\nmain { max-width: 1180px; margin: 0 auto; padding: 24px; }\nheader.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; }\n.card { background:#fff; border-radius:16px; padding:20px; box-shadow:0 10px 30px rgba(15,23,42,.08); }\n.grid { display:grid; gap:20px; }\n.grid-2 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }\n.badge { display:inline-flex; align-items:center; border-radius:999px; padding:6px 12px; font-size:14px; font-weight:600; }\nbutton { border:none; border-radius:10px; padding:12px 16px; font-weight:600; cursor:pointer; }\nbutton.primary { background:#111827; color:#fff; }\nbutton.warning { background:#f59e0b; color:#111827; }\nbutton.success { background:#10b981; color:#fff; }\nbutton:disabled { opacity:.5; cursor:not-allowed; }\ninput, select { width:100%; border:1px solid #d1d5db; border-radius:10px; padding:12px; }\nul.clean { list-style:none; padding:0; margin:0; }\n.order-row { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 0; border-bottom:1px solid #eef2f7; }\n.progress { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }\n.progress-step { border:1px solid #dbe3ee; border-radius:14px; padding:14px; text-align:center; background:#fff; }\n.progress-step.active { border-color:#10b981; background:#ecfdf5; }\n.small { color:#6b7280; font-size:14px; }\n'''

apps = {
    'client-caisse': {
        'port': 5173,
        'title': 'Client / Caisse',
        'app': '''import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
import { statusSteps } from '../../shared/src/orderStatus';
export default function App() {
  const [menu, setMenu] = useState([]); const [cart, setCart] = useState([]); const [createdOrder, setCreatedOrder] = useState(null); const [orderType, setOrderType] = useState('sur_place'); const [tableNumber, setTableNumber] = useState('12');
  useEffect(() => { fetchJson('/api/menu').then(setMenu); }, []);
  useEffect(() => { const sync = (order) => { if (order.ref === createdOrder?.ref) setCreatedOrder(order); }; socket.on('order:update', sync); socket.on('order:ready', sync); socket.on('order:served', sync); return () => { socket.off('order:update', sync); socket.off('order:ready', sync); socket.off('order:served', sync); }; }, [createdOrder]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  function addToCart(item) { setCart((cur) => { const e = cur.find((x) => x.id === item.id); return e ? cur.map((x) => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x) : [...cur, { ...item, quantity: 1 }]; }); }
  async function submitOrder() { const payload = { orderType, tableNumber, total, paid: true, items: cart.map((i) => ({ menuItemId: i.id, name: i.name, quantity: i.quantity, unitPrice: i.price })) }; const order = await fetchJson('/api/orders', { method: 'POST', body: JSON.stringify(payload) }); setCreatedOrder(order); setCart([]); }
  return <main><header className="page-header"><div><h1>Client / Caisse</h1><p className="small">Prise de commande, paiement simulé et suivi temps réel.</p></div><span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Rôle client</span></header><div className="grid grid-2"><section className="card"><h2>Menu</h2><div className="grid">{menu.map((item) => <article key={item.id} className="card" style={{ padding: 16, boxShadow: 'none', border: '1px solid #eef2f7' }}><h3>{item.name}</h3><p className="small">{item.description}</p><strong>{item.price.toFixed(2)} €</strong><div style={{ marginTop: 12 }}><button className="primary" onClick={() => addToCart(item)}>Ajouter</button></div></article>)}</div></section><section className="card"><h2>Commande</h2><label>Type de commande</label><select value={orderType} onChange={(e) => setOrderType(e.target.value)}><option value="sur_place">Sur place</option><option value="emporter">À emporter</option></select><div style={{ height: 12 }} /><label>Table</label><input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} /><ul className="clean" style={{ marginTop: 20 }}>{cart.map((item) => <li key={item.id} className="order-row"><span>{item.name} × {item.quantity}</span><strong>{(item.price * item.quantity).toFixed(2)} €</strong></li>)}</ul><div className="order-row"><strong>Total</strong><strong>{total.toFixed(2)} €</strong></div><button className="primary" disabled={!cart.length} onClick={submitOrder}>Payer et valider</button></section></div>{createdOrder && <section className="card" style={{ marginTop: 20 }}><h2>Suivi de la commande {createdOrder.ref}</h2><div className="progress">{statusSteps.map((step) => <div key={step.key} className={`progress-step ${statusSteps.findIndex((s) => s.key === createdOrder.status) >= statusSteps.findIndex((s) => s.key === step.key) ? 'active' : ''}`}>{step.label}</div>)}</div></section>}</main>;
}
'''
    },
    'cuisinier': {
        'port': 5174,
        'title': 'Cuisinier',
        'app': '''import { useEffect, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
export default function App() {
  const [orders, setOrders] = useState([]); const load = () => fetchJson('/api/orders').then(setOrders); useEffect(() => { load(); }, []); useEffect(() => { const reload = () => load(); socket.on('order:new', reload); socket.on('order:update', reload); socket.on('order:served', reload); return () => { socket.off('order:new', reload); socket.off('order:update', reload); socket.off('order:served', reload); }; }, []);
  async function changeStatus(ref, status) { await fetchJson(`/api/orders/${ref}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); }
  return <main><header className="page-header"><div><h1>Interface cuisinier</h1><p className="small">Réception et progression des commandes.</p></div><span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Cuisine</span></header><section className="card">{orders.map((order) => <div className="order-row" key={order.ref}><div><strong>{order.ref}</strong><div className="small">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</div></div><div style={{ display: 'flex', gap: 8 }}><button className="warning" disabled={order.status !== 'new'} onClick={() => changeStatus(order.ref, 'in_preparation')}>En préparation</button><button className="success" disabled={order.status !== 'in_preparation'} onClick={() => changeStatus(order.ref, 'ready')}>Prête</button></div></div>)}</section></main>;
}
'''
    },
    'serveur': {
        'port': 5175,
        'title': 'Serveur',
        'app': '''import { useEffect, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
export default function App() {
  const [orders, setOrders] = useState([]); const load = () => fetchJson('/api/orders').then(setOrders); useEffect(() => { load(); }, []); useEffect(() => { const reload = () => load(); socket.on('order:new', reload); socket.on('order:ready', reload); socket.on('order:update', reload); return () => { socket.off('order:new', reload); socket.off('order:ready', reload); socket.off('order:update', reload); }; }, []);
  async function markServed(ref) { await fetchJson(`/api/orders/${ref}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'served' }) }); load(); }
  return <main><header className="page-header"><div><h1>Interface serveur</h1><p className="small">Vue globale des commandes et notification des plats prêts.</p></div><span className="badge" style={{ background: '#ffedd5', color: '#9a3412' }}>Service</span></header><section className="card">{orders.map((order) => <div className="order-row" key={order.ref}><div><strong>{order.ref}</strong><div className="small">Statut : {order.status}</div></div><button className="primary" disabled={order.status !== 'ready'} onClick={() => markServed(order.ref)}>Marquer servie</button></div>)}</section></main>;
}
'''
    },
    'suivi-client': {
        'port': 5176,
        'title': 'Suivi client',
        'app': '''import { useEffect, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
import { statusSteps } from '../../shared/src/orderStatus';
export default function App() {
  const [ref, setRef] = useState('A001'); const [order, setOrder] = useState(null);
  async function search() { try { setOrder(await fetchJson(`/api/orders/${ref}`)); } catch { setOrder(null); } }
  useEffect(() => { const handler = (payload) => { if (payload.ref === ref) fetchJson(`/api/orders/${ref}`).then(setOrder).catch(() => setOrder(null)); }; socket.on('order:progress', handler); return () => socket.off('order:progress', handler); }, [ref]);
  return <main><header className="page-header"><div><h1>Suivi client</h1><p className="small">Consultation de l'avancement d'une commande en temps réel.</p></div><span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>Suivi</span></header><section className="card"><div className="grid grid-2"><div><label>Référence commande</label><input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} /></div><div style={{ display: 'flex', alignItems: 'end' }}><button className="primary" onClick={search}>Rechercher</button></div></div>{order && <div style={{ marginTop: 20 }}><h2>{order.ref}</h2><div className="progress">{statusSteps.map((step) => <div key={step.key} className={`progress-step ${statusSteps.findIndex((s) => s.key === order.status) >= statusSteps.findIndex((s) => s.key === step.key) ? 'active' : ''}`}>{step.label}</div>)}</div></div>}</section></main>;
}
'''
    }
}

for app, meta in apps.items():
    base = root / 'apps' / app
    base.mkdir(parents=True, exist_ok=True)
    write(f'apps/{app}/package.json', '{\n  "name": "%s",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite --port %s",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "socket.io-client": "^4.7.5"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.3.1",\n    "vite": "^5.4.1"\n  }\n}\n' % (app, meta['port']))
    write(f'apps/{app}/vite.config.js', "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n")
    write(f'apps/{app}/index.html', f'<!doctype html><html lang="fr"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{meta["title"]}</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>')
    write(f'apps/{app}/src/main.jsx', "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles.css';\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);\n")
    write(f'apps/{app}/src/App.jsx', meta['app'])
    write(f'apps/{app}/src/styles.css', css)

write('docs/dossier-projet.md', '''# Dossier de projet — Application de gestion de commandes pour restaurant

## Présentation
Projet full-stack destiné à gérer les commandes d'un restaurant avec plusieurs interfaces reliées en temps réel.

## Besoin métier
Fluidifier la communication entre la caisse, la cuisine, le serveur et le client final.

## Périmètre fonctionnel
- prise de commande et paiement simulé ;
- mise à jour des statuts en cuisine ;
- vue serveur sur les commandes ;
- suivi client en direct.

## Architecture technique
- React + Vite
- Node.js + Express
- Socket.io
- MongoDB / Mongoose
- mode mémoire de secours

## Données
- menu
- commandes
- utilisateurs

## Statuts
`new` → `in_preparation` → `ready` → `served`

## Compétences TP DWWM mobilisées
Front-end : maquetter, réaliser des interfaces statiques, développer des interfaces dynamiques.
Back-end : structurer les données, développer des composants d'accès aux données, développer des composants métier côté serveur.
''')
write('docs/presentation-plan.md', '1. Contexte\n2. Objectif\n3. Rôles\n4. Architecture\n5. Parcours client\n6. Cuisine\n7. Service\n8. Suivi temps réel\n9. Compétences TP DWWM\n10. Conclusion\n')
print('Generated')
