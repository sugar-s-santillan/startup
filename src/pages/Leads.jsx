import { useState } from 'react';
import { Link } from 'react-router-dom';

import PageLayout from '../components/PageLayout.jsx';
import AddLeadForm from '../components/AddLeadForm.jsx';

export default function Leads() {
  const [showAddLead, setShowAddLead] = useState(false);

  return (
    <PageLayout>
      <div className="page-container">

        {/* Page heading */}
        <section className="dashboard-heading">
          <div>
            <h1>Mortgage Pricer + Lender Matrix</h1>
            <p>Review your leads and access lender pricing.</p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => setShowAddLead(true)}
          >
            + Add Lead
          </button>
        </section>

        {/* Leads table */}
        <section className="table-card">
          <div className="table-heading">
            <h2>Leads</h2>
            <p>Borrowers currently in your pipeline.</p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Property Address</th>
                  <th>Credit Score</th>
                  <th>Loan Type</th>
                  <th>Date Added</th>
                  <th>Pricing</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>123 Main Street</td>
                  <td>720</td>
                  <td>Purchase</td>
                  <td>September 23, 2026</td>
                  <td>
                    <Link to="/pricing" className="table-link">
                      View Pricing
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Add Lead popup */}
      {showAddLead && (
        <AddLeadForm onClose={() => setShowAddLead(false)} />
      )}

    </PageLayout>
  );
}