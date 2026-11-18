import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageLayout from '../components/PageLayout.jsx';
import AddLeadForm from '../components/AddLeadForm.jsx';

export default function Leads() {
  const navigate = useNavigate();

  const [showAddLead, setShowAddLead] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loanFilter, setLoanFilter] = useState('all');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  function handleUnauthorized(response) {
    if (response.status === 401) {
      navigate('/', { replace: true });
      return true;
    }
    return false;
  }

  // Load saved leads from MongoDB.
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
          throw new Error('Unable to load leads.');
        }

        const data = await response.json();

        if (active) {
          setLeads(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadQuote() {
      try {
        const response = await fetch('https://quote.cs260.click');
        if (!response.ok) return;

        const data = await response.json();
        if (active) setQuote(data.quote || '');
      } catch {
        // Quotes are optional.
      }
    }

    loadLeads();
    loadQuote();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Calculate dashboard statistics.
  const statistics = useMemo(() => {
    const purchases = leads.filter(
      (lead) => lead.loanType?.toLowerCase() === 'purchase'
    ).length;

    const refinances = leads.filter(
      (lead) => lead.loanType?.toLowerCase() === 'refinance'
    ).length;

    const totalVolume = leads.reduce(
      (total, lead) => total + (Number(lead.loanAmount) || 0),
      0
    );

    return {
      total: leads.length,
      purchases,
      refinances,
      totalVolume,
    };
  }, [leads]);

  // Search, filter, and sort leads.
  const filteredLeads = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const results = leads.filter((lead) => {
      const matchesSearch =
        String(lead.fullName || '').toLowerCase().includes(searchText) ||
        String(lead.address || '').toLowerCase().includes(searchText) ||
        String(lead.loanType || '').toLowerCase().includes(searchText);

      const matchesType =
        loanFilter === 'all' ||
        String(lead.loanType || '').toLowerCase() === loanFilter;

      return matchesSearch && matchesType;
    });

    return results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);

        case 'amount-high':
          return Number(b.loanAmount || 0) -
            Number(a.loanAmount || 0);

        case 'amount-low':
          return Number(a.loanAmount || 0) -
            Number(b.loanAmount || 0);

        case 'oldest':
          return new Date(a.dateAdded) - new Date(b.dateAdded);

        case 'newest':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });
  }, [leads, search, sortBy, loanFilter]);

  // Create a lead in MongoDB.
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
        throw new Error('Your session has expired.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Unable to save lead.');
      }

      setLeads((previous) => [...previous, data]);
      setShowAddLead(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Delete a lead from MongoDB.
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

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        throw new Error('Unable to delete lead.');
      }

      setLeads((previous) =>
        previous.filter((lead) => lead.id !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Export filtered leads as a CSV file.
  function exportLeads() {
    if (filteredLeads.length === 0) return;

    const headers = [
      'Full Name',
      'Property Address',
      'Credit Score',
      'Loan Type',
      'Loan Amount',
      'Date Added',
    ];

    const rows = filteredLeads.map((lead) => [
      lead.fullName,
      lead.address,
      lead.creditScore,
      lead.loanType,
      lead.loanAmount,
      lead.dateAdded,
    ]);

    const escapeCSV = (value) => {
      let text = String(value ?? '');

      // Prevent spreadsheet programs from executing CSV formulas.
      if (/^[\s]*[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'prometheus-leads.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <PageLayout>
      <div className="page-container">

        <section className="dashboard-heading">
          <div>
            <h1>Mortgage Pricer + Lender Matrix</h1>
            <p>
              Manage your leads, review loan activity,
              and access lender pricing.
            </p>
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

        {/* Dashboard statistics */}
        <section
          className="dashboard-stats"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {[
            { label: 'Total Leads', value: statistics.total },
            { label: 'Purchase Loans', value: statistics.purchases },
            { label: 'Refinance Loans', value: statistics.refinances },
            {
              label: 'Requested Loan Volume',
              value: formatCurrency(statistics.totalVolume),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="table-card"
              style={{ padding: '20px' }}
            >
              <p style={{ marginBottom: '8px' }}>
                {stat.label}
              </p>
              <h2 style={{ margin: 0 }}>
                {stat.value}
              </h2>
            </div>
          ))}
        </section>

        {quote && (
          <section className="table-card">
            <p>
              <strong>Quote of the Day:</strong> {quote}
            </p>
          </section>
        )}

        <section className="table-card">

          {/* Search and filtering controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search leads"
              style={{ flex: '2 1 200px' }}
            />

            <select
              value={loanFilter}
              onChange={(event) => setLoanFilter(event.target.value)}
              aria-label="Filter by loan type"
            >
              <option value="all">All Loan Types</option>
              <option value="purchase">Purchase</option>
              <option value="refinance">Refinance</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort leads"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A–Z</option>
              <option value="amount-high">Highest Loan Amount</option>
              <option value="amount-low">Lowest Loan Amount</option>
            </select>

            <button
              type="button"
              className="secondary-button"
              onClick={exportLeads}
              disabled={filteredLeads.length === 0}
            >
              Export CSV
            </button>
          </div>

          <p>
            Showing {filteredLeads.length} of {leads.length} leads
          </p>

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
                  <th>Loan Amount</th>
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
                    <td>{lead.creditScore || '—'}</td>
                    <td>{lead.loanType}</td>
                    <td>
                      {lead.loanAmount
                        ? formatCurrency(Number(lead.loanAmount))
                        : '—'}
                    </td>
                    <td>{lead.dateAdded}</td>
                    <td>
                      <Link
                        to="/pricing"
                        className="table-link"
                      >
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

            {!loading &&
              !error &&
              filteredLeads.length === 0 && (
                <p>
                  {leads.length === 0
                    ? 'No leads yet. Add your first lead.'
                    : 'No leads match your filters.'}
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
