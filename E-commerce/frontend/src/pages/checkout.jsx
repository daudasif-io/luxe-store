import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../index.css'

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()
  const token                 = localStorage.getItem('token')
  const user                  = JSON.parse(localStorage.getItem('user') || 'null')

  const [shipping, setShipping] = useState({
    fullName: user?.name || '', email: '', address: '',
    city: '', country: 'Pakistan', zip: ''
  })
  const [card, setCard] = useState({
    number: '', name: '', expiry: '', cvc: ''
  })
  const [processing, setProcessing] = useState(false)

  const formatCard = val => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16)
    return cleaned.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = val => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length >= 2) return cleaned.slice(0,2) + '/' + cleaned.slice(2)
    return cleaned
  }

  const handleShippingChange = e =>
    setShipping({ ...shipping, [e.target.name]: e.target.value })

  const handleCardChange = (e) => {
    let val = e.target.value
    if (e.target.name === 'number') val = formatCard(val)
    if (e.target.name === 'expiry') val = formatExpiry(val)
    if (e.target.name === 'cvc')    val = val.replace(/\D/g, '').slice(0,3)
    setCard({ ...card, [e.target.name]: val })
  }

  const handlePlaceOrder = async () => {
    if (!token) { navigate('/login'); return }
    setProcessing(true); setError('')

    await new Promise(r => setTimeout(r, 2000))

    try {
      const items = cart.map(i => ({ id: i.id, quantity: i.quantity }))
      const res   = await axios.post(
        'http://localhost:5000/api/orders/',
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      clearCart()
      setOrderId(res.data.order_id)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally { setProcessing(false) }
  }

  const inp = {
    width: '100%', padding: '0.8rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)',
    fontSize: '0.92rem', outline: 'none',
    fontFamily: 'Outfit,sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }
  const focusInp  = e => e.target.style.borderColor = 'var(--gold)'
  const blurInp   = e => e.target.style.borderColor = 'var(--border)'

  const label = {
    display: 'block', fontSize: '0.75rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--text-soft)', marginBottom: '0.4rem',
  }

  const s = {
    root:    { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Outfit,sans-serif' },
    nav:     { padding: '0 3rem', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' },
    logo:    { fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' },
    inner:   { maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' },
    left:    { },
    right:   { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', position: 'sticky', top: '5rem' },
    card:    { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '1.5rem' },
    title:   { fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' },
    stepNum: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 },
    grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    btnGold: { padding: '0.9rem 2rem', background: 'var(--gold)', color: '#080c10', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'Outfit,sans-serif', transition: 'background 0.2s' },
    btnBack: { padding: '0.9rem 1.5rem', background: 'transparent', color: 'var(--text-soft)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', marginRight: '0.75rem' },
  }

  if (cart.length === 0 && step !== 3) {
    return (
      <div style={{ ...s.root, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', marginBottom: '1rem' }}>Your bag is empty</div>
          <Link to="/products" style={{ color: 'var(--gold)' }}>Continue shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>

      {/* NAV */}
      <nav style={s.nav}>
        <Link to="/" style={s.logo}>LUXE</Link>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
          {['Shipping', 'Payment', 'Confirmation'].map((st, i) => (
            <span key={i} style={{ color: step === i+1 ? 'var(--gold)' : step > i+1 ? 'var(--green)' : 'var(--text-soft)', fontWeight: step === i+1 ? 600 : 400, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {step > i+1 ? '✓' : i+1}. {st}
            </span>
          ))}
        </div>
        <Link to="/cart" style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>← Back to bag</Link>
      </nav>

      {/* STEP 3 — SUCCESS */}
      {step === 3 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', padding: '2rem' }}>
          <div style={{ ...s.card, maxWidth: '520px', width: '100%', textAlign: 'center', padding: '4rem 3rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2rem' }}>✓</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.5rem', fontWeight: 400, marginBottom: '1rem' }}>Order Confirmed!</h1>
            <p style={{ color: 'var(--text-soft)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Thank you for your order. We will process it and update the status shortly.
            </p>
            {orderId && (
              <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>Order #{orderId}</span>
                <span style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif" }}>${totalPrice.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/orders" style={{ padding: '0.85rem 1.8rem', background: 'var(--gold)', color: '#080c10', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem' }}>View Orders</Link>
              <Link to="/products" style={{ padding: '0.85rem 1.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-soft)', borderRadius: '50px', fontSize: '0.9rem' }}>Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1 + 2 layout */}
      {step !== 3 && (
        <div style={s.inner}>
          <div style={s.left}>

            {/* STEP 1 — SHIPPING */}
            {step === 1 && (
              <div style={s.card}>
                <div style={s.title}>
                  <span style={{ ...s.stepNum, background: 'var(--gold)', color: '#080c10' }}>1</span>
                  Shipping Information
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={label}>Full name</label>
                  <input style={inp} name="fullName" value={shipping.fullName} onChange={handleShippingChange} placeholder="John Doe" onFocus={focusInp} onBlur={blurInp} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={label}>Email address</label>
                  <input style={inp} name="email" type="email" value={shipping.email} onChange={handleShippingChange} placeholder="you@example.com" onFocus={focusInp} onBlur={blurInp} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={label}>Street address</label>
                  <input style={inp} name="address" value={shipping.address} onChange={handleShippingChange} placeholder="123 Main Street" onFocus={focusInp} onBlur={blurInp} required />
                </div>
                <div style={{ ...s.grid2, marginBottom: '1rem' }}>
                  <div>
                    <label style={label}>City</label>
                    <input style={inp} name="city" value={shipping.city} onChange={handleShippingChange} placeholder="Lahore" onFocus={focusInp} onBlur={blurInp} />
                  </div>
                  <div>
                    <label style={label}>ZIP / Postal code</label>
                    <input style={inp} name="zip" value={shipping.zip} onChange={handleShippingChange} placeholder="54000" onFocus={focusInp} onBlur={blurInp} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={label}>Country</label>
                  <select style={{ ...inp, cursor: 'pointer' }} name="country" value={shipping.country} onChange={handleShippingChange} onFocus={focusInp} onBlur={blurInp}>
                    {['Pakistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'UAE', 'Saudi Arabia', 'India'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button style={s.btnGold} onClick={() => {
                  if (!shipping.fullName || !shipping.email || !shipping.address) { setError('Please fill in all required fields'); return }
                  setError(''); setStep(2)
                }}
                  onMouseEnter={e => e.target.style.background = 'var(--gold-light)'}
                  onMouseLeave={e => e.target.style.background = 'var(--gold)'}>
                  Continue to Payment →
                </button>
                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}
              </div>
            )}

            {/* STEP 2 — PAYMENT */}
            {step === 2 && (
              <div style={s.card}>
                <div style={s.title}>
                  <span style={{ ...s.stepNum, background: 'var(--gold)', color: '#080c10' }}>2</span>
                  Payment Details
                </div>

                {/* Fake card UI */}
                <div style={{ background: 'linear-gradient(135deg, #1a2535, #0d1520)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden', minHeight: '160px' }}>
                  <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(201,169,110,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: '-40px', left: '30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(201,169,110,0.05)' }} />
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '1.5rem', position: 'relative' }}>LUXE</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.2em', color: 'rgba(240,237,232,0.7)', marginBottom: '1.2rem', position: 'relative' }}>
                    {card.number || '•••• •••• •••• ••••'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Card holder</div>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(240,237,232,0.7)' }}>{card.name || 'YOUR NAME'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Expires</div>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(240,237,232,0.7)' }}>{card.expiry || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={label}>Card number</label>
                  <input style={{ ...inp, fontFamily: 'monospace', letterSpacing: '0.1em' }} name="number" value={card.number} onChange={handleCardChange} placeholder="1234 5678 9012 3456" onFocus={focusInp} onBlur={blurInp} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={label}>Cardholder name</label>
                  <input style={inp} name="name" value={card.name} onChange={e => setCard({...card, name: e.target.value})} placeholder="John Doe" onFocus={focusInp} onBlur={blurInp} />
                </div>
                <div style={{ ...s.grid2, marginBottom: '1.5rem' }}>
                  <div>
                    <label style={label}>Expiry date</label>
                    <input style={inp} name="expiry" value={card.expiry} onChange={handleCardChange} placeholder="MM/YY" onFocus={focusInp} onBlur={blurInp} />
                  </div>
                  <div>
                    <label style={label}>CVC</label>
                    <input style={{ ...inp, fontFamily: 'monospace', letterSpacing: '0.2em' }} name="cvc" value={card.cvc} onChange={handleCardChange} placeholder="•••" onFocus={focusInp} onBlur={blurInp} />
                  </div>
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <button style={s.btnBack} onClick={() => setStep(1)}>← Back</button>
                  <button style={{ ...s.btnGold, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={handlePlaceOrder}
                    disabled={processing || !card.number || !card.name || !card.expiry || !card.cvc}
                    onMouseEnter={e => { if (!processing) e.currentTarget.style.background = 'var(--gold-light)' }}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}>
                    {processing ? (
                      <>
                        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #080c10', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Processing payment...
                      </>
                    ) : (
                      <>🔒 Pay ${totalPrice.toFixed(2)}</>
                    )}
                  </button>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span>🔒</span> Your payment information is encrypted and secure
                </div>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div style={s.right}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              Order Summary
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--bg3)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image_url
                      ? <img src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0.4 }}>◈</div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-soft)', marginBottom: '0.6rem' }}>
                <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-soft)', marginBottom: '1rem' }}>
                <span>Shipping</span><span style={{ color: 'var(--green)' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .checkout-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default Checkout