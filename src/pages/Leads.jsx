import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

export default function Leads() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="dashboard-header">
        <nav className="page-container flex justify-between items-center">
          <Link to="/leads" className="brand">
            Prometheus Mortgage
          </Link>

          <div className="flex items-center gap-6">
            <span className="logged-in-user">Sugar Santillan</span>
            <Link to="/" className="logout-link">
              Log out
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="page-container">
          <section className="dashboard-heading">
            <div>
              <h1>Mortgage Pricer + Lender Matrix</h1>
              <p>Review your leads and access lender pricing.</p>
            </div>
          </section>

          <section className="table-card">
            <div className="table-heading">
              <h2>Leads</h2>
              <p>Leads stored in the application database</p>
            </div>

            <div className="table-wrapper">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Address</th>
                    <th>Credit Score</th>
                    <th>Loan Type</th>
                    <th>Date Entered</th>
                    <th>Pricing</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="borrower-name">John Doe</td>
                    <td>123 Main Street</td>
                    <td>720</td>
                    <td>
                      <span className="loan-type">Purchase</span>
                    </td>
                    <td>September 23, 2026</td>
                    <td>
                      <Link to="/pricing" className="pricing-link">
                        View Pricing
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
