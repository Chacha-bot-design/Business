import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Fixed import path
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(username, password);
    
    if (!result.success) {
      alert(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Business System Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="form-hint">Use "password" for all demo accounts</div>
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="demo-accounts">
          <h6>Demo Accounts:</h6>
          <ul className="accounts-list">
            <li><strong>Boss:</strong> username: "boss", password: "password"</li>
            <li><strong>Manager:</strong> username: "manager", password: "password"</li>
            <li><strong>Seller:</strong> username: "seller1", password: "password"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;