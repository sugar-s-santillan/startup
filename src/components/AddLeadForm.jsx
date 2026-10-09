import FormInput from './FormInput.jsx';

export default function AddLeadForm() {
  return (
    <section className="content-card">
      <div className="card-heading">
        <h2>Add New Lead</h2>
        <p>Enter borrower information below.</p>
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

        <button type="button" className="primary-button">
          Add Lead
        </button>
      </form>
    </section>
  );
}