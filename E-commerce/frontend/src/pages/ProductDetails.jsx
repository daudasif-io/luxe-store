import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../index.css'

import API_BASE from '../api';
const API = API_BASE 

function Stars({ rating, size = 16, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          style={{
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default',
            color: n <= (interactive ? hovered || rating : rating) ? '#f59e0b' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.15s, transform 0.15s',
            display: 'inline-block',
            transform: interactive && n <= hovered ? 'scale(1.2)' : 'scale(1)'
          }}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(n)}>
          ★
        </span>
      ))}
    </div>
  )
}

function ProductDetail() {
  const { id }                      = useParams()
  console.log('Product ID:', id)
  const [product, setProduct]       = useState(null)
  const [reviews, setReviews]       = useState([])
  const [avgRating, setAvgRating]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [added, setAdded]           = useState(false)
  const [rating, setRating]         = useState(0)
  const [comment, setComment]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg]   = useState({ text: '', type: '' })
  const { addToCart }               = useCart()
  const navigate                    = useNavigate()
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get(`${API}/api/products/${id}`),
      axios.get(`${API}/api/reviews/${id}`)
    ]).then(([p, r]) => {
      setProduct(p.data)
      setReviews(r.data.reviews)
      setAvgRating(r.data.avg_rating)
    }).catch(() => navigate('/products'))
    .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleSubmitReview = async e => {
    e.preventDefault()
    if (!token) { navigate('/login'); return }
    if (rating === 0) { setReviewMsg({ text: 'Please select a star rating first', type: 'error' }); return }
    setSubmitting(true); setReviewMsg({ text: '', type: '' })
    try {
      const res = await axios.post(
        `${API}/api/reviews/${id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const newReview = { ...res.data }
      setReviews(prev => [newReview, ...prev])
      const allRatings = [newReview, ...reviews].map(r => r.rating)
      const newAvg = allRatings.reduce((a,b) => a+b, 0) / allRatings.length
      setAvgRating(Math.round(newAvg * 10) / 10)
      setRating(0); setComment('')
      setReviewMsg({ text: 'Your review has been submitted! Thank you.', type: 'success' })
    } catch (err) {
      setReviewMsg({ text: err.response?.data?.error || 'Could not submit review', type: 'error' })
    } finally { setSubmitting(false) }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return
    try {
      await axios.delete(`${API}/api/reviews/${reviewId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updated = reviews.filter(r => r.id !== reviewId)
      setReviews(updated)
      if (updated.length > 0) {
        const newAvg = updated.reduce((s,r) => s+r.rating, 0) / updated.length
        setAvgRating(Math.round(newAvg * 10) / 10)
      } else {
        setAvgRating(0)
      }
    } catch {}
  }

  const imgSrc = product?.image_url
    ? (product.image_url.startsWith('http') ? product.image_url : `${API}${product.image_url}`)
    : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: 'var(--text-soft)' }}>
      Loading...
    </div>
  )

  if (!product) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Outfit,sans-serif' }}>

      {/* NAV */}
      <nav style={{ padding: '0 3rem', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>LUXE</Link>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/products" style={{ color: 'var(--text-soft)' }}>Products</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </div>
        <Link to="/products" style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* PRODUCT SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '5rem' }}>

          {/* LEFT — Image */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imgSrc
              ? <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ fontSize: '6rem', opacity: 0.15, fontFamily: "'Cormorant Garamond',serif" }}>◈</div>
            }
          </div>

          {/* RIGHT — Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
              Premium Collection
            </span>

            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Stars rating={Math.round(avgRating)} size={18} />
              <span style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem' }}>
                {avgRating > 0 ? avgRating : '—'}
              </span>
              <span style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                {reviews.length > 0 ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
              </span>
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>
              ${Number(product.price).toFixed(2)}
            </div>

            <p style={{ color: 'var(--text-soft)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2rem' }}>
              {product.description || 'A premium quality product from our curated collection.'}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: '2rem', padding: '1.2rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                Availability
                <span style={{ display: 'block', color: product.stock > 0 ? 'var(--green)' : '#ef4444', fontWeight: 500, marginTop: '0.2rem' }}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                Shipping
                <span style={{ display: 'block', color: 'var(--text)', fontWeight: 500, marginTop: '0.2rem' }}>Free worldwide</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                Returns
                <span style={{ display: 'block', color: 'var(--text)', fontWeight: 500, marginTop: '0.2rem' }}>30 days</span>
              </div>
            </div>

            {/* Buttons */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{ width: '100%', padding: '1rem', marginBottom: '1rem', background: added ? 'rgba(34,197,94,0.15)' : 'var(--gold)', color: added ? 'var(--green)' : '#080c10', border: added ? '1px solid rgba(34,197,94,0.3)' : 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', transition: 'all 0.3s' }}>
              {added ? '✓ Added to Bag' : product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>

            <button
              onClick={() => { if (product.stock > 0) { addToCart(product); navigate('/checkout') }}}
              disabled={product.stock === 0}
              style={{ width: '100%', padding: '1rem', background: 'transparent', color: 'var(--text-mid)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (product.stock > 0) { e.target.style.background = 'var(--bg3)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border)' }}>
              Buy Now
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>What customers say</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.5rem', fontWeight: 400 }}>Reviews & Ratings</h2>
            </div>
            {avgRating > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '3.5rem', color: 'var(--gold)', lineHeight: 1 }}>{avgRating}</div>
                <Stars rating={Math.round(avgRating)} size={20} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.3rem' }}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
              </div>
            )}
          </div>

          {/* WRITE REVIEW FORM */}
          {user ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '3rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.5rem' }}>
                Write a Review
              </h3>

              {reviewMsg.text && (
                <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.88rem', background: reviewMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${reviewMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: reviewMsg.type === 'success' ? 'var(--green)' : '#ef4444' }}>
                  {reviewMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.75rem' }}>
                    Your rating {rating > 0 && <span style={{ color: 'var(--gold)', marginLeft: '0.5rem' }}>{'★'.repeat(rating)}</span>}
                  </div>
                  <Stars rating={rating} size={32} interactive onRate={setRating} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.5rem' }}>Your comment (optional)</div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.92rem', outline: 'none', resize: 'vertical', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <button type="submit" disabled={submitting || rating === 0}
                  style={{ padding: '0.85rem 2.5rem', background: rating > 0 ? 'var(--gold)' : 'var(--bg3)', color: rating > 0 ? '#080c10' : 'var(--text-soft)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: rating > 0 ? 'pointer' : 'not-allowed', fontFamily: 'Outfit,sans-serif', transition: 'all 0.2s', letterSpacing: '0.04em' }}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-soft)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>Sign in to share your experience with this product</p>
              <Link to="/login" style={{ padding: '0.75rem 2rem', background: 'var(--gold)', color: '#080c10', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem' }}>
                Sign In to Review
              </Link>
            </div>
          )}

          {/* REVIEWS LIST */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-soft)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>No reviews yet</div>
              <p>Be the first to review this product.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r.id}
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>{r.user_name}</div>
                      <Stars rating={r.rating} size={14} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {user && String(user.id) === String(r.user_id) && (
                        <button onClick={() => handleDeleteReview(r.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontFamily: 'Outfit,sans-serif', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.target.style.color = '#ef4444'}
                          onMouseLeave={e => e.target.style.color = 'var(--text-soft)'}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {r.comment && (
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  )
}

export default ProductDetail