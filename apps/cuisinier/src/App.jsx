import { useEffect, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
export default function App() {
  const [orders, setOrders] = useState([]); const load = () => fetchJson('/api/orders').then(setOrders); useEffect(() => { load(); }, []); useEffect(() => { const reload = () => load(); socket.on('order:new', reload); socket.on('order:update', reload); socket.on('order:served', reload); return () => { socket.off('order:new', reload); socket.off('order:update', reload); socket.off('order:served', reload); }; }, []);
  async function changeStatus(ref, status) { await fetchJson(`/api/orders/${ref}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); }
  return <main><header className="page-header"><div><h1>Interface cuisinier</h1><p className="small">Réception et progression des commandes.</p></div><span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Cuisine</span></header><section className="card">{orders.map((order) => <div className="order-row" key={order.ref}><div><strong>{order.ref}</strong><div className="small">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</div></div><div style={{ display: 'flex', gap: 8 }}><button className="warning" disabled={order.status !== 'new'} onClick={() => changeStatus(order.ref, 'in_preparation')}>En préparation</button><button className="success" disabled={order.status !== 'in_preparation'} onClick={() => changeStatus(order.ref, 'ready')}>Prête</button></div></div>)}</section></main>;
}
