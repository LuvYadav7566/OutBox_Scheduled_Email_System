import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(storedUser);
    } catch (e) {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const getInitial = (name) => {
    if (!name) return '👤';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">✉️</div>
          <span>Scheduled Email System</span>
        </Link>

        {user ? (
          <nav className="navbar-nav">
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/compose"
              className={`nav-link ${location.pathname === '/compose' ? 'active' : ''}`}
            >
              Compose
            </Link>

            <div className="user-section">
              <div className="user-profile-pill">
                <div className="user-avatar">
                  {getInitial(user.name)}
                </div>
                <div className="user-badge">
                  <span className="user-name">{user.name || 'User'}</span>
                  {user.email && <span className="user-email">{user.email}</span>}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
                Logout
              </button>
            </div>
          </nav>
        ) : (
          <nav className="navbar-nav">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
