import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    axios.get('\${API_BASE}`/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(() => navigate('/login'))
    .finally(() => setLoading(false))
  }, [])

  const statusColor = {
    pending:    '#f59e0b',
    processing: '#3b82f6',
    shipped:    '#8b5cf6',
    delivered:  '#22c55e',
    cancelled:  '#ef4444',
  }

  const s = {
    root:    { minHeight: '100vh', background: '#0f1923', padding: '2rem', maxWidth: '800px', margin: '0 auto' },
    nav:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    logo:    { fontFamily: 'serif', fontSize: '1.5rem', color: '#c9a96e', textDecoration: 'none' },
    title:   { fontSize: '1.8rem', fontWeight: 700, color: '#f0ede8', marginBottom: '1.5rem' },
    empty:   { textAlign: 'center', color: 'rgba(240,237,232,0.4)', padding: '4rem' },
    card:    { background: '#162032', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.2rem' },
    head:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    orderId: { fontSize: '0.9rem', color: 'rgba(240,237,232,0.5)', fontWeight: 600 },
    badge:   { padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
    item:    { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem', color: 'rgba(240,237,232,0.7)' },
    total:   { display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: 700, color: '#f0ede8' },
  }

  return (
    <div style={s.root}>
      <div style={s.nav}>
        <Link to="/" style={s.logo}>🛍 Luxe Store</Link>
        <Link to="/products" style={{ color: 'rgba(240,237,232,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to store</Link>
      </div>

      <h1 style={s.title}>My Orders</h1>

      {loading ? (
        <div style={s.empty}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <div>No orders yet.</div>
          <Link to="/products" style={{ color: '#c9a96e', textDecoration: 'none', marginTop: '1rem', display: 'block' }}>Start shopping</Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} style={s.card}>
            <div style={s.head}>
              <span style={s.orderId}>Order #{order.id} · {new Date(order.created_at).toLocaleDateString()}</span>
              <span style={{ ...s.badge, background: `${statusColor[order.status]}22`, color: statusColor[order.status] }}>
                {order.status}
              </span>
            </div>
            {order.items.map((item, i) => (
              <div key={i} style={s.item}>
                <span>{item.product_name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={s.total}>
              <span>Total</span>
              <span style={{ color: '#c9a96e' }}>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Orders