
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import Icon from './Icon.jsx';
import Brand from './Brand.jsx';

export default function Navbar({ showBackButton = false }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        return response.json();
      })
      .then((data) => setUsername(data.email))
      .catch(() => setUsername('Guest'));
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Unable to log out. Please try again.');
    }
  }

  return (
    <header className="dashboard-header">
      <nav className="page-container navbar-content" aria-label="Main navigation">
        <Link to="/leads" className="brand">
          <Brand />
        </Link>

        <div className="nav-links">
          <NavLink to="/leads"><Icon name="grid" /> Leads</NavLink>
          <NavLink to="/pricing"><Icon name="chart" /> Pricing</NavLink>
        </div>
        <div className="navbar-actions">
          <span className="user-avatar" aria-hidden="true">{username.slice(0, 1).toUpperCase() || 'M'}</span>
          <span className="logged-in-user" title={username}>
            {username}
          </span>

          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >
            <Icon name="logout" /> Log out
          </button>
        </div>
      </nav>
      {showBackButton && <div className="page-container back-nav"><Link to="/leads" className="back-link">← Back to leads</Link></div>}
    </header>
  );
}
