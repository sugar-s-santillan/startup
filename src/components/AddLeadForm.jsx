import { useEffect, useRef } from 'react';
import FormInput from './FormInput.jsx';

export default function AddLeadForm({ onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay"
      aria-labelledby="add-lead-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
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

        <form onSubmit={(event) => event.preventDefault()}>
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
    </dialog>
  );
}
