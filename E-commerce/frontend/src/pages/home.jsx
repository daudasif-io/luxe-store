import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useCart } from '../context/cartcontext'
import '../index.css'

function Home() {
  const [status, setStatus]   = useState('')
  const [scrolled, setScrolled] = useState(false)
  const { totalItems }        = useCart()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    axios.get('\${API_BASE}`/').then(r => setStatus(r.data.message)).catch(() => {})
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 4rem', height: '72px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,12,16,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.02em' }}>
          LUXE
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/products" style={{ color: 'var(--text-mid)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.04em', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-mid)'}>
            SHOP
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" style={{ color: 'var(--text-mid)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.04em' }}>
              ADMIN
            </Link>
          )}
          <Link to="/cart" style={{ color: 'var(--text-mid)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.04em', position: 'relative' }}>
            BAG {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--gold)', color: '#080c10', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-soft)', padding: '0.4rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Outfit,sans-serif' }}>
              SIGN OUT
            </button>
          ) : (
            <Link to="/login" style={{ background: 'var(--gold)', color: '#080c10', padding: '0.5rem 1.4rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              SIGN IN
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 2rem', position: 'relative' }}>

        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Floating lines decoration */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: '1px', height: '120px', background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.4), transparent)' }} />
        <div style={{ position: 'absolute', top: '25%', right: '8%', width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.3), transparent)' }} />

        <div style={{ animation: 'fadeUp 0.8s ease both' }}>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 500 }}>
            Curated luxury — 2026 collection
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(4rem,10vw,8rem)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: '2.5rem', color: 'var(--text)' }}>
            Discover<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Extraordinary</em><br />
            Things
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '440px', margin: '0 auto 3rem', lineHeight: 1.8, fontWeight: 300 }}>
            A carefully curated selection of premium products for people who appreciate quality without compromise.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{ padding: '0.95rem 2.5rem', background: 'var(--gold)', color: '#080c10', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}>
              Explore Collection
            </Link>
            {!user && (
              <Link to="/register" style={{ padding: '0.95rem 2.5rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Join Luxe
              </Link>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-soft)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          <span>Scroll</span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(201,169,110,0.5), transparent)' }} />
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2.5rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center', gap: '2rem', background: 'var(--bg2)' }}>
        {[['10,000+','Satisfied customers'],['500+','Premium products'],['99%','Quality guarantee'],['2–3 days','Express delivery']].map(([n,l],i) => (
          <div key={i}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '0.3rem' }}>{n}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section style={{ padding: '6rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>Why Luxe</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, color: 'var(--text)' }}>The Luxe Difference</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5px', background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            ['◈','Hand-picked quality','Every product passes our rigorous quality check before being listed.'],
            ['◎','Free global shipping','Complimentary shipping on all orders above $50. No exceptions.'],
            ['◇','Secure & private','Bank-level encryption on every transaction. Your data stays yours.'],
            ['○','30-day returns','Not satisfied? Return anything within 30 days, no questions asked.'],
          ].map(([icon,title,desc],i) => (
            <div key={i} style={{ background: 'var(--bg2)', padding: '3rem 2.5rem', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}>
              <div style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.2rem' }}>{icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>{title}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.75 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Limited time</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 400, marginBottom: '1.5rem', color: 'var(--text)' }}>
          Start your Luxe journey<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>today.</em>
        </h2>
        <Link to={user ? '/products' : '/register'} style={{ display: 'inline-block', padding: '1rem 3rem', background: 'var(--gold)', color: '#080c10', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {user ? 'Shop Now' : 'Create Free Account'}
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 4rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', color: 'var(--gold)' }}>LUXE</span>
        <span>© 2026 Luxe Store. All rights reserved.</span>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          nav { padding: 0 1.5rem !important; }
          section { padding: 3rem 1.5rem !important; }
        }
      `}</style>
    </div>
  )
}

export default Home