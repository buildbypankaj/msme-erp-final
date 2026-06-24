import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';

function Register() {
  const [step, setStep] = useState(1); // 1 = register form, 2 = verify OTP
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setSuccess('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email: formData.email, otp });
      setSuccess('Email verified! Waiting for admin approval...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
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
            <ellipse cx="200" cy="370" rx="110" ry="14" fill="rgba(0,0,0,0.12)" />
            <g className="float-slow">
              <rect x="30" y="60" width="100" height="75" rx="10" fill="#ffffff" opacity="0.95" />
              <rect x="42" y="100" width="10" height="22" rx="2" fill="#818cf8" />
              <rect x="58" y="88" width="10" height="34" rx="2" fill="#a78bfa" />
              <rect x="74" y="75" width="10" height="47" rx="2" fill="#818cf8" />
              <rect x="90" y="95" width="10" height="27" rx="2" fill="#a78bfa" />
              <circle cx="110" cy="72" r="5" fill="#34d399" />
            </g>
            <g className="float-fast">
              <circle cx="330" cy="90" r="26" fill="#fbbf24" />
              <text x="330" y="98" fontSize="22" fontWeight="700" fill="#92400e" textAnchor="middle">₹</text>
            </g>
            <g className="float-slow">
              <rect x="170" y="290" width="22" height="70" rx="8" fill="#1f2937" />
              <rect x="208" y="290" width="22" height="70" rx="8" fill="#1f2937" />
              <rect x="166" y="355" width="32" height="12" rx="6" fill="#111827" />
              <rect x="204" y="355" width="32" height="12" rx="6" fill="#111827" />
              <path d="M150 190 Q150 170 175 165 L225 165 Q250 170 250 190 L255 290 L145 290 Z" fill="#4f46e5" />
              <path d="M188 165 L200 200 L212 165 Z" fill="#ffffff" />
              <path d="M196 180 L204 180 L208 230 L200 245 L192 230 Z" fill="#f87171" />
              <path d="M150 190 Q120 200 110 240 Q108 250 118 252 Q128 254 132 244 Q140 215 160 200 Z" fill="#4f46e5" />
              <g className="wave-arm">
                <path d="M250 190 Q275 175 285 140 Q288 130 278 126 Q268 123 264 133 Q255 165 235 185 Z" fill="#4f46e5" />
                <circle cx="280" cy="128" r="13" fill="#f4a988" />
              </g>
              <circle cx="200" cy="140" r="32" fill="#f4a988" />
              <path d="M170 130 Q170 105 200 105 Q230 105 230 130 Q230 115 200 113 Q172 115 170 130 Z" fill="#1f2937" />
              <path d="M188 150 Q200 158 212 150" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="190" cy="138" r="2.5" fill="#1f2937" />
              <circle cx="210" cy="138" r="2.5" fill="#1f2937" />
            </g>
            <g className="float-fast">
              <rect x="95" y="270" width="38" height="28" rx="4" fill="#7c3aed" />
              <rect x="106" y="262" width="16" height="10" rx="2" fill="none" stroke="#7c3aed" strokeWidth="3" />
            </g>
          </svg>
          <h2 className="illustration-title">
            {step === 1 ? 'Join VyaparSathi Today' : 'Verify Your Email'}
          </h2>
          <p className="illustration-text">
            {step === 1 ? 'Start managing your business the smart way.' : `OTP sent to ${formData.email}`}
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          {step === 1 ? (
            <>
              <h1 className="login-title">Create Account</h1>
              <p className="login-subtitle">Sign up for your VyaparSathi account</p>

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="login-title">Verify Email</h1>
              <p className="login-subtitle">Enter the 6-digit OTP sent to your email</p>

              {success && <p className="success-text">{success}</p>}

              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label>OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </>
          )}

          <p className="switch-auth-text">
            Already have an account? <Link to="/" className="link-text">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;