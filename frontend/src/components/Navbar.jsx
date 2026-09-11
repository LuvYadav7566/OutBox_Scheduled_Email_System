import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
              <div className="user-badge">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
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
