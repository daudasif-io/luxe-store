import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .fp-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #0a0a0f;
    color: #f0ede8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
  }
  .fp-root::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .fp-card {
    width: 100%;
    max-width: 440px;
    background: #0f0e14;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 3rem;
    animation: fadeUp 0.7s ease both;
    position: relative;
  }

  .fp-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #f0ede8, #c9a96e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
    display: block;
    margin-bottom: 2.5rem;
  }

  .fp-icon {
    width: 52px; height: 52px;
    background: rgba(201,169,110,0.12);
    border: 1px solid rgba(201,169,110,0.25);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
  }

  .fp-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.6rem;
  }
  .fp-desc {
    font-size: 0.9rem;
    color: rgba(240,237,232,0.45);
    line-height: 1.7;
    font-weight: 300;
    margin-bottom: 2rem;
  }

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
    margin-bottom: 1.5rem;
  }
  .form-input::placeholder { color: rgba(240,237,232,0.25); }
  .form-input:focus { border-color: #c9a96e; background: rgba(201,169,110,0.06); }

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
    margin-bottom: 1.5rem;
  }
  .btn-submit:hover:not(:disabled) { background: #e2c08a; transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .fp-success {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 12px;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }
  .fp-success-title {
    font-weight: 500;
    color: #4ade80;
    margin-bottom: 0.4rem;
    font-size: 0.95rem;
  }
  .fp-success-desc {
    font-size: 0.85rem;
    color: rgba(74,222,128,0.65);
    line-height: 1.6;
  }

  .fp-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.88rem;
    color: rgba(240,237,232,0.4);
    text-decoration: none;
    transition: color 0.2s;
  }
  .fp-back:hover { color: #c9a96e; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="fp-root">
        <div className="fp-card">
          <Link to="/" className="fp-logo">Luxe Store</Link>
          <div className="fp-icon">✉</div>
          <h1 className="fp-title">Forgot password?</h1>
          <p className="fp-desc">No worries. Enter your email and we will send you a reset link.</p>

          {sent ? (
            <div className="fp-success">
              <div className="fp-success-title">Check your terminal</div>
              <div className="fp-success-desc">
                A reset link has been printed in your Flask terminal. Copy it and open it in your browser.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <Link to="/login" className="fp-back">← Back to sign in</Link>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword