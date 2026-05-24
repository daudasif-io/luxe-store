import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../index.css'

const PER_PAGE = 12

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('newest')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage]         = useState(1)
  const [added, setAdded]       = useState({})
  const [scrolled, setScrolled] = useState(false)
  const { addToCart, totalItems } = useCart()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    axios.get('http://localhost:5000/api/products/')
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (search)   list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    if (maxPrice) list = list.filter(p => p.price <= parseFloat(maxPrice))
    if (sortBy === 'price-low')  list.sort((a,b) => a.price - b.price)
    if (sortBy === 'price-high') list.sort((a,b) => b.price - a.price)
    if (sortBy === 'name')       list.sort((a,b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, maxPrice, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1800)
  }

  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleSort   = (val) => { setSortBy(val);  setPage(1) }
  const handlePrice  = (val) => { setMaxPrice(val); setPage(1) }

  const inp = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)',
    padding: '0.65rem 1rem', fontSize: '0.88rem',
    outline: 'none', fontFamily: 'Outfit,sans-serif',
    transition: 'border-color 0.2s'
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 3rem', height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,12,16,0.97)' : 'var(--bg2)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.3s'
      }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>LUXE</Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" style={{ color: 'var(--text-soft)', fontSize: '0.85rem', letterSpacing: '0.04em' }}>ADMIN</Link>
          )}
          <Link to="/orders" style={{ color: 'var(--text-soft)', fontSize: '0.85rem', letterSpacing: '0.04em' }}>ORDERS</Link>
          <Link to="/cart" style={{ position: 'relative', padding: '0.5rem 1.2rem', background: 'var(--gold)', color: '#080c10', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>
            BAG {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Our collection</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 400, color: 'var(--text)', marginBottom: '0.5rem' }}>All Products</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{filtered.length} products {search && `for "${search}"`}</p>
        </div>

        {/* FILTERS BAR */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', padding: '1.2rem 1.5rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <input
            style={{ ...inp, flex: 1, minWidth: '200px' }}
            placeholder="Search products..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <input
            style={{ ...inp, width: '150px' }}
            type="number" placeholder="Max price $"
            value={maxPrice}
            onChange={e => handlePrice(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <select
            style={{ ...inp, cursor: 'pointer' }}
            value={sortBy}
            onChange={e => handleSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
            <option value="name">Name A–Z</option>
          </select>
          {(search || maxPrice) && (
            <button onClick={() => { setSearch(''); setMaxPrice(''); setPage(1) }}
              style={{ ...inp, cursor: 'pointer', color: 'var(--text-soft)', background: 'transparent', border: '1px solid var(--border)' }}>
              Clear ✕
            </button>
          )}
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-soft)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem' }}>Loading collection...</div>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-soft)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', marginBottom: '1rem', color: 'var(--text)' }}>No products found</div>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {paginated.map((p, i) => (
              <div key={p.id}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.3s', animation: `fadeUp 0.5s ${i*0.05}s ease both` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-gold)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

                {/* Clicking image or name goes to detail page */}
                <Link to={`/products/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>

                  {/* IMAGE */}
                  <div style={{ position: 'relative', height: '220px', background: 'var(--bg3)', overflow: 'hidden' }}>
                    {p.image_url
                      ? <img src={p.image_url.startsWith('http') ? p.image_url : `http://localhost:5000${p.image_url}`} alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'none'} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', opacity: 0.4 }}>◈</div>
                    }
                    {p.stock === 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,12,16,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', color: 'var(--text-soft)', textTransform: 'uppercase', border: '1px solid var(--border)', padding: '0.4rem 1rem', borderRadius: '50px' }}>Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* NAME + RATING + DESC */}
                  <div style={{ padding: '1.4rem 1.4rem 0' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.4rem' }}>{p.name}</div>

                    {/* Star rating on card */}
                    {p.avg_rating > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{ fontSize: '11px', color: n <= Math.round(p.avg_rating) ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
                        ))}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>({p.review_count})</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: '0.5rem' }}>No reviews yet</div>
                    )}

                    <div style={{ fontSize: '0.83rem', color: 'var(--text-soft)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                      {p.description || 'Premium quality product'}
                    </div>
                  </div>
                </Link>

                {/* PRICE + ADD TO BAG — outside link so button click doesnt navigate */}
                <div style={{ padding: '0 1.4rem 1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--gold)' }}>
                      ${Number(p.price).toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: p.stock > 0 ? 'rgba(34,197,94,0.7)' : 'var(--text-soft)', letterSpacing: '0.05em' }}>
                      {p.stock > 0 ? `${p.stock} left` : 'Out of stock'}
                    </span>
                  </div>
                  <button
                    onClick={e => handleAddToCart(e, p)}
                    disabled={p.stock === 0}
                    style={{
                      width: '100%', padding: '0.75rem',
                      border: added[p.id] ? 'none' : '1px solid var(--border)',
                      borderRadius: '8px',
                      background: added[p.id] ? 'rgba(34,197,94,0.15)' : 'transparent',
                      color: added[p.id] ? 'var(--green)' : 'var(--text-mid)',
                      fontSize: '0.85rem', fontWeight: 500,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', fontFamily: 'Outfit,sans-serif'
                    }}
                    onMouseEnter={e => { if (!added[p.id] && p.stock > 0) { e.target.style.background = 'var(--gold)'; e.target.style.color = '#080c10'; e.target.style.borderColor = 'var(--gold)' }}}
                    onMouseLeave={e => { if (!added[p.id]) { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-mid)'; e.target.style.borderColor = 'var(--border)' }}}>
                    {added[p.id] ? '✓ Added to bag' : 'Add to Bag'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '2rem' }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: '8px', cursor: page===1 ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: page===1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_,i) => i+1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: '40px', height: '40px', background: page===n ? 'var(--gold)' : 'transparent', border: `1px solid ${page===n ? 'var(--gold)' : 'var(--border)'}`, color: page===n ? '#080c10' : 'var(--text-mid)', borderRadius: '8px', cursor: 'pointer', fontWeight: page===n ? 700 : 400, fontFamily: 'Outfit,sans-serif' }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-mid)', borderRadius: '8px', cursor: page===totalPages ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: page===totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Products