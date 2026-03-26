import { useEffect, useState } from 'react';
import { fetchJson } from '../../shared/src/api';
import { socket } from '../../shared/src/socket';
import { statusSteps } from '../../shared/src/orderStatus';
export default function App() {
  const [ref, setRef] = useState('A001'); const [order, setOrder] = useState(null);
  async function search() { try { setOrder(await fetchJson(`/api/orders/${ref}`)); } catch { setOrder(null); } }
  useEffect(() => { const handler = (payload) => { if (payload.ref === ref) fetchJson(`/api/orders/${ref}`).then(setOrder).catch(() => setOrder(null)); }; socket.on('order:progress', handler); return () => socket.off('order:progress', handler); }, [ref]);
  return <main><header className="page-header"><div><h1>Suivi client</h1><p className="small">Consultation de l'avancement d'une commande en temps réel.</p></div><span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>Suivi</span></header><section className="card"><div className="grid grid-2"><div><label>Référence commande</label><input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} /></div><div style={{ display: 'flex', alignItems: 'end' }}><button className="primary" onClick={search}>Rechercher</button></div></div>{order && <div style={{ marginTop: 20 }}><h2>{order.ref}</h2><div className="progress">{statusSteps.map((step) => <div key={step.key} className={`progress-step ${statusSteps.findIndex((s) => s.key === order.status) >= statusSteps.findIndex((s) => s.key === step.key) ? 'active' : ''}`}>{step.label}</div>)}</div></div>}</section></main>;
}
