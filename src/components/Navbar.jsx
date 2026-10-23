import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ showBackButton = false }) {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Guest';

  function handleLogout() {
    localStorage.removeItem('username');
    navigate('/');
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
