import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .auth-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #0a0a0f;
    color: #f0ede8;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .auth-left {
    background: #0f0e14;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
  }
  .auth-left::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-brand {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 900;
    background: linear-gradient(135deg, #f0ede8, #c9a96e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
  }
  .auth-left-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .auth-left-title {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
  }
  .auth-left-title em {
    font-style: italic;
    background: linear-gradient(135deg, #c9a96e, #f0d9a8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .auth-left-desc {
    font-size: 1rem;
    color: rgba(240,237,232,0.45);
    line-height: 1.8;
    font-weight: 300;
    max-width: 320px;
  }
  .perks { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.9rem; }
  .perk {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: rgba(240,237,232,0.5);
  }
  .perk-dot {
    width: 6px; height: 6px;
    background: #c9a96e;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .auth-left-footer { font-size: 0.8rem; color: rgba(240,237,232,0.2); }

  .auth-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    overflow-y: auto;
  }
  .auth-box {
    width: 100%;
    max-width: 400px;
    animation: fadeUp 0.7s ease both;
  }
  .auth-box-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .auth-box-sub {
    font-size: 0.9rem;
    color: rgba(240,237,232,0.45);
    margin-bottom: 2.5rem;
    font-weight: 300;
  }

  .form-group { margin-bottom: 1.2rem; }
  .form-label {
    display: block;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.5);
    margin-bottom: 0.5rem;
  }
  .form-input {
    width: 100%;
    padding: 0.85rem 1.1rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #f0ede8;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.25s ease;
  }
  .form-input::placeholder { color: rgba(240,237,232,0.25); }
  .form-input:focus {
    border-color: #c9a96e;
    background: rgba(201,169,110,0.06);
  }

  .btn-submit {
    width: 100%;
    padding: 0.95rem;
    background: #c9a96e;
    color: #0a0a0f;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .btn-submit:hover:not(:disabled) { background: #e2c08a; transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .auth-error {
    background: rgba(220,50,50,0.1);
    border: 1px solid rgba(220,50,50,0.25);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.88rem;
    color: #ff7875;
    margin-bottom: 1.2rem;
  }
  .auth-switch {
    text-align: center;
    font-size: 0.88rem;
    color: rgba(240,237,232,0.4);
  }
  .auth-switch a { color: #c9a96e; text-decoration: none; }
  .auth-switch a:hover { text-decoration: underline; }

  .password-hint {
    font-size: 0.78rem;
    color: rgba(240,237,232,0.3);
    margin-top: 0.4rem;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .auth-root { grid-template-columns: 1fr; }
    .auth-left { display: none; }
  }
`

function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">

        {/* LEFT */}
        <div className="auth-left">
          <Link to="/" className="auth-brand">Luxe Store</Link>
          <div className="auth-left-content">
            <h2 className="auth-left-title">Join<br /><em>Luxe</em><br />today.</h2>
            <p className="auth-left-desc">Create your account and unlock access to thousands of curated premium products.</p>
            <div className="perks">
              {['Free shipping on first order', 'Exclusive member discounts', 'Early access to new arrivals', 'Secure checkout always'].map((p, i) => (
                <div key={i} className="perk">
                  <div className="perk-dot"></div>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-left-footer">© 2025 Luxe Store</div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-box">
            <h1 className="auth-box-title">Create account</h1>
            <p className="auth-box-sub">It's free and takes less than a minute</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" placeholder="John Doe" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
                <p className="password-hint">Minimum 8 characters recommended</p>
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

export default Register