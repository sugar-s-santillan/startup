import { Link } from 'react-router-dom';

export default function Navbar({ showBackButton = false }) {
  return (
    <header className="dashboard-header">
      <nav className="page-container flex justify-between items-center">

        <Link to="/leads" className="brand">
          Prometheus Mortgage
        </Link>

        <div className="flex items-center gap-6">

          {showBackButton ? (
            <Link to="/leads" className="back-link">
              ← Back to Leads
            </Link>
          ) : (
            <>
              <span className="logged-in-user">
                Sugar Santillan
              </span>

              <Link to="/" className="logout-link">
                Log out
              </Link>
            </>
          )}

        </div>
      </nav>
    </header>
  );
}