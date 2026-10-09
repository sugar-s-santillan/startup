import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout.jsx';

export default function Leads() {
  return (
    <PageLayout>
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
    </PageLayout>
  );
}