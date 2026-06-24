import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration-side">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>

        <div className="illustration-content">
          <svg viewBox="0 0 400 400" className="business-illustration">
            {/* Ground shadow */}
            <ellipse cx="200" cy="370" rx="110" ry="14" fill="rgba(0,0,0,0.12)" />

            {/* Floating chart card */}
            <g className="float-slow">
              <rect x="30" y="60" width="100" height="75" rx="10" fill="#ffffff" opacity="0.95" />
              <rect x="42" y="100" width="10" height="22" rx="2" fill="#818cf8" />
              <rect x="58" y="88" width="10" height="34" rx="2" fill="#a78bfa" />
              <rect x="74" y="75" width="10" height="47" rx="2" fill="#818cf8" />
              <rect x="90" y="95" width="10" height="27" rx="2" fill="#a78bfa" />
              <circle cx="110" cy="72" r="5" fill="#34d399" />
            </g>

            {/* Floating coin/rupee */}
            <g className="float-fast">
              <circle cx="330" cy="90" r="26" fill="#fbbf24" />
              <text x="330" y="98" fontSize="22" fontWeight="700" fill="#92400e" textAnchor="middle">₹</text>
            </g>

            {/* Person body */}
            <g className="float-slow">
              {/* legs */}
              <rect x="170" y="290" width="22" height="70" rx="8" fill="#1f2937" />
              <rect x="208" y="290" width="22" height="70" rx="8" fill="#1f2937" />
              {/* shoes */}
              <rect x="166" y="355" width="32" height="12" rx="6" fill="#111827" />
              <rect x="204" y="355" width="32" height="12" rx="6" fill="#111827" />
              {/* body / suit */}
              <path d="M150 190 Q150 170 175 165 L225 165 Q250 170 250 190 L255 290 L145 290 Z" fill="#4f46e5" />
              {/* shirt */}
              <path d="M188 165 L200 200 L212 165 Z" fill="#ffffff" />
              {/* tie */}
              <path d="M196 180 L204 180 L208 230 L200 245 L192 230 Z" fill="#f87171" />
              {/* left arm */}
              <path d="M150 190 Q120 200 110 240 Q108 250 118 252 Q128 254 132 244 Q140 215 160 200 Z" fill="#4f46e5" />
              {/* right arm raised (waving) */}
              <g className="wave-arm">
                <path d="M250 190 Q275 175 285 140 Q288 130 278 126 Q268 123 264 133 Q255 165 235 185 Z" fill="#4f46e5" />
                <circle cx="280" cy="128" r="13" fill="#f4a988" />
              </g>
              {/* head */}
              <circle cx="200" cy="140" r="32" fill="#f4a988" />
              {/* hair */}
              <path d="M170 130 Q170 105 200 105 Q230 105 230 130 Q230 115 200 113 Q172 115 170 130 Z" fill="#1f2937" />
              {/* smile */}
              <path d="M188 150 Q200 158 212 150" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* eyes */}
              <circle cx="190" cy="138" r="2.5" fill="#1f2937" />
              <circle cx="210" cy="138" r="2.5" fill="#1f2937" />
            </g>

            {/* Briefcase */}
            <g className="float-fast">
              <rect x="95" y="270" width="38" height="28" rx="4" fill="#7c3aed" />
              <rect x="106" y="262" width="16" height="10" rx="2" fill="none" stroke="#7c3aed" strokeWidth="3" />
            </g>
          </svg>

          <h2 className="illustration-title">Manage Your Business Smarter</h2>
          <p className="illustration-text">Inventory, billing and analytics — all in one place.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Login to your VyaparSathi account</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-extra-row">
              <Link to="/forgot-password" className="link-text">Forgot password?</Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="switch-auth-text">
            Don't have an account? <Link to="/register" className="link-text">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;