import axios from 'axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const [loading, setLoading]  = useState(false)
  const [message, setMessage]  = useState('')
  const navigate               = useNavigate()

  const token = localStorage.getItem('token')

  const handleCheckout = () => {
    if (!token) { navigate('/login'); return }
    if (cart.length === 0) return
    navigate('/checkout')
  }
  const s = {
    root:     { minHeight: '100vh', background: '#0f1923', padding: '2rem', maxWidth: '800px', margin: '0 auto' },
    nav:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    logo:     { fontFamily: 'serif', fontSize: '1.5rem', color: '#c9a96e', textDecoration: 'none' },
    title:    { fontSize: '1.8rem', fontWeight: 700, color: '#f0ede8', marginBottom: '1.5rem' },
    empty:    { textAlign: 'center', color: 'rgba(240,237,232,0.4)', padding: '4rem' },
    card:     { background: '#162032', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.2rem' },
    img:      { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', background: '#1e2d40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 },
    info:     { flex: 1 },
    name:     { fontSize: '1rem', fontWeight: 600, color: '#f0ede8', marginBottom: '0.3rem' },
    price:    { fontSize: '0.9rem', color: '#c9a96e' },
    qtyRow:   { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' },
    qtyBtn:   { width: '28px', height: '28px', background: 'rgba(255,255,255,0.08)', color: '#f0ede8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
    qtyNum:   { color: '#f0ede8', fontWeight: 600, minWidth: '24px', textAlign: 'center' },
    removeBtn:{ background: 'transparent', border: 'none', color: 'rgba(240,237,232,0.3)', cursor: 'pointer', fontSize: '1.2rem' },
    summary:  { background: '#162032', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginTop: '1.5rem' },
    row:      { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'rgba(240,237,232,0.6)', fontSize: '0.95rem' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, color: '#f0ede8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.5rem' },
    checkBtn: { width: '100%', padding: '0.95rem', background: '#c9a96e', color: '#0f1923', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '1.2rem' },
    msg:      { background: 'rgba(45,106,79,0.2)', border: '1px solid rgba(45,106,79,0.4)', borderRadius: '10px', padding: '1rem', color: '#4ade80', textAlign: 'center', marginTop: '1rem' },
  }

  return (
    <div style={s.root}>
      <div style={s.nav}>
        <Link to="/" style={s.logo}>🛍 Luxe Store</Link>
        <Link to="/products" style={{ color: 'rgba(240,237,232,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>← Continue shopping</Link>
      </div>

      <h1 style={s.title}>Your Cart</h1>

      {message && <div style={s.msg}>{message}</div>}

      {cart.length === 0 && !message ? (
        <div style={s.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <div>Your cart is empty.</div>
          <Link to="/products" style={{ color: '#c9a96e', textDecoration: 'none', marginTop: '1rem', display: 'block' }}>Browse products</Link>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={s.card}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} style={{ ...s.img, fontSize: undefined }} />
                : <div style={s.img}>📦</div>
              }
              <div style={s.info}>
                <div style={s.name}>{item.name}</div>
                <div style={s.price}>${Number(item.price).toFixed(2)} each</div>
                <div style={s.qtyRow}>
                  <button style={s.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span style={s.qtyNum}>{item.quantity}</span>
                  <button style={s.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  <span style={{ color: '#c9a96e', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                    = ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              <button style={s.removeBtn} onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}

          <div style={s.summary}>
            <div style={s.row}><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div style={s.row}><span>Shipping</span><span>Free</span></div>
            <div style={s.totalRow}><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
            <button style={s.checkBtn} onClick={handleCheckout} disabled={loading || cart.length === 0}>
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart