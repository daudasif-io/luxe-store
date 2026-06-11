import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import API_BASE from '../api';
const API = API_BASE
const statusColors = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#8b5cf6',
  delivered:  '#22c55e',
  cancelled:  '#ef4444',
}

function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [orders, setOrders]   = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('overview')
  const navigate              = useNavigate()

  const token   = localStorage.getItem('token')
  const user    = JSON.parse(localStorage.getItem('user') || 'null')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    Promise.all([
      axios.get(`${API}/stats`,  { headers }),
      axios.get(`${API}/orders`, { headers }),
      axios.get(`${API}/users`,  { headers }),
    ]).then(([s, o, u]) => {
      setStats(s.data)
      setOrders(o.data)
      setUsers(u.data)
    }).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, status) => {
    await axios.put(`${API}/orders/${orderId}/status`, { status }, { headers })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    if (stats) {
      const updated = await axios.get(`${API}/stats`, { headers })
      setStats(updated.data)
    }
  }

  const s = {
    root:      { minHeight: '100vh', background: '#0f1923', color: '#f0ede8', fontFamily: 'sans-serif' },
    sidebar:   { width: '220px', background: '#0a1520', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 1rem', position: 'fixed', top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    main:      { marginLeft: '220px', padding: '2rem' },
    logo:      { fontFamily: 'serif', fontSize: '1.3rem', color: '#c9a96e', padding: '0 0.5rem', marginBottom: '1.5rem', display: 'block', textDecoration: 'none' },
    navItem:   { padding: '0.65rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, border: 'none', background: 'transparent', color: 'rgba(240,237,232,0.5)', textAlign: 'left', width: '100%', transition: 'all 0.2s' },
    navActive: { background: 'rgba(201,169,110,0.12)', color: '#c9a96e' },
    heading:   { fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem' },
    grid4:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard:  { background: '#162032', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.4rem' },
    statVal:   { fontSize: '2rem', fontWeight: 700, color: '#c9a96e', marginBottom: '0.3rem' },
    statLabel: { fontSize: '0.82rem', color: 'rgba(240,237,232,0.45)', fontWeight: 500 },
    card:      { background: '#162032', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' },
    cardTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#f0ede8' },
    table:     { width: '100%', borderCollapse: 'collapse' },
    th:        { textAlign: 'left', padding: '0.6rem 0.8rem', fontSize: '0.75rem', color: 'rgba(240,237,232,0.35)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    td:        { padding: '0.8rem', fontSize: '0.88rem', color: 'rgba(240,237,232,0.8)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    badge:     { padding: '0.2rem 0.65rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 },
    select:    { background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f0ede8', padding: '0.3rem 0.5rem', fontSize: '0.82rem', cursor: 'pointer' },
  }

  if (loading) return <div style={{ ...s.root, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'rgba(240,237,232,0.4)' }}>Loading dashboard...</div>

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'orders',   label: '📦 Orders' },
    { key: 'users',    label: '👥 Users' },
  ]

  return (
    <div style={s.root}>

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <Link to="/" style={s.logo}>🛍 Luxe Store</Link>
        {tabs.map(t => (
          <button key={t.key} style={{ ...s.navItem, ...(tab === t.key ? s.navActive : {}) }}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <Link to="/admin/products" style={{ ...s.navItem, display: 'block', textDecoration: 'none', color: 'rgba(240,237,232,0.5)' }}>
            🛒 Products
          </Link>
          <Link to="/products" style={{ ...s.navItem, display: 'block', textDecoration: 'none', color: 'rgba(240,237,232,0.5)', marginTop: '0.4rem' }}>
            ← Back to store
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            <h1 style={s.heading}>Dashboard Overview</h1>

            {/* STAT CARDS */}
            <div style={s.grid4}>
              {[
                { label: 'Total Revenue',  value: `$${Number(stats.total_revenue).toFixed(2)}` },
                { label: 'Total Orders',   value: stats.total_orders },
                { label: 'Total Users',    value: stats.total_users },
                { label: 'Total Products', value: stats.total_products },
              ].map((c, i) => (
                <div key={i} style={s.statCard}>
                  <div style={s.statVal}>{c.value}</div>
                  <div style={s.statLabel}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* CHART */}
            <div style={s.card}>
              <div style={s.cardTitle}>Orders by status</div>
              {stats.status_data.length === 0 ? (
                <p style={{ color: 'rgba(240,237,232,0.35)', fontSize: '0.9rem' }}>No orders yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.status_data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="status" stroke="rgba(240,237,232,0.3)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="rgba(240,237,232,0.3)" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#162032', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0ede8' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.status_data.map((entry, i) => (
                        <Cell key={i} fill={statusColors[entry.status] || '#c9a96e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* RECENT ORDERS */}
            <div style={s.card}>
              <div style={s.cardTitle}>Recent orders</div>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map(o => (
                    <tr key={o.id}>
                      <td style={s.td}>#{o.id}</td>
                      <td style={s.td}>{o.user}</td>
                      <td style={s.td}>${Number(o.total).toFixed(2)}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: `${statusColors[o.status]}22`, color: statusColors[o.status] }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={s.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <>
            <h1 style={s.heading}>All Orders ({orders.length})</h1>
            <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={s.td}>#{o.id}</td>
                      <td style={s.td}>{o.user}</td>
                      <td style={s.td}>{o.email}</td>
                      <td style={s.td}>{o.item_count}</td>
                      <td style={s.td}>${Number(o.total).toFixed(2)}</td>
                      <td style={s.td}>
                        <select style={s.select} value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}>
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                      <td style={s.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <>
            <h1 style={s.heading}>All Users ({users.length})</h1>
            <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Name', 'Email', 'Role', 'Joined'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}>#{u.id}</td>
                      <td style={s.td}>{u.name}</td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          background: u.role === 'admin' ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.06)',
                          color:      u.role === 'admin' ? '#c9a96e' : 'rgba(240,237,232,0.5)',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard