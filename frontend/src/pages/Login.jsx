import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 1. Add Remember Me Checkbox State
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      const { token, user } = res.data;

      // 2. Dynamic Storage Selection Based on Checkbox
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));
      
      // Save an indicator so the Navbar knows where to clear on logout
      storage.setItem('remembered', rememberMe ? 'true' : 'false');

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm rounded-3" style={{ width: '380px' }}>
        <h3 className="text-center mb-4 fw-bold text-dark">Login</h3>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Email address</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* 3. BOOTSTRAP CHECKBOX COMPONENT */}
          <div className="mb-3 form-check d-flex justify-content-between align-items-center">
            <div>
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="rememberMeCheck" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label small text-muted" htmlFor="rememberMeCheck">Remember me</label>
            </div>
          </div>

          <button type="submit" className="btn btn-dark w-100 fw-medium">Sign In</button>
        </form>
        <div className="text-center mt-3">
          <small className="text-muted">Don't have an account? <Link to="/register" className="text-decoration-none">Register</Link></small>
        </div>
      </div>
    </div>
  );
}