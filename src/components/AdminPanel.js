import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageManager from './admin/ImageManager';
import GameStats from './admin/GameStats';
import '../styles.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already authenticated from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/adminLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_token', data.token);
      } else {
        setError(data.error || 'Invalid password.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_token');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-container">
          <h1>🔒 Admin Panel</h1>
          <p>Please enter the admin password to continue</p>
          
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="admin-password-input"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="admin-login-button"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
          
          {error && <div className="admin-error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🎮 UBCguessr Admin Panel</h1>
        <button onClick={handleLogout} className="admin-logout-btn">
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Game Statistics
        </button>
        <button 
          className={`admin-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          🖼️ Image Manager
        </button>
        <button 
          className={`admin-tab ${activeTab === 'difficulty' ? 'active' : ''}`}
          onClick={() => setActiveTab('difficulty')}
        >
          ⚙️ Difficulty Assignment
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'stats' && <GameStats />}
        {activeTab === 'images' && <ImageManager />}
        {activeTab === 'difficulty' && (
          <div>
            <p>Redirecting to difficulty assignment...</p>
            <button onClick={() => navigate('/admin/image-difficulty')} className="admin-login-button">
              Go to Difficulty Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
