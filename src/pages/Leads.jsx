import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import PageLayout from '../components/PageLayout.jsx';
import AddLeadForm from '../components/AddLeadForm.jsx';

export default function Leads() {
  const [showAddLead, setShowAddLead] = useState(false);
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch('/api/leads');

        if (!response.ok) {
          throw new Error('Unable to load leads');
        }

        const data = await response.json();
        setLeads(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    async function loadQuote() {
      try {
        const response = await fetch('https://quote.cs260.click');

        if (!response.ok) {
          throw new Error('Unable to load quote');
        }

        const data = await response.json();
        setQuote(data.quote || '');
      } catch (err) {
        console.error('Third-party API error:', err);
      }
    }

    loadLeads();
    loadQuote();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const searchText = search.toLowerCase();

    return (
      lead.fullName.toLowerCase().includes(searchText) ||
      lead.address.toLowerCase().includes(searchText)
    );
  });

  async function handleAddLead(newLead) {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLead),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Unable to save lead');
    }

    setLeads((previousLeads) => [...previousLeads, data]);
  }

  return (
    <PageLayout>
      <div className="page-container">
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

        {quote && (
          <section className="table-card">
            <p>
              <strong>Quote of the Day:</strong> {quote}
            </p>
          </section>
        )}

        <section className="table-card">
          <div className="form-group">
            <input
              type="text"
              placeholder="Search by name or property address..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search leads"
            />
          </div>

          {loading && <p>Loading leads...</p>}
          {error && <p role="alert">{error}</p>}

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
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.fullName}</td>
                    <td>{lead.address}</td>
                    <td>{lead.creditScore}</td>
                    <td>{lead.loanType}</td>
                    <td>{lead.dateAdded}</td>
                    <td>
                      <Link to="/pricing" className="table-link">
                        View Pricing
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && !error && filteredLeads.length === 0 && (
              <p>No leads found.</p>
            )}
          </div>
        </section>
      </div>

      {showAddLead && (
        <AddLeadForm
          onClose={() => setShowAddLead(false)}
          onSave={handleAddLead}
        />
      )}
    </PageLayout>
  );
}
