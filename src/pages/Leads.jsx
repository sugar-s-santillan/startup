import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageLayout from '../components/PageLayout.jsx';
import AddLeadForm from '../components/AddLeadForm.jsx';

import Icon from '../components/Icon.jsx';

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
    link.download = 'mortgage-leads.csv';
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
            <p className="page-label">YOUR WORKSPACE</p>
            <h1>Lead overview</h1>
            <p>
              A clear view of your pipeline. Every borrower, every opportunity.
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
            <Icon name="plus" /> Add Lead
          </button>
        </section>

        <section className="dashboard-stats" aria-label="Pipeline statistics">
          {[
            { label: 'Total Leads', value: statistics.total, icon: 'users', note: 'In your pipeline' },
            { label: 'Purchase Loans', value: statistics.purchases, icon: 'home', note: 'New property financing' },
            { label: 'Refinance Loans', value: statistics.refinances, icon: 'refresh', note: 'Existing property financing' },
            { label: 'Requested Loan Volume', value: formatCurrency(statistics.totalVolume), icon: 'money', note: 'Across your entire pipeline' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-label"><span>{stat.label}</span><Icon name={stat.icon} /></div>
              <h2>{loading ? '—' : stat.value}</h2>
              <p>{stat.note}</p>
            </div>
          ))}
        </section>

        <section className="table-card leads-card" aria-label="Lead pipeline">
          <div className="table-heading"><div><h2>Your leads <span className="count-badge">{leads.length}</span></h2><p>Manage borrower details and explore lender options.</p></div><span className="section-label">PIPELINE</span></div>
          {/* Search and filtering controls */}
          <div className="leads-toolbar">
            <div className="search-field"><Icon name="search" />
            <input
              type="text"
              placeholder="Search name, address, or loan type…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search leads"
            />
            </div>

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
              <Icon name="download" /> Export CSV
            </button>
          </div>

          <p className="results-count" aria-live="polite">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>

          {loading && <div className="table-state" role="status"><span className="loading-indicator" /><h3>Loading your pipeline</h3><p>Getting your latest lead information…</p></div>}

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
                    <td><span className="borrower-name">{lead.fullName}</span></td>
                    <td className="address-cell">{lead.address}</td>
                    <td>{lead.creditScore || '—'}</td>
                    <td><span className={`loan-badge ${lead.loanType?.toLowerCase() === 'refinance' ? 'refinance' : 'purchase'}`}>{lead.loanType}</span></td>
                    <td className="money-cell">
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
                        View pricing <Icon name="arrow" />
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="delete-button"
                        aria-label={`Delete lead for ${lead.fullName}`}
                        disabled={deletingId !== null}
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        <Icon name="trash" /> {deletingId === lead.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading &&
              !error &&
              filteredLeads.length === 0 && (
                <div className="table-state"><span className="empty-icon"><Icon name="users" /></span><h3>{leads.length === 0 ? 'Your pipeline starts here' : 'No matching leads'}</h3><p>
                  {leads.length === 0
                    ? 'No leads yet. Add your first lead.'
                    : 'Try a different search or loan type.'}
                </p></div>
              )}
          </div>
        </section>
        {quote && <aside className="daily-quote"><Icon name="quote" /><span><strong>A moment of perspective</strong> {quote}</span></aside>}
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
