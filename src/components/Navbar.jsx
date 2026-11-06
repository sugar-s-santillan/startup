
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      <nav className="page-container navbar-content">
        <Link to="/leads" className="brand">
          Prometheus Mortgage
        </Link>

        <div className="navbar-actions">
          {showBackButton && (
            <Link to="/leads" className="back-link">
              ← Back to Leads
            </Link>
          )}

          <span className="logged-in-user">
            {username}
          </span>

          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
