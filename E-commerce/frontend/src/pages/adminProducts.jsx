import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import '../index.css'

import API_BASE from '../api';
const API = API_BASE
const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '' }

function AdminProducts() {
  const [products, setProducts]   = useState([])
  const [form, setForm]           = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview]     = useState(null)
  const [editId, setEditId]       = useState(null)
  const [message, setMessage]     = useState({ text: '', type: '' })
  const [loading, setLoading]     = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef                   = useRef()
  const navigate                  = useNavigate()

  const token   = localStorage.getItem('token')
  const user    = JSON.parse(localStorage.getItem('user') || 'null')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    fetchProducts()
  }, [])

  const fetchProducts = () =>
    axios.get(`${API}/`).then(res => setProducts(res.data))

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImageChange = (file) => {
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleImageChange(file)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setMessage({ text: '', type: '' })
    try {
      const fd = new FormData()
      fd.append('name',        form.name)
      fd.append('description', form.description)
      fd.append('price',       form.price)
      fd.append('stock',       form.stock)
      if (imageFile) fd.append('image', imageFile)
      else if (form.image_url) fd.append('image_url', form.image_url)

      if (editId) {
        await axios.put(`${API}/${editId}`, fd, { headers })
        setMessage({ text: 'Product updated successfully!', type: 'success' })
      } else {
        await axios.post(`${API}/`, fd, { headers })
        setMessage({ text: 'Product added successfully!', type: 'success' })
      }
      setForm(emptyForm); setEditId(null)
      setImageFile(null); setPreview(null)
      fetchProducts()
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Something went wrong', type: 'error' })
    } finally { setLoading(false) }
  }

  const handleEdit = p => {
    setEditId(p.id)
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, image_url: '' })
    setImageFile(null)
    setPreview(p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${API_BASE}${p.image_url}`) : null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return
    await axios.delete(`${API}/${id}`, { headers })
    setMessage({ text: 'Product deleted.', type: 'success' })
    fetchProducts()
  }

  const cancelEdit = () => {
    setEditId(null); setForm(emptyForm)
    setImageFile(null); setPreview(null)
  }

  const inp = { width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.92rem', outline: 'none', fontFamily: 'Outfit,sans-serif', marginBottom: '1.2rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Outfit,sans-serif' }}>

      {/* NAV */}
      <nav style={{ padding: '0 3rem', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>LUXE</Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/admin/dashboard" style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>Dashboard</Link>
          <Link to="/products" style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>← Store</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Admin panel</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.5rem', fontWeight: 400, marginBottom: '2.5rem' }}>
          {editId ? 'Edit Product' : 'Add New Product'}
        </h1>

        {/* MESSAGE */}
        {message.text && (
          <div style={{ padding: '0.9rem 1.2rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
            {message.text}
          </div>
        )}

        {/* FORM CARD */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', marginBottom: '3rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

              {/* LEFT — form fields */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Product name *</label>
                <input style={inp} name="name" placeholder="e.g. Wireless Headphones" value={form.name} onChange={handleChange}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required />

                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Description</label>
                <textarea style={{ ...inp, height: '90px', resize: 'vertical' }} name="description" placeholder="Short product description..." value={form.description} onChange={handleChange}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Price ($) *</label>
                    <input style={inp} name="price" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Stock</label>
                    <input style={inp} name="stock" type="number" placeholder="0" value={form.stock} onChange={handleChange}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.4rem' }}>Or paste image URL</label>
                <input style={inp} name="image_url" placeholder="https://example.com/image.jpg" value={form.image_url} onChange={handleChange}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* RIGHT — image upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: '0.75rem' }}>Product image</label>

                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{ height: '220px', border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: dragOver ? 'var(--gold-pale)' : 'var(--bg3)', overflow: 'hidden', position: 'relative' }}>
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,12,16,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: 'var(--text)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>CHANGE IMAGE</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>◈</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', textAlign: 'center' }}>
                        Drop image here or <span style={{ color: 'var(--gold)' }}>browse</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '0.4rem', opacity: 0.6 }}>PNG, JPG, WEBP up to 5MB</div>
                    </>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImageChange(e.target.files[0])} />

                {imageFile && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>📎 {imageFile.name}</span>
                    <button type="button" onClick={() => { setImageFile(null); setPreview(null) }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button type="submit" disabled={loading}
                style={{ padding: '0.85rem 2.5rem', background: 'var(--gold)', color: '#080c10', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'Outfit,sans-serif', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'var(--gold-light)'}
                onMouseLeave={e => e.target.style.background = 'var(--gold)'}>
                {loading ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
              {editId && (
                <button type="button" onClick={cancelEdit}
                  style={{ padding: '0.85rem 2rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-soft)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', fontWeight: 400, marginBottom: '1.5rem' }}>
          All Products <span style={{ fontSize: '1rem', color: 'var(--text-soft)', fontFamily: 'Outfit,sans-serif', fontWeight: 400 }}>({products.length})</span>
        </h2>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {products.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-soft)' }}>No products yet. Add your first one above!</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Image', 'Name', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '1rem 1.2rem', fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      {p.image_url ? (
                        <img src={p.image_url.startsWith('http') ? p.image_url : `http://localhost:5000${p.image_url}`} alt={p.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', background: 'var(--bg3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0.4 }}>◈</div>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.92rem', color: 'var(--text)', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.92rem', color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.05rem' }}>${Number(p.price).toFixed(2)}</td>
                    <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.88rem', color: p.stock > 0 ? 'rgba(34,197,94,0.8)' : 'var(--text-soft)' }}>{p.stock}</td>
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <button onClick={() => handleEdit(p)}
                        style={{ padding: '0.4rem 1rem', background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Outfit,sans-serif', marginRight: '0.5rem' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ padding: '0.4rem 1rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Outfit,sans-serif' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProducts