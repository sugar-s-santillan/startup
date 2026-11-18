
import { useState } from 'react';
import FormInput from './FormInput.jsx';

export default function AddLeadForm({ onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const formData = new FormData(event.currentTarget);

    const fullName = String(formData.get('fullName') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const creditScore = String(formData.get('creditScore') || '').trim();
    const loanType = String(formData.get('loanType') || 'Purchase');
    const loanAmount = String(formData.get('loanAmount') || '').trim();

    setError('');

    if (!fullName || !address) {
      setError('Full name and property address are required.');
      return;
    }

    if (
      creditScore &&
      (!Number.isInteger(Number(creditScore)) ||
        Number(creditScore) < 300 ||
        Number(creditScore) > 850)
    ) {
      setError('Credit score must be between 300 and 850.');
      return;
    }

    if (
      loanAmount &&
      (!Number.isFinite(Number(loanAmount)) ||
        Number(loanAmount) <= 0)
    ) {
      setError('Loan amount must be greater than zero.');
      return;
    }

    const newLead = {
      fullName,
      address,
      creditScore,
      loanType,
      loanAmount,
    };

    setSaving(true);

    try {
      await onSave(newLead);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to save lead. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="add-lead-title">Add New Lead</h2>

          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="pricing-form" onSubmit={handleSubmit}>
          <FormInput
            label="Full Name"
            id="fullName"
            placeholder="John Doe"
            required
          />

          <FormInput
            label="Property Address"
            id="address"
            placeholder="123 Main Street"
            required
          />

          <FormInput
            label="Credit Score"
            id="creditScore"
            type="number"
            placeholder="720"
            min="300"
            max="850"
            step="1"
          />

          <div className="form-group">
            <label htmlFor="loanType">Loan Type</label>
            <select
              id="loanType"
              name="loanType"
              defaultValue="Purchase"
              disabled={saving}
            >
              <option value="Purchase">Purchase</option>
              <option value="Refinance">Refinance</option>
            </select>
          </div>

          <FormInput
            label="Loan Amount"
            id="loanAmount"
            type="number"
            placeholder="250000"
            min="1"
            step="0.01"
          />

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? 'Saving Lead...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
