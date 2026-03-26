import { useEffect, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
export default function App() {
  const [orders, setOrders] = useState([]); const load = () => fetchJson('/api/orders').then(setOrders); useEffect(() => { load(); }, []); useEffect(() => { const reload = () => load(); socket.on('order:new', reload); socket.on('order:ready', reload); socket.on('order:update', reload); return () => { socket.off('order:new', reload); socket.off('order:ready', reload); socket.off('order:update', reload); }; }, []);
  async function markServed(ref) { await fetchJson(`/api/orders/${ref}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'served' }) }); load(); }
  return <main><header className="page-header"><div><h1>Interface serveur</h1><p className="small">Vue globale des commandes et notification des plats prêts.</p></div><span className="badge" style={{ background: '#ffedd5', color: '#9a3412' }}>Service</span></header><section className="card">{orders.map((order) => <div className="order-row" key={order.ref}><div><strong>{order.ref}</strong><div className="small">Statut : {order.status}</div></div><button className="primary" disabled={order.status !== 'ready'} onClick={() => markServed(order.ref)}>Marquer servie</button></div>)}</section></main>;
}
