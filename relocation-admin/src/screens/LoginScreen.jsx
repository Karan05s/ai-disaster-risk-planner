import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setErrorLocal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    setSubmitting(true);
    try {
      const userData = await login(email, password);
      if (userData.role === 'VIEWER') {
        setErrorLocal('Access restricted: Viewer role cannot access this panel');
        return;
      }
      navigate('/decisions', { replace: true });
    } catch (err) {
      setErrorLocal(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@sih.gov.in');
      setPassword('admin123');
    } else {
      setEmail('viewer@sih.gov.in');
      setPassword('admin123');
    }
  };

  return (
    <div className="stitch-login-container">
      <div className="stitch-login-card">
        {/* Header */}
        <div className="stitch-login-header">
          <h1 className="stitch-login-title">Relocation Admin Portal</h1>
          <p className="stitch-login-subtitle">Sign in to access the system.</p>
        </div>

        {/* Error Banner */}
        {(error || authError) && (
          <div className="stitch-login-error">
            {error || authError}
          </div>
        )}

        {/* Form */}
        <form className="stitch-login-form" onSubmit={handleSubmit}>
          <div className="stitch-login-field">
            <label className="stitch-login-label" htmlFor="email">Email Address</label>
            <input
              className="stitch-login-input"
              id="email"
              name="email"
              type="email"
              placeholder="admin@relocation.gov"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting || authLoading}
            />
          </div>
          <div className="stitch-login-field">
            <label className="stitch-login-label" htmlFor="password">Password</label>
            <input
              className="stitch-login-input"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting || authLoading}
            />
          </div>
          <div style={{ paddingTop: '8px' }}>
            <button
              className="stitch-login-button"
              type="submit"
              disabled={submitting || authLoading}
            >
              {submitting || authLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sign in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
          <div className="text-center" style={{ paddingTop: '16px' }}>
            <a className="stitch-login-forgot" href="#">Forgot your password?</a>
          </div>
        </form>
      </div>
    </div>
  );
}