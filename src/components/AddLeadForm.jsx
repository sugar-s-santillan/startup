import { useState } from 'react';
import FormInput from './FormInput.jsx';

export default function AddLeadForm({ onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newLead = {
      fullName: formData.get('fullName'),
      address: formData.get('address'),
      creditScore: formData.get('creditScore'),
      loanType: formData.get('loanType'),
      loanAmount: formData.get('loanAmount'),
    };

    setSaving(true);
    setError('');

    try {
      await onSave(newLead);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
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
            onClick={onClose}
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
          />

          <div className="form-group">
            <label htmlFor="loanType">Loan Type</label>
            <select id="loanType" name="loanType">
              <option value="Purchase">Purchase</option>
              <option value="Refinance">Refinance</option>
            </select>
          </div>

          <FormInput
            label="Loan Amount"
            id="loanAmount"
            type="number"
            placeholder="250000"
          />

          {error && <p role="alert">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
