
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageLayout from '../components/PageLayout.jsx';
import AddLeadForm from '../components/AddLeadForm.jsx';

export default function Leads() {
  const navigate = useNavigate();

  const [showAddLead, setShowAddLead] = useState(false);
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Redirect users whose session has expired.
  function handleUnauthorized(response) {
    if (response.status === 401) {
      navigate('/', { replace: true });
      return true;
    }

    return false;
  }

  // Load leads from MongoDB through the backend API.
  useEffect(() => {
    let active = true;

    async function loadLeads() {
      try {
        const response = await fetch('/api/leads', {
          credentials: 'same-origin',
        });

        if (response.status === 401) {
          navigate('/', { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load leads. Please try again.');
        }

        const data = await response.json();

        if (active) {
          setLeads(data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    async function loadQuote() {
      try {
        const response = await fetch('https://quote.cs260.click');

        if (!response.ok) {
          throw new Error('Unable to load quote');
        }

        const data = await response.json();

        if (active) {
          setQuote(data.quote || '');
        }
      } catch {
        // The quote is optional and should not block the dashboard.
      }
    }

    loadLeads();
    loadQuote();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Filter leads without modifying database records.
  const filteredLeads = leads.filter((lead) => {
    const searchText = search.trim().toLowerCase();

    return (
      lead.fullName.toLowerCase().includes(searchText) ||
      lead.address.toLowerCase().includes(searchText)
    );
  });

  // Save new leads to MongoDB.
  async function handleAddLead(newLead) {
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(newLead),
      });

      if (handleUnauthorized(response)) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Unable to save lead.');
      }

      setLeads((previousLeads) => [...previousLeads, data]);
      setShowAddLead(false);
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Delete only leads owned by the authenticated user.
  async function handleDeleteLead(id) {
    if (deletingId !== null) return;

    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(
        `/api/leads/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          credentials: 'same-origin',
        }
      );

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to delete lead. Please try again.');
      }

      setLeads((previousLeads) =>
        previousLeads.filter((lead) => lead.id !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
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
            onClick={() => {
              setError('');
              setShowAddLead(true);
            }}
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

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

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
                  <th>Actions</th>
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
                    <td>
                      <button
                        type="button"
                        disabled={deletingId !== null}
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        {deletingId === lead.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && !error && filteredLeads.length === 0 && (
              <p>
                {search.trim()
                  ? 'No leads match your search.'
                  : 'No leads found. Add your first lead to get started.'}
              </p>
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
