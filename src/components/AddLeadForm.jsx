import FormInput from './FormInput.jsx';

export default function AddLeadForm({ onClose }) {
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

        <form className="pricing-form">
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

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="button" className="primary-button" disabled>
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}